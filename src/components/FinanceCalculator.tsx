import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  RefreshCcw, 
  Info,
  Loader2,
  DollarSign,
  Calendar,
  Scale,
  FileText
} from 'lucide-react';
import { analyzeFinanceLegality, FinanceAnalysisResult } from '../lib/gemini';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function FinanceCalculator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FinanceAnalysisResult | null>(null);
  const [formData, setFormData] = useState({
    principal: '',
    fineCharged: '',
    interestCharged: '',
    dueDate: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.principal || !formData.dueDate || !formData.paymentDate) {
      toast.error('Preencha os campos obrigatórios (Principal, Vencimento e Pagamento).');
      return;
    }

    setLoading(true);
    try {
      const analysis = await analyzeFinanceLegality(
        Number(formData.principal),
        Number(formData.fineCharged || 0),
        Number(formData.interestCharged || 0),
        formData.dueDate,
        formData.paymentDate
      );
      setResult(analysis);
      toast.success('Análise financeira concluída!');
    } catch (error) {
      console.error('Error analyzing finance:', error);
      const message = error instanceof Error ? error.message : 'Erro ao processar os cálculos. Tente novamente.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setFormData({
      principal: '',
      fineCharged: '',
      interestCharged: '',
      dueDate: '',
      paymentDate: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-10 sm:mb-12">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-2xl text-emerald-600 mb-4"
        >
          <Calculator className="w-7 h-7 sm:w-8 h-8" />
        </motion.div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">Calculadora de <span className="text-emerald-600">Legalidade Financeira</span></h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          Verifique se os juros e multas cobrados pelo seu condomínio estão dentro dos limites do Código Civil Brasileiro.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-xl border border-slate-100">
            <form onSubmit={handleCalculate} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <DollarSign className="w-3 h-3" />
                  Valor Principal (R$) *
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={formData.principal}
                  onChange={(e) => setFormData({...formData, principal: e.target.value})}
                  placeholder="Ex: 500.00"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-emerald-500 transition-all font-bold text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Multa Cobrada (R$)
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.fineCharged}
                    onChange={(e) => setFormData({...formData, fineCharged: e.target.value})}
                    placeholder="Ex: 10.00"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-emerald-500 transition-all font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Juros Cobrados (R$)
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.interestCharged}
                    onChange={(e) => setFormData({...formData, interestCharged: e.target.value})}
                    placeholder="Ex: 5.00"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-emerald-500 transition-all font-bold text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    Vencimento *
                  </label>
                  <input 
                    type="date" 
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-emerald-500 transition-all font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    Pagamento *
                  </label>
                  <input 
                    type="date" 
                    required
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-emerald-500 transition-all font-bold text-slate-700"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Calculator className="w-6 h-6" />
                    Calcular Legalidade
                  </>
                )}
              </button>

              {result && (
                <button 
                  type="button"
                  onClick={reset}
                  className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Novo Cálculo
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200"
              >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-300 mb-6 shadow-inner">
                  <Scale className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-400 mb-2">Aguardando dados</h3>
                <p className="text-slate-400 max-w-xs">Preencha as informações da cobrança ao lado para iniciar a análise jurídica.</p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-8 bg-white rounded-[2rem] shadow-xl border border-slate-100"
              >
                <div className="relative w-24 h-24 mb-8">
                  <Loader2 className="w-24 h-24 text-emerald-600 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <DollarSign className="w-8 h-8 text-emerald-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Processando Cálculos</h3>
                <p className="text-slate-500">Nossa IA está verificando os limites do Código Civil e comparando com os valores informados...</p>
              </motion.div>
            )}

            {result && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Status Card */}
                <div className={cn(
                  "p-8 rounded-[2rem] border-2 flex flex-col sm:flex-row items-center gap-6 shadow-lg",
                  result.isLegal ? "bg-emerald-50 border-emerald-100 text-emerald-900" : "bg-red-50 border-red-100 text-red-900"
                )}>
                  <div className={cn(
                    "w-20 h-20 rounded-3xl flex items-center justify-center flex-shrink-0 shadow-sm",
                    result.isLegal ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                  )}>
                    {result.isLegal ? <CheckCircle2 className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-2xl sm:text-3xl font-black mb-2">
                      {result.isLegal ? "Cobrança Legal" : "Cobrança Abusiva"}
                    </h3>
                    <p className="text-sm sm:text-base opacity-80 font-medium">
                      {result.isLegal 
                        ? "Os valores informados estão dentro dos limites permitidos por lei." 
                        : "Identificamos valores que excedem o teto estabelecido pelo Código Civil."}
                    </p>
                  </div>
                </div>

                {/* Comparison Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Multa (Limite 2%)</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Calculado</p>
                        <p className="text-2xl font-black text-slate-900">R$ {result.limitFine.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1">Cobrado</p>
                        <p className={cn(
                          "text-lg font-bold",
                          Number(formData.fineCharged) > result.limitFine ? "text-red-600" : "text-emerald-600"
                        )}>R$ {Number(formData.fineCharged).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Juros (Limite 1%/mês)</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Calculado</p>
                        <p className="text-2xl font-black text-slate-900">R$ {result.limitInterest.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1">Cobrado</p>
                        <p className={cn(
                          "text-lg font-bold",
                          Number(formData.interestCharged) > result.limitInterest ? "text-red-600" : "text-emerald-600"
                        )}>R$ {Number(formData.interestCharged).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analysis Text */}
                <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
                  <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    Parecer da IA
                  </h4>
                  <div className="prose prose-slate max-w-none text-slate-600 text-sm sm:text-base leading-relaxed">
                    <p className="mb-4">{result.analysis}</p>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Base Legal</p>
                      <p className="text-slate-700 italic">{result.legalBasis}</p>
                    </div>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="bg-slate-900 p-8 rounded-[2rem] shadow-xl text-white">
                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 text-emerald-400" />
                    O que fazer agora?
                  </h4>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                    {result.recommendation}
                  </p>
                  <div className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <Info className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-400 leading-relaxed uppercase tracking-wider">
                      Atenção: Esta calculadora utiliza parâmetros gerais do Código Civil. Convenções de condomínio podem prever juros menores, mas nunca maiores que o limite legal. Em caso de dúvida, consulte um advogado.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
