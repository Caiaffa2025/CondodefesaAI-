import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { analyzeCondoProblem } from '../lib/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  ShieldAlert, 
  FileText, 
  MapPin, 
  Building2, 
  Send, 
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  Info,
  Check,
  Gavel,
  Receipt,
  Ban,
  Users,
  Hammer,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '../lib/utils';

interface AnalysisFormProps {
  user: User;
  profile: UserProfile | null;
}

type Step = 1 | 2 | 3;

export default function AnalysisForm({ user, profile }: AnalysisFormProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    problemType: 'multa',
    customProblemType: '',
    description: '',
    condoName: '',
    condoAddress: '',
    location: '',
    managerName: '',
    numApartments: 0,
    numTowers: 0,
    triedToResolve: false
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateStep = (step: Step): boolean => {
    if (step === 1) {
      const isOther = formData.problemType === 'outro';
      const isDescriptionValid = formData.description.length >= 20;
      const isCustomTypeValid = !isOther || (formData.customProblemType && formData.customProblemType.length >= 3);
      return isDescriptionValid && !!formData.problemType && isCustomTypeValid;
    }
    if (step === 2) {
      return !!formData.condoName && !!formData.condoAddress && !!formData.location;
    }
    if (step === 3) {
      return !!formData.managerName && formData.numApartments > 0;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => (prev + 1) as Step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setTouched({
        ...touched,
        description: currentStep === 1,
        condoName: currentStep === 2,
        condoAddress: currentStep === 2,
        location: currentStep === 2,
        managerName: currentStep === 3,
        numApartments: currentStep === 3,
      });
      toast.error('Por favor, preencha os campos obrigatórios corretamente.');
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => (prev - 1) as Step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectApiKey = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      toast.info("Chave de API selecionada. Tente a análise novamente.");
    } else {
      toast.error("O seletor de chaves não está disponível neste ambiente.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setLoading(true);
    setError(null);

    try {
      const analysis = await analyzeCondoProblem(
        formData.problemType,
        formData.description,
        formData.condoName,
        formData.condoAddress,
        formData.location,
        formData.managerName,
        formData.numApartments,
        formData.numTowers,
        formData.triedToResolve
      );

      if (!analysis) {
        throw new Error("Falha ao gerar análise pela IA.");
      }

      const caseData = {
        userId: user.uid,
        ...formData,
        ...analysis,
        createdAt: new Date().toISOString()
      };

      const path = 'cases';
      const docRef = await addDoc(collection(db, path), caseData);
      
      toast.success('Análise concluída com sucesso!');

      if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && profile?.notificationsEnabled !== false) {
        new Notification('Nova Análise Jurídica', {
          body: `Sua análise para o condomínio ${formData.condoName} está pronta!`,
          icon: '/favicon.ico'
        });
      }

      navigate(`/caso/${docRef.id}`);
    } catch (err) {
      console.error("Error analyzing case", err);
      let errorMessage = "Ocorreu um erro ao processar sua análise. Por favor, tente novamente.";
      
      if (err instanceof Error) {
        errorMessage = err.message;
        if (err.message.includes('permission')) {
          errorMessage = "Erro de permissão ao salvar o caso. Verifique se você está logado corretamente.";
          try {
            handleFirestoreError(err, OperationType.CREATE, 'cases');
          } catch (fsErr) {
            console.error("Structured Firestore Error:", fsErr);
          }
        } else if (err.message.includes('quota')) {
          errorMessage = "Limite de uso atingido. Por favor, tente novamente mais tarde.";
        } else if (err.message.includes('API key') || err.message.includes('Chave de API') || err.message.includes('Configurar API')) {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: 'O Problema', icon: AlertCircle },
    { id: 2, title: 'O Condomínio', icon: Building2 },
    { id: 3, title: 'Gestão', icon: FileText },
  ];

  const problemTypes = [
    { id: 'multa', label: 'Multa Injusta', icon: ShieldAlert, description: 'Recebeu uma multa que considera indevida.' },
    { id: 'abuso_sindico', label: 'Abuso de Síndico', icon: Gavel, description: 'Ações autoritárias ou irregulares da gestão.' },
    { id: 'taxa_indevida', label: 'Taxa Indevida', icon: Receipt, description: 'Cobranças extras sem base legal ou assembleia.' },
    { id: 'abuso_taxas', label: 'Abuso na Cobrança', icon: Ban, description: 'Juros abusivos ou métodos de cobrança ilegais.' },
    { id: 'vizinhanca', label: 'Vizinhança', icon: Users, description: 'Barulho, infiltrações ou conflitos entre moradores.' },
    { id: 'obras_irregulares', label: 'Obras Irregulares', icon: Hammer, description: 'Reformas sem ART/RRT ou em horários proibidos.' },
    { id: 'outro', label: 'Outro', icon: MoreHorizontal, description: 'Outros problemas jurídicos condominiais.' }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:py-12">
      {/* Progress Indicator */}
      <div className="mb-10">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
          <motion.div 
            className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 z-0"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
          {steps.map((step) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: currentStep >= step.id ? '#2563eb' : '#f1f5f9',
                  color: currentStep >= step.id ? '#ffffff' : '#94a3b8',
                  scale: currentStep === step.id ? 1.1 : 1,
                }}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shadow-sm transition-all",
                  currentStep > step.id ? "bg-emerald-500 text-white" : ""
                )}
              >
                {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
              </motion.div>
              <span className={cn(
                "mt-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                currentStep >= step.id ? "text-blue-600" : "text-slate-400"
              )}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden"
      >
        <div className="bg-blue-600 p-8 md:p-10 text-white text-center relative overflow-hidden">
          <div className="relative z-10">
            <ShieldAlert className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 text-blue-200" />
            <h1 className="text-2xl md:text-3xl font-black mb-2 tracking-tight">Análise Inteligente</h1>
            <p className="text-blue-100 text-sm font-medium opacity-90 max-w-md mx-auto">
              {steps[currentStep - 1].title}: {currentStep === 1 ? 'Relate o ocorrido' : currentStep === 2 ? 'Dados do local' : 'Detalhes da gestão'}
            </p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/10 rounded-full -ml-12 -mb-12 blur-xl" />
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-10">
          {error && (
            <div className="bg-red-50 text-red-600 p-5 rounded-2xl flex flex-col gap-3 border border-red-100 mb-8">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
              {(error.includes('Chave de API') || error.includes('bloqueada') || error.includes('permissão')) && (window as any).aistudio && (
                <button
                  type="button"
                  onClick={handleSelectApiKey}
                  className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2.5 rounded-xl font-bold transition-colors self-start"
                >
                  Configurar Chave de API Manualmente
                </button>
              )}
            </div>
          )}

          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Qual o tipo de problema?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {problemTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, problemType: type.id as any })}
                        className={cn(
                          "flex items-start gap-4 p-5 rounded-[2rem] border-2 transition-all text-left group",
                          formData.problemType === type.id 
                            ? "border-blue-600 bg-blue-50 shadow-lg shadow-blue-100/50" 
                            : "border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50"
                        )}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                          formData.problemType === type.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600"
                        )}>
                          <type.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className={cn(
                            "font-black text-sm uppercase tracking-tight mb-1",
                            formData.problemType === type.id ? "text-blue-700" : "text-slate-700"
                          )}>
                            {type.label}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium leading-tight">
                            {type.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {formData.problemType === 'outro' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-600" />
                        Especifique o problema *
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.customProblemType}
                        onBlur={() => setTouched({ ...touched, customProblemType: true })}
                        onChange={(e) => setFormData({ ...formData, customProblemType: e.target.value })}
                        placeholder="Ex: Problema com vaga de garagem"
                        className={cn(
                          "w-full px-5 py-4 rounded-2xl border bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:shadow-md outline-none transition-all font-bold text-slate-700",
                          touched.customProblemType && (!formData.customProblemType || formData.customProblemType.length < 3) ? "border-red-300" : "border-slate-100 focus:border-blue-600"
                        )}
                      />
                      {touched.customProblemType && (!formData.customProblemType || formData.customProblemType.length < 3) && (
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mt-1">Mínimo 3 caracteres</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Descreva o ocorrido *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onBlur={() => setTouched({ ...touched, description: true })}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Recebi uma multa por barulho em um dia que não estava em casa. O síndico não me deu direito de defesa..."
                    className={cn(
                      "w-full px-5 py-4 rounded-2xl border bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:shadow-md outline-none min-h-[180px] transition-all font-medium text-slate-700",
                      touched.description && formData.description.length < 20 ? "border-red-300" : "border-slate-100 focus:border-blue-600"
                    )}
                  />
                  <div className="flex justify-between mt-2">
                    <p className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      formData.description.length < 20 ? "text-slate-400" : "text-emerald-500"
                    )}>
                      {formData.description.length < 20 ? `Mínimo 20 caracteres (${formData.description.length}/20)` : 'Descrição válida'}
                    </p>
                    {touched.description && formData.description.length < 20 && (
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Campo obrigatório</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      Nome do Condomínio *
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.condoName}
                      onBlur={() => setTouched({ ...touched, condoName: true })}
                      onChange={(e) => setFormData({ ...formData, condoName: e.target.value })}
                      placeholder="Ex: Edifício Solar das Palmeiras"
                      className={cn(
                        "w-full px-5 py-4 rounded-2xl border bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:shadow-md outline-none transition-all font-bold text-slate-700",
                        touched.condoName && !formData.condoName ? "border-red-300" : "border-slate-100 focus:border-blue-600"
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      Endereço Completo *
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.condoAddress}
                      onBlur={() => setTouched({ ...touched, condoAddress: true })}
                      onChange={(e) => setFormData({ ...formData, condoAddress: e.target.value })}
                      placeholder="Ex: Rua das Flores, 123 - Bairro Novo"
                      className={cn(
                        "w-full px-5 py-4 rounded-2xl border bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:shadow-md outline-none transition-all font-bold text-slate-700",
                        touched.condoAddress && !formData.condoAddress ? "border-red-300" : "border-slate-100 focus:border-blue-600"
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      Cidade / Estado *
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.location}
                      onBlur={() => setTouched({ ...touched, location: true })}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Ex: São Paulo / SP"
                      className={cn(
                        "w-full px-5 py-4 rounded-2xl border bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:shadow-md outline-none transition-all font-bold text-slate-700",
                        touched.location && !formData.location ? "border-red-300" : "border-slate-100 focus:border-blue-600"
                      )}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      Nome do Síndico(a) *
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.managerName}
                      onBlur={() => setTouched({ ...touched, managerName: true })}
                      onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                      placeholder="Ex: João da Silva"
                      className={cn(
                        "w-full px-5 py-4 rounded-2xl border bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:shadow-md outline-none transition-all font-bold text-slate-700",
                        touched.managerName && !formData.managerName ? "border-red-300" : "border-slate-100 focus:border-blue-600"
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      Nº de Apartamentos *
                    </label>
                    <input
                      required
                      type="number"
                      value={formData.numApartments || ''}
                      onBlur={() => setTouched({ ...touched, numApartments: true })}
                      onChange={(e) => setFormData({ ...formData, numApartments: parseInt(e.target.value) || 0 })}
                      placeholder="Ex: 120"
                      className={cn(
                        "w-full px-5 py-4 rounded-2xl border bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:shadow-md outline-none transition-all font-bold text-slate-700",
                        touched.numApartments && formData.numApartments <= 0 ? "border-red-300" : "border-slate-100 focus:border-blue-600"
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      Número de Torres
                    </label>
                    <input
                      type="number"
                      value={formData.numTowers || ''}
                      onChange={(e) => setFormData({ ...formData, numTowers: parseInt(e.target.value) || 0 })}
                      placeholder="Ex: 2"
                      className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:shadow-md focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                    />
                  </div>
                </div>

                <div 
                  onClick={() => setFormData({ ...formData, triedToResolve: !formData.triedToResolve })}
                  className={cn(
                    "flex items-start gap-4 p-6 rounded-3xl border-2 cursor-pointer transition-all",
                    formData.triedToResolve 
                      ? "bg-blue-50 border-blue-600 shadow-md" 
                      : "bg-slate-50 border-slate-100 hover:border-slate-200"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all",
                    formData.triedToResolve ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-300"
                  )}>
                    {formData.triedToResolve && <Check className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 mb-1">Já tentei resolver amigavelmente</p>
                    <p className="text-xs text-slate-500 leading-relaxed">Assinale se você já conversou com o síndico ou administradora sobre este problema.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-4 px-8 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
              >
                <ChevronLeft className="w-5 h-5" />
                Voltar
              </button>
            )}
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-[2] py-4 px-8 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
              >
                Próximo Passo
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                disabled={loading}
                type="submit"
                className="flex-[2] py-4 px-8 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2 text-sm uppercase tracking-widest disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Gerar Análise
                  </>
                )}
              </button>
            )}
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 opacity-40 grayscale">
            <ShieldAlert className="w-6 h-6" />
            <Building2 className="w-6 h-6" />
            <FileText className="w-6 h-6" />
          </div>

          <div className="mt-8 p-5 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
              <strong>Nota:</strong> Suas informações são tratadas com sigilo absoluto e utilizadas apenas para o processamento da inteligência artificial. O CondoDefesa AI não substitui a orientação de um advogado.
            </p>
          </div>
        </form>
      </motion.div>

      <div className="mt-8 text-center">
        <Link 
          to="/dashboard" 
          className="text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors inline-flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Cancelar e voltar ao Dashboard
        </Link>
      </div>
    </div>
  );
}
