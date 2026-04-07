import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, Search, MessageSquare, Shield, Scale, AlertCircle, Loader2, Brain } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { FAQ as FAQType } from '../types';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export default function FAQ() {
  const [faqs, setFaqs] = useState<FAQType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const isAdmin = useMemo(() => {
    return auth.currentUser?.email === "scaiaffa2014@gmail.com";
  }, [auth.currentUser]);

  const seedFaqs = async () => {
    setIsSeeding(true);
    try {
      const defaultFaqs = [
        { 
          question: "O que é o CondoDefesa AI?", 
          answer: "O CondoDefesa AI é uma plataforma inteligente que utiliza Inteligência Artificial para analisar multas, taxas e abusos em condomínios, fornecendo diagnósticos jurídicos e minutas de defesa em poucos minutos.",
          order: 1 
        },
        { 
          question: "A análise tem validade jurídica?", 
          answer: "Nossas análises são baseadas no Código Civil e leis condominiais vigentes. Elas servem como um poderoso embasamento informativo e suporte para sua defesa, mas não substituem a consulta com um advogado especializado.",
          order: 2 
        },
        { 
          question: "Como funciona a análise de multa?", 
          answer: "Você descreve a situação ou anexa a notificação. Nossa IA confronta os fatos com as leis e a convenção do condomínio para identificar se houve erro no processo, falta de direito de defesa ou cobrança abusiva.",
          order: 3 
        },
        { 
          question: "O que é abuso de poder do síndico?", 
          answer: "Ocorre quando o síndico toma decisões que extrapolam suas atribuições legais ou contrariam as decisões da assembleia, como aplicar multas sem direito de defesa ou realizar obras sem aprovação prévia.",
          order: 4 
        },
        { 
          question: "Posso contestar uma taxa extra?", 
          answer: "Sim, se a taxa não foi aprovada em assembleia ou se a finalidade da cobrança não estiver clara ou for irregular perante a convenção do condomínio.",
          order: 5 
        },
        { 
          question: "Meus dados estão seguros?", 
          answer: "Sim, utilizamos criptografia de ponta e seguimos rigorosamente a LGPD (Lei Geral de Proteção de Dados). Suas informações e documentos são confidenciais e protegidos.",
          order: 6 
        },
        { 
          question: "Qual a diferença entre o plano Grátis e o Pro?", 
          answer: "O plano Grátis permite análises básicas. O plano Pro oferece relatórios detalhados, minutas de defesa completas, suporte prioritário e acesso a ferramentas avançadas de cálculo e scanner.",
          order: 7 
        }
      ];

      for (const faq of defaultFaqs) {
        await addDoc(collection(db, 'faqs'), {
          ...faq,
          createdAt: new Date().toISOString()
        });
      }
      
      toast.success("FAQs padrão carregadas com sucesso!");
    } catch (error) {
      console.error("Error seeding FAQs:", error);
      toast.error("Erro ao carregar FAQs");
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    console.log("Starting FAQ fetch...");
    const faqsColl = collection(db, 'faqs');
    // Simplified query to avoid potential index issues
    const faqsQuery = query(faqsColl);

    const unsubscribe = onSnapshot(faqsQuery, (snapshot) => {
      console.log("FAQ snapshot received, docs count:", snapshot.docs.length);
      if (isMounted) {
        const faqData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FAQType[];
        
        // Sort in memory instead of Firestore query
        const sortedFaqs = faqData.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        setFaqs(sortedFaqs);
        setLoading(false);
        setError(null);
      }
    }, (err) => {
      console.error("Error fetching FAQs:", err);
      if (isMounted) {
        setError("Não foi possível carregar as perguntas frequentes. Verifique sua conexão ou tente novamente mais tarde.");
        setLoading(false);
      }
    });

    return () => { 
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-4"
          >
            <HelpCircle className="w-4 h-4" />
            Central de Ajuda
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4"
          >
            Como podemos <span className="text-blue-600 font-black">ajudar?</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-lg max-w-2xl mx-auto"
          >
            Encontre respostas rápidas sobre o CondoDefesa AI, seus direitos e como utilizar nossa plataforma.
          </motion.p>
        </div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative mb-12"
        >
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <input
            type="text"
            placeholder="Busque por uma dúvida (ex: multa, plano pro, validade...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-6 bg-white border border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/50 focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all text-lg font-medium"
          />
        </motion.div>

        {/* FAQ List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="text-slate-400 font-bold animate-pulse">Carregando perguntas...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-100 p-8 rounded-[2.5rem] text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-red-900 font-black text-xl mb-2">Ops! Algo deu errado</h3>
              <p className="text-red-600 font-medium mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-red-700 transition-all shadow-lg shadow-red-200"
              >
                Tentar Novamente
              </button>
            </div>
          ) : filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <motion.div
                key={faq.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "bg-white border transition-all duration-300 overflow-hidden",
                  openIndex === index 
                    ? "rounded-[2rem] border-blue-200 shadow-xl shadow-blue-100/50 ring-1 ring-blue-100" 
                    : "rounded-3xl border-slate-100 hover:border-blue-200 shadow-sm"
                )}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left group"
                >
                  <span className={cn(
                    "text-lg font-black tracking-tight transition-colors",
                    openIndex === index ? "text-blue-600" : "text-slate-800 group-hover:text-blue-600"
                  )}>
                    {faq.question}
                  </span>
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    openIndex === index ? "bg-blue-600 text-white rotate-180" : "bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600"
                  )}>
                    <ChevronDown className="w-6 h-6" />
                  </div>
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-8 pb-8 text-slate-600 leading-relaxed text-lg border-t border-slate-50 pt-6">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-6">
                <Search className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Nenhum resultado encontrado</h3>
              <p className="text-slate-500 mb-8">Tente buscar por termos diferentes ou navegue pelas perguntas.</p>
              
              {isAdmin && faqs.length === 0 && (
                <button
                  onClick={seedFaqs}
                  disabled={isSeeding}
                  className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center gap-2 mx-auto"
                >
                  {isSeeding ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Brain className="w-5 h-5" />
                  )}
                  Carregar Perguntas Padrão
                </button>
              )}
            </div>
          )}
        </div>

        {/* Support CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-20 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-10 text-white text-center relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <div className="relative z-10">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-900/20 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black mb-4 tracking-tight">Ainda tem dúvidas?</h2>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              Nossa equipe de especialistas está pronta para te ajudar com qualquer questão específica sobre seu condomínio.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="https://wa.me/5511984937529" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-blue-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2"
              >
                Falar no WhatsApp
              </a>
              <button className="w-full sm:w-auto bg-white/10 text-white px-10 py-4 rounded-2xl font-black hover:bg-white/20 transition-all border border-white/10">
                Abrir Chamado
              </button>
            </div>
          </div>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm text-center group hover:border-blue-200 transition-all">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <h4 className="font-black text-slate-900 mb-2">Segurança</h4>
            <p className="text-sm text-slate-500">Seus dados e documentos protegidos por criptografia.</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm text-center group hover:border-blue-200 transition-all">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Scale className="w-6 h-6" />
            </div>
            <h4 className="font-black text-slate-900 mb-2">Leis</h4>
            <p className="text-sm text-slate-500">Baseado no Código Civil e leis condominiais.</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm text-center group hover:border-blue-200 transition-all">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-4 group-hover:scale-110 transition-transform">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h4 className="font-black text-slate-900 mb-2">Suporte</h4>
            <p className="text-sm text-slate-500">Atendimento humanizado para casos complexos.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
