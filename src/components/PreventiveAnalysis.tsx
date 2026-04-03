import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileCheck, 
  Upload, 
  Search, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCcw, 
  Info,
  Loader2,
  FileText,
  Gavel,
  CheckCircle2,
  FileWarning
} from 'lucide-react';
import { analyzePreventiveDocument, analyzePreventiveText, PreventiveAnalysisResult } from '../lib/gemini';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { UserProfile } from '../types';

interface PreventiveAnalysisProps {
  profile: UserProfile | null;
}

export default function PreventiveAnalysis({ profile }: PreventiveAnalysisProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PreventiveAnalysisResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [analysisMode, setAnalysisMode] = useState<'upload' | 'text'>('upload');
  const [pastedText, setPastedText] = useState('');

  const loadingMessages = [
    "Digitalizando documento...",
    "Identificando cláusulas...",
    "Cruzando com o Código Civil...",
    "Avaliando riscos de compliance...",
    "Gerando recomendações preventivas..."
  ];

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Por favor, envie arquivos de imagem ou PDF.');
      return;
    }

    setFile(file);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      await processAnalysis(base64, file.type);
    };
    reader.readAsDataURL(file);
  }, []);

  const processAnalysis = async (base64: string, mimeType: string) => {
    setPreview(mimeType.startsWith('image/') ? base64 : null);
    setResult(null);
    
    setLoading(true);
    setLoadingStep(0);
    
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % loadingMessages.length);
    }, 2500);

    try {
      const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
      const analysis = await analyzePreventiveDocument(base64Data, mimeType);
      setResult(analysis);
      toast.success('Análise preventiva concluída!');
    } catch (error) {
      console.error('Error analyzing document:', error);
      const message = error instanceof Error ? error.message : 'Erro ao analisar documento. Tente novamente.';
      toast.error(message);
      
      if (message.includes('Configurar API') || message.includes('Chave de API')) {
        toast.info("Clique em 'Configurar API' no topo da página para resolver.", {
          action: {
            label: "Configurar",
            onClick: () => (window as any).aistudio?.openSelectKey()
          }
        });
      }
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const handleTextAnalysis = async () => {
    if (!pastedText.trim()) {
      toast.error('Por favor, cole o texto do documento.');
      return;
    }

    setResult(null);
    setLoading(true);
    setLoadingStep(0);
    
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % loadingMessages.length);
    }, 2500);

    try {
      const analysis = await analyzePreventiveText(pastedText);
      setResult(analysis);
      toast.success('Análise preventiva concluída!');
    } catch (error) {
      console.error('Error analyzing text:', error);
      const message = error instanceof Error ? error.message : 'Erro ao analisar texto. Tente novamente.';
      toast.error(message);
      
      if (message.includes('Configurar API') || message.includes('Chave de API')) {
        toast.info("Clique em 'Configurar API' no topo da página para resolver.", {
          action: {
            label: "Configurar",
            onClick: () => (window as any).aistudio?.openSelectKey()
          }
        });
      }
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const handleUseSaved = async (type: 'convention' | 'regulations') => {
    const doc = type === 'convention' ? profile?.condoConvention : profile?.internalRegulations;
    if (!doc) return;

    setFile(new File([], doc.name)); // Dummy file for UI state
    await processAnalysis(doc.data, doc.data.includes('pdf') ? 'application/pdf' : 'image/jpeg');
  };

  const onDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setLoading(false);
    setPastedText('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-10 sm:mb-12">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-2xl text-emerald-600 mb-4"
        >
          <ShieldCheck className="w-7 h-7 sm:w-8 h-8" />
        </motion.div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">Análise <span className="text-emerald-600">Preventiva</span></h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          Envie a Convenção ou o Regimento Interno do seu condomínio. Nossa IA identifica cláusulas abusivas e aponta riscos futuros antes que virem problemas.
        </p>
      </div>

      {!file && !loading && !result && (
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap justify-center">
            <button
              onClick={() => setAnalysisMode('upload')}
              className={cn(
                "px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2",
                analysisMode === 'upload' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Upload className="w-4 h-4" />
              Upload de Arquivo
            </button>
            <button
              onClick={() => setAnalysisMode('text')}
              className={cn(
                "px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2",
                analysisMode === 'text' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <FileText className="w-4 h-4" />
              Colar Texto
            </button>
          </div>
        </div>
      )}

      {!file && !loading && !result && analysisMode === 'upload' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "relative border-4 border-dashed rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-12 text-center transition-all duration-300",
            dragActive ? "border-emerald-500 bg-emerald-50 scale-[1.02]" : "border-slate-200 bg-white hover:border-emerald-300"
          )}
          onDragEnter={onDrag}
          onDragLeave={onDrag}
          onDragOver={onDrag}
          onDrop={onDrop}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={onFileChange}
            accept="image/*,application/pdf"
          />
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
              <Upload className="w-10 h-10 sm:w-12 h-12" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Envie o documento aqui</p>
              <p className="text-sm sm:text-base text-slate-500">Arraste fotos ou o PDF da convenção/regimento</p>
            </div>
            <div className="flex gap-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span>PDF</span>
              <span>JPG</span>
              <span>PNG</span>
            </div>
          </div>
        </motion.div>
      )}

      {!file && !loading && !result && analysisMode === 'text' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-100 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm"
        >
          <div className="mb-6">
            <label className="block text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest mb-2">
              Texto do Documento
            </label>
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Cole aqui as cláusulas da convenção ou regimento interno que deseja analisar..."
              className="w-full h-48 sm:h-64 p-4 sm:p-6 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none text-slate-700 leading-relaxed text-sm sm:text-base"
            />
          </div>
          <button
            onClick={handleTextAnalysis}
            disabled={!pastedText.trim()}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search className="w-5 h-5" />
            Analisar Texto Agora
          </button>
        </motion.div>
      )}

      {!file && !loading && !result && (profile?.condoConvention || profile?.internalRegulations) && (
        <div className="mt-8 grid grid-cols-1 xs:grid-cols-2 gap-4">
          {profile.condoConvention && (
            <button
              onClick={() => handleUseSaved('convention')}
              className="flex items-center gap-4 p-4 sm:p-6 bg-white border border-slate-100 rounded-3xl hover:border-emerald-500 hover:shadow-md transition-all text-left group"
            >
              <div className="bg-emerald-50 p-2 sm:p-3 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                <FileText className="w-5 h-5 sm:w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Usar Salvo</p>
                <p className="font-bold text-slate-800 text-sm sm:text-base truncate">Convenção</p>
              </div>
            </button>
          )}
          {profile.internalRegulations && (
            <button
              onClick={() => handleUseSaved('regulations')}
              className="flex items-center gap-4 p-4 sm:p-6 bg-white border border-slate-100 rounded-3xl hover:border-emerald-500 hover:shadow-md transition-all text-left group"
            >
              <div className="bg-emerald-50 p-2 sm:p-3 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                <ShieldCheck className="w-5 h-5 sm:w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Usar Salvo</p>
                <p className="font-bold text-slate-800 text-sm sm:text-base truncate">Regimento</p>
              </div>
            </button>
          )}
        </div>
      )}

      {loading && (
        <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-10 sm:p-16 shadow-xl border border-slate-100 text-center">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-8">
            <Loader2 className="w-20 h-20 sm:w-24 sm:h-24 text-emerald-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="w-7 h-7 sm:w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={loadingStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xl sm:text-2xl font-bold text-slate-800"
            >
              {loadingMessages[loadingStep]}
            </motion.p>
          </AnimatePresence>
          <p className="text-sm sm:text-base text-slate-500 mt-4">Analisando conformidade com o Código Civil e Leis Condominiais...</p>
        </div>
      )}

      {result && (
        <div className="space-y-8">
          {/* Summary Card */}
          <div className="bg-emerald-900 text-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl sm:text-2xl font-black mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 sm:w-7 h-7 text-emerald-400" />
                Resumo da Auditoria
              </h3>
              <p className="text-emerald-100 leading-relaxed text-base sm:text-lg italic">
                "{result.summary}"
              </p>
            </div>
            <ShieldCheck className="absolute -bottom-10 -right-10 w-48 h-48 sm:w-64 sm:h-64 text-white/5" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Risks List */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3 px-2">
                <FileWarning className="w-6 h-6 sm:w-7 h-7 text-red-500" />
                Riscos e Cláusulas Abusivas
              </h3>
              
              {result.risks.map((risk, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <h4 className="text-lg sm:text-xl font-bold text-slate-900">{risk.title}</h4>
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shrink-0",
                      risk.severity === 'alto' ? "bg-red-100 text-red-700" :
                      risk.severity === 'medio' ? "bg-yellow-100 text-yellow-700" :
                      "bg-emerald-100 text-emerald-700"
                    )}>
                      {risk.severity === 'alto' ? '🔴 Risco Alto' : 
                       risk.severity === 'medio' ? '🟡 Risco Médio' : '🟢 Risco Baixo'}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-slate-600 mb-6 leading-relaxed">
                    {risk.description}
                  </p>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-3">
                    <Gavel className="w-5 h-5 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Base Legal</p>
                      <p className="text-xs sm:text-sm font-medium text-slate-700 italic">{risk.legalBasis}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recommendations Sidebar */}
            <div className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border border-slate-100 lg:sticky lg:top-24">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 h-6 text-emerald-600" />
                  Recomendações
                </h3>
                <div className="space-y-6">
                  {result.recommendations.map((rec, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 font-black text-emerald-600 text-[10px] sm:text-xs">
                        {index + 1}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <button 
                    onClick={reset}
                    className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCcw className="w-5 h-5" />
                    Nova Análise
                  </button>
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
                  <Info className="w-5 h-5 text-blue-500 shrink-0" />
                  <p className="text-[10px] text-blue-700 leading-relaxed">
                    Esta auditoria preventiva visa munir o condômino de informações para questionar irregularidades em assembleia.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
