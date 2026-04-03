import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Upload, 
  FileSearch, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCcw, 
  Info,
  Loader2,
  FileText,
  Gavel
} from 'lucide-react';
import { scanFineImage, FineScanResult } from '../lib/gemini';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function FineScanner() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FineScanResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingMessages = [
    "Lendo imagem...",
    "Extraindo dados da multa...",
    "Analisando legalidade...",
    "Verificando jurisprudência...",
    "Preparando argumentos de defesa..."
  ];

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, envie apenas arquivos de imagem.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setImage(base64);
      setResult(null);
      
      setLoading(true);
      setLoadingStep(0);
      
      const interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingMessages.length);
      }, 2000);

      try {
        const base64Data = base64.split(',')[1];
        const mimeType = file.type;
        const analysis = await scanFineImage(base64Data, mimeType);
        setResult(analysis);
        toast.success('Análise concluída com sucesso!');
      } catch (error) {
        console.error('Error scanning fine:', error);
        const message = error instanceof Error ? error.message : 'Ocorreu um erro ao analisar a imagem. Tente novamente.';
        toast.error(message);
        
        // If it's an API key error, we show a button to configure it
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
    reader.readAsDataURL(file);
  }, []);

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
    setImage(null);
    setResult(null);
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-10 sm:mb-12">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl text-blue-600 mb-4"
        >
          <Camera className="w-7 h-7 sm:w-8 h-8" />
        </motion.div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">Scanner de Multa <span className="text-blue-600">AI</span></h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          Envie uma foto da sua multa condominial e nossa IA analisará instantaneamente se ela é legal e quais os melhores caminhos para contestação.
        </p>
      </div>

      {!image && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "relative border-4 border-dashed rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-12 text-center transition-all duration-300",
            dragActive ? "border-blue-500 bg-blue-50 scale-[1.02]" : "border-slate-200 bg-white hover:border-blue-300"
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
            accept="image/*"
          />
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <Upload className="w-10 h-10 sm:w-12 h-12" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Arraste a foto da multa aqui</p>
              <p className="text-sm sm:text-base text-slate-500">ou clique para selecionar do seu dispositivo</p>
            </div>
            <div className="flex gap-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span>JPG</span>
              <span>PNG</span>
              <span>HEIC</span>
            </div>
          </div>
        </motion.div>
      )}

      {loading && (
        <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-10 sm:p-16 shadow-xl border border-slate-100 text-center">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-8">
            <Loader2 className="w-20 h-20 sm:w-24 sm:h-24 text-blue-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <FileSearch className="w-7 h-7 sm:w-8 h-8 text-blue-400" />
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
          <p className="text-sm sm:text-base text-slate-500 mt-4">Nossa IA jurídica está processando cada detalhe do documento...</p>
        </div>
      )}

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Image Preview */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="bg-white p-4 rounded-3xl shadow-lg border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Documento Digitalizado</p>
                <img 
                  src={image!} 
                  alt="Multa" 
                  className="w-full rounded-2xl shadow-inner border border-slate-50"
                />
              </div>
              <button 
                onClick={reset}
                className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCcw className="w-5 h-5" />
                Analisar Outra Multa
              </button>
            </div>
          </div>

          {/* Right Column: Analysis Results */}
          <div className="lg:col-span-2 space-y-8">
            {/* Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={cn(
                "p-5 sm:p-6 rounded-3xl border flex items-center gap-4",
                result.isLegal ? "bg-emerald-50 border-emerald-100 text-emerald-900" : "bg-red-50 border-red-100 text-red-900"
              )}>
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0",
                  result.isLegal ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                )}>
                  {result.isLegal ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Legalidade</p>
                  <p className="text-lg sm:text-xl font-black">{result.isLegal ? "Parece Legal" : "Possível Ilegalidade"}</p>
                </div>
              </div>

              <div className={cn(
                "p-5 sm:p-6 rounded-3xl border flex items-center gap-4",
                result.canBeContested ? "bg-blue-50 border-blue-100 text-blue-900" : "bg-slate-50 border-slate-100 text-slate-900"
              )}>
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0",
                  result.canBeContested ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"
                )}>
                  {result.canBeContested ? <Gavel className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Contestação</p>
                  <p className="text-lg sm:text-xl font-black">{result.canBeContested ? "Contestável" : "Difícil Contestação"}</p>
                </div>
              </div>
            </div>

            {/* Extracted Data */}
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border border-slate-100">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 sm:w-6 h-6 text-blue-600" />
                Dados Extraídos
              </h3>
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Data</p>
                  <p className="font-bold text-slate-700 text-sm sm:text-base">{result.extractedData.date}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Valor</p>
                  <p className="font-bold text-slate-700 text-sm sm:text-base">{result.extractedData.amount}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Condomínio</p>
                  <p className="font-bold text-slate-700 text-sm sm:text-base">{result.extractedData.condoName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Motivo</p>
                  <p className="font-bold text-slate-700 text-sm sm:text-base line-clamp-1" title={result.extractedData.reason}>{result.extractedData.reason}</p>
                </div>
              </div>
            </div>

            {/* Detailed Analysis */}
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border border-slate-100">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 sm:w-6 h-6 text-blue-600" />
                Análise Detalhada
              </h3>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-sm sm:text-base">
                {result.analysis}
              </div>
            </div>

            {/* Arguments */}
            <div className="bg-slate-900 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl text-white">
              <h3 className="text-lg sm:text-xl font-bold mb-6 flex items-center gap-2">
                <Gavel className="w-5 h-5 sm:w-6 h-6 text-blue-400" />
                Argumentos para Defesa
              </h3>
              <div className="space-y-4">
                {result.arguments.map((arg, index) => (
                  <div key={index} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                      {index + 1}
                    </div>
                    <p className="text-slate-300 text-sm sm:text-base">{arg}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex gap-3">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <p className="text-[10px] sm:text-xs text-blue-200 leading-relaxed">
                  Esta análise foi gerada por inteligência artificial. Recomendamos que você utilize estes argumentos para fundamentar sua defesa formal, mas sempre considere a consulta com um advogado especializado para casos complexos.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
