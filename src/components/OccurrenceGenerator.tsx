import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCcw, 
  Info,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  Users,
  Camera,
  Download,
  Copy,
  Printer,
  ChevronRight,
  ChevronLeft,
  Upload,
  X as CloseIcon,
  Image as ImageIcon
} from 'lucide-react';
import { generateOccurrenceReport, OccurrenceReportResult } from '../lib/gemini';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function OccurrenceGenerator() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OccurrenceReportResult | null>(null);
  const [formData, setFormData] = useState({
    problemType: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    location: '',
    involvedParties: '',
    evidence: ''
  });
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newImages = newFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleGenerate = async () => {
    if (!formData.problemType || !formData.description || !formData.location) {
      toast.error('Preencha os campos obrigatórios para gerar a ata.');
      return;
    }

    setLoading(true);
    try {
      // Convert images to base64 for AI analysis
      const imageParts = await Promise.all(images.map(async (img) => {
        return new Promise<{ data: string; mimeType: string }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve({ data: base64, mimeType: img.file.type });
          };
          reader.onerror = reject;
          reader.readAsDataURL(img.file);
        });
      }));

      const report = await generateOccurrenceReport(
        formData.problemType,
        formData.description,
        formData.date,
        formData.time,
        formData.location,
        formData.involvedParties,
        formData.evidence,
        imageParts
      );
      setResult(report);
      setStep(4);
      toast.success('Ata de ocorrência gerada com sucesso!');
    } catch (error) {
      console.error('Error generating report:', error);
      const message = error instanceof Error ? error.message : 'Erro ao gerar o documento. Tente novamente.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setResult(null);
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    setFormData({
      problemType: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location: '',
      involvedParties: '',
      evidence: ''
    });
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(`${result.title}\n\n${result.content}`);
      toast.success('Conteúdo copiado para a área de transferência!');
    }
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-10 sm:mb-12">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl text-blue-600 mb-4"
        >
          <FileText className="w-7 h-7 sm:w-8 h-8" />
        </motion.div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">Gerador de <span className="text-blue-600">Ata de Ocorrência</span></h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          Registre evidências de problemas condominiais de forma profissional e estruturada para o livro de ocorrências.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Progress Sidebar */}
        <div className="lg:col-span-3">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-24">
            <div className="space-y-6">
              {[
                { s: 1, label: 'O que houve?', icon: AlertCircle },
                { s: 2, label: 'Quando e Onde?', icon: MapPin },
                { s: 3, label: 'Detalhes Extras', icon: Users },
                { s: 4, label: 'Documento Pronto', icon: CheckCircle2 }
              ].map((item) => (
                <div key={item.s} className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-all",
                    step === item.s ? "bg-blue-600 text-white shadow-lg shadow-blue-100 scale-110" : 
                    step > item.s ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                  )}>
                    {step > item.s ? <CheckCircle2 className="w-4 h-4" /> : item.s}
                  </div>
                  <span className={cn(
                    "text-xs font-bold uppercase tracking-wider",
                    step === item.s ? "text-blue-600" : "text-slate-400"
                  )}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Form Area */}
        <div className="lg:col-span-9">
          <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden min-h-[500px] flex flex-col">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-8 sm:p-12 flex-grow"
                >
                  <h2 className="text-2xl font-black text-slate-900 mb-8">O que aconteceu?</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tipo de Ocorrência *</label>
                      <select 
                        value={formData.problemType}
                        onChange={(e) => setFormData({...formData, problemType: e.target.value})}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 transition-all font-bold text-slate-700"
                      >
                        <option value="">Selecione o tipo...</option>
                        <option value="Barulho Excessivo">Barulho Excessivo</option>
                        <option value="Infiltração / Vazamento">Infiltração / Vazamento</option>
                        <option value="Dano ao Patrimônio">Dano ao Patrimônio</option>
                        <option value="Conduta Inadequada">Conduta Inadequada</option>
                        <option value="Problema em Área Comum">Problema em Área Comum</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Descrição dos Fatos *</label>
                      <textarea 
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Descreva o que aconteceu de forma objetiva..."
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 transition-all font-bold text-slate-700 min-h-[150px]"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-8 sm:p-12 flex-grow"
                >
                  <h2 className="text-2xl font-black text-slate-900 mb-8">Quando e Onde?</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        Data *
                      </label>
                      <input 
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 transition-all font-bold text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        Hora Aproximada *
                      </label>
                      <input 
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 transition-all font-bold text-slate-700"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      Local da Ocorrência *
                    </label>
                    <input 
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="Ex: Salão de Festas, Unidade 402, Garagem G2..."
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 transition-all font-bold text-slate-700"
                    />
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-8 sm:p-12 flex-grow"
                >
                  <h2 className="text-2xl font-black text-slate-900 mb-8">Detalhes Adicionais</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        Partes Envolvidas
                      </label>
                      <input 
                        type="text"
                        value={formData.involvedParties}
                        onChange={(e) => setFormData({...formData, involvedParties: e.target.value})}
                        placeholder="Ex: Vizinho da unidade 501, Funcionário da limpeza..."
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 transition-all font-bold text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Camera className="w-3 h-3" />
                        Evidências e Fotos
                      </label>
                      <div className="space-y-4">
                        <textarea 
                          value={formData.evidence}
                          onChange={(e) => setFormData({...formData, evidence: e.target.value})}
                          placeholder="Ex: Vídeo do barulho, Testemunha do ocorrido, ou descreva as fotos anexadas..."
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 transition-all font-bold text-slate-700 min-h-[100px]"
                        />
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {images.map((img, idx) => (
                            <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                              <img src={img.preview} alt="Preview" className="w-full h-full object-cover" />
                              <button 
                                onClick={() => removeImage(idx)}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all z-10"
                                title="Remover imagem"
                              >
                                <CloseIcon className="w-3 h-3" />
                              </button>
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                          ))}
                          <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group">
                            <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500" />
                            <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-500 uppercase">Anexar Foto</span>
                            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && result && (
                <motion.div 
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 sm:p-12 flex-grow"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-slate-900">Ata Gerada</h2>
                    <div className="flex gap-2">
                      <button 
                        onClick={copyToClipboard}
                        className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
                        title="Copiar Texto"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={printReport}
                        className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
                        title="Imprimir"
                      >
                        <Printer className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div id="printable-report" className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-inner mb-8">
                    <h3 className="text-xl font-black text-center mb-6 uppercase tracking-tight text-slate-900">{result.title}</h3>
                    <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
                      {result.content}
                    </div>

                    {images.length > 0 && (
                      <div className="mt-8 pt-8 border-t border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Anexos Fotográficos</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {images.map((img, idx) => (
                            <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                              <img src={img.preview} alt={`Anexo ${idx + 1}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-8 pt-8 border-t border-slate-200">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Embasamento Sugerido</p>
                      <p className="text-xs text-slate-500 italic">{result.legalContext}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-600" />
                      Próximos Passos Recomendados
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {result.recommendations.map((rec, i) => (
                        <div key={i} className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-xs text-blue-800 font-medium leading-relaxed">
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              {step > 1 && step < 4 ? (
                <button 
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Anterior
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button 
                  onClick={() => setStep(step + 1)}
                  className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2"
                >
                  Próximo
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : step === 3 ? (
                <button 
                  onClick={handleGenerate}
                  disabled={loading}
                  className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Gerando Ata...
                    </>
                  ) : (
                    <>
                      Gerar Ata Digital
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              ) : (
                <button 
                  onClick={reset}
                  className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2"
                >
                  <RefreshCcw className="w-5 h-5" />
                  Nova Ocorrência
                </button>
              )}
            </div>
          </div>

          {/* Help Card */}
          <div className="mt-8 p-6 bg-blue-50 rounded-3xl border border-blue-100 flex gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-blue-900 mb-1">Por que registrar uma ata?</h4>
              <p className="text-xs text-blue-700 leading-relaxed">
                O registro formal no livro de ocorrências é a prova documental primária em conflitos condominiais. Uma ata bem escrita, objetiva e com evidências aumenta drasticamente suas chances de resolução favorável e serve como base para notificações extrajudiciais ou processos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
