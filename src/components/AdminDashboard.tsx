import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Lock, ShieldCheck, ArrowRight, Loader2, TrendingUp, Mail, Calendar, Brain, CheckCircle, AlertCircle, BarChart3, HelpCircle, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { auth, db, logout } from '../lib/firebase';
import { collection, getCountFromServer, query, orderBy, limit, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { toast } from 'sonner';
import { cn, formatDate } from '../lib/utils';
import { FAQ } from '../types';

interface AIStats {
  totalAnalyses: number;
  mostCommonProblem: string;
  successRate: number;
  problemDistribution: Record<string, number>;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'metrics' | 'faqs'>('metrics');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [stats, setStats] = useState<{ 
    totalUsers: number; 
    recentUsers: any[];
    aiStats: AIStats | null;
  } | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [faqLoading, setFaqLoading] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [isAddingFaq, setIsAddingFaq] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', order: 0 });

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    if (isAuthenticated && activeTab === 'faqs') {
      setFaqLoading(true);
      const faqsColl = collection(db, 'faqs');
      // Simplified query to avoid index issues
      const faqsQuery = query(faqsColl);
      
      unsubscribe = onSnapshot(faqsQuery, (snapshot) => {
        const faqData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FAQ[];
        
        // Sort in memory
        const sortedFaqs = faqData.sort((a, b) => (a.order || 0) - (b.order || 0));
        setFaqs(sortedFaqs);
        setFaqLoading(false);
      }, (error) => {
        console.error("Error fetching FAQs:", error);
        toast.error("Erro ao carregar FAQs");
        setFaqLoading(false);
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeTab, isAuthenticated]);

  const ADMIN_EMAIL = "scaiaffa2014@gmail.com";

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    if (!validateEmail(email)) {
      setEmailError('Por favor, insira um e-mail válido.');
      toast.error('E-mail inválido');
      return;
    }

    if (email !== ADMIN_EMAIL) {
      toast.error('E-mail não autorizado para acesso administrativo.');
      return;
    }

    if (password === '1966') {
      setLoading(true);
      try {
        // Check if user is logged in to Firebase
        if (!auth.currentUser) {
          toast.error('Você precisa estar logado na sua conta primeiro.');
          setLoading(false);
          return;
        }

        if (auth.currentUser.email !== ADMIN_EMAIL) {
          toast.error(`Acesso negado. O e-mail ${auth.currentUser.email} não tem permissão administrativa.`);
          setLoading(false);
          return;
        }
        
        setIsAuthenticated(true);
        fetchStats();
        fetchFaqs();
        toast.success('Acesso administrativo concedido');
      } catch (error: any) {
        console.error("Admin login error:", error);
        toast.error(error.message || 'Erro ao autenticar como administrador.');
      } finally {
        setLoading(false);
      }
    } else {
      toast.error('Senha administrativa incorreta.');
      setPassword('');
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const usersColl = collection(db, 'users');
      const usersSnapshot = await getCountFromServer(usersColl);
      const totalUsers = usersSnapshot.data().count;

      const recentUsersQuery = query(usersColl, orderBy('createdAt', 'desc'), limit(10));
      const recentUsersSnapshot = await getDocs(recentUsersQuery);
      const recentUsers = recentUsersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const casesColl = collection(db, 'cases');
      const casesSnapshot = await getDocs(casesColl);
      const cases = casesSnapshot.docs.map(doc => doc.data());
      
      const totalAnalyses = cases.length;
      const problemDistribution: Record<string, number> = {};
      let helpfulCount = 0;
      let feedbackCount = 0;

      cases.forEach(c => {
        const type = c.problemType || 'outro';
        problemDistribution[type] = (problemDistribution[type] || 0) + 1;

        if (c.feedback && typeof c.feedback.helpful === 'boolean') {
          feedbackCount++;
          if (c.feedback.helpful) helpfulCount++;
        }
      });

      let mostCommonProblem = 'N/A';
      let maxCount = 0;
      Object.entries(problemDistribution).forEach(([type, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostCommonProblem = type;
        }
      });

      const successRate = feedbackCount > 0 ? (helpfulCount / feedbackCount) * 100 : 0;

      const aiStats: AIStats = {
        totalAnalyses,
        mostCommonProblem,
        successRate,
        problemDistribution
      };

      setStats({ totalUsers, recentUsers, aiStats });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      toast.error("Erro ao carregar estatísticas");
    } finally {
      setLoading(false);
    }
  };

  const fetchFaqs = async () => {
    // This is now handled by the useEffect with onSnapshot
    // We keep the function signature for the "Atualizar" button if needed,
    // but it will be a no-op or we can just re-trigger the snapshot if we want.
    // For now, let's just make it do nothing as onSnapshot handles it.
  };

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaq.question || !newFaq.answer) {
      toast.error("Preencha todos os campos");
      return;
    }

    setFaqLoading(true);
    try {
      const faqData = {
        ...newFaq,
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'faqs'), faqData);
      toast.success("FAQ adicionada com sucesso");
      setNewFaq({ question: '', answer: '', order: 0 });
      setIsAddingFaq(false);
      fetchFaqs();
    } catch (error) {
      console.error("Error adding FAQ:", error);
      toast.error("Erro ao adicionar FAQ");
    } finally {
      setFaqLoading(false);
    }
  };

  const handleUpdateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq || !editingFaq.question || !editingFaq.answer) return;

    setFaqLoading(true);
    try {
      const faqRef = doc(db, 'faqs', editingFaq.id!);
      await updateDoc(faqRef, {
        question: editingFaq.question,
        answer: editingFaq.answer,
        order: editingFaq.order || 0
      });
      toast.success("FAQ atualizada com sucesso");
      setEditingFaq(null);
      fetchFaqs();
    } catch (error) {
      console.error("Error updating FAQ:", error);
      toast.error("Erro ao atualizar FAQ");
    } finally {
      setFaqLoading(false);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta FAQ?")) return;

    setFaqLoading(true);
    try {
      await deleteDoc(doc(db, 'faqs', id));
      toast.success("FAQ excluída com sucesso");
      fetchFaqs();
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      toast.error("Erro ao excluir FAQ");
    } finally {
      setFaqLoading(false);
    }
  };

  const seedFaqs = async (reset = false) => {
    const confirmMsg = reset 
      ? "Deseja EXCLUIR TODAS as FAQs atuais e carregar as padrão?" 
      : "Deseja carregar as perguntas frequentes padrão?";
    
    if (!window.confirm(confirmMsg)) return;
    
    setFaqLoading(true);
    try {
      if (reset) {
        // Delete all existing FAQs
        const snapshot = await getDocs(collection(db, 'faqs'));
        const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'faqs', d.id)));
        await Promise.all(deletePromises);
        toast.info("FAQs antigas removidas");
      }

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
        },
        { 
          question: "Como cancelar minha assinatura?", 
          answer: "Você pode gerenciar ou cancelar sua assinatura a qualquer momento diretamente na sua área de perfil ou entrando em contato com nosso suporte via WhatsApp.",
          order: 8 
        },
        { 
          question: "O que fazer se o síndico ignorar minha defesa?", 
          answer: "Caso a defesa administrativa seja ignorada, o condômino pode levar a questão para a assembleia geral ou, em última instância, buscar o Juizado Especial Cível (Pequenas Causas).",
          order: 9 
        },
        { 
          question: "A plataforma atende condomínios comerciais?", 
          answer: "Sim, a lógica jurídica para condomínios comerciais segue princípios similares aos residenciais no Código Civil, e nossa IA está preparada para ambos os cenários.",
          order: 10 
        },
        {
          question: "Como funciona a análise de multas?",
          answer: "Nossa IA analisa o regulamento interno, a convenção e a notificação recebida para identificar falhas processuais, falta de fundamentação ou penalidades abusivas, gerando uma minuta de defesa técnica.",
          order: 11
        },
        {
          question: "O que é o Scanner de Multas?",
          answer: "É uma ferramenta que utiliza OCR (reconhecimento de caracteres) para ler fotos ou PDFs de multas e advertências, extraindo automaticamente os dados relevantes para a análise jurídica.",
          order: 12
        },
        {
          question: "Posso usar a plataforma para conflitos entre vizinhos?",
          answer: "Sim, temos módulos específicos para mediação de conflitos como barulho, infiltrações e uso de áreas comuns, oferecendo orientações baseadas no direito de vizinhança.",
          order: 13
        },
        {
          question: "O que é a Análise Preventiva?",
          answer: "É um serviço onde revisamos documentos do condomínio ou situações específicas antes que se tornem problemas judiciais, ajudando a evitar multas e litígios desnecessários.",
          order: 14
        },
        {
          question: "Como entrar em contato com o suporte?",
          answer: "Você pode acessar a aba 'Suporte' no menu lateral para abrir um chamado ou clicar no ícone do WhatsApp para atendimento direto com nossa equipe técnica.",
          order: 15
        }
      ];

      for (const faq of defaultFaqs) {
        await addDoc(collection(db, 'faqs'), {
          ...faq,
          createdAt: new Date().toISOString()
        });
      }
      
      toast.success("FAQs padrão carregadas com sucesso!");
      fetchFaqs();
    } catch (error) {
      console.error("Error seeding FAQs:", error);
      toast.error("Erro ao carregar FAQs padrão");
    } finally {
      setFaqLoading(false);
    }
  };

  const getProblemLabel = (type: string) => {
    const labels: Record<string, string> = {
      'multa': 'Multa Indevida',
      'abuso_sindico': 'Abuso de Síndico',
      'taxa_indevida': 'Taxa Extra',
      'outro': 'Outros'
    };
    return labels[type] || type;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 w-full max-w-md text-center"
        >
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Área Administrativa</h1>
          <p className="text-slate-500 text-sm mb-8">Acesso restrito. Identifique-se para continuar.</p>
          
          {!auth.currentUser ? (
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl mb-6 text-left">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-900 mb-1">Você não está logado</p>
                  <p className="text-[10px] text-amber-700 leading-relaxed">
                    Para acessar o painel, você deve primeiro fazer login na sua conta de usuário usando o e-mail administrativo.
                  </p>
                  <button 
                    onClick={() => window.location.href = '/'}
                    className="mt-3 text-[10px] font-black text-amber-900 underline uppercase tracking-wider"
                  >
                    Ir para o Início e Logar
                  </button>
                </div>
              </div>
            </div>
          ) : auth.currentUser.email !== ADMIN_EMAIL ? (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl mb-6 text-left">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-red-900 mb-1">E-mail não autorizado</p>
                  <p className="text-[10px] text-red-700 leading-relaxed">
                    Você está logado como <strong>{auth.currentUser.email}</strong>, que não possui acesso administrativo.
                  </p>
                  <button 
                    onClick={() => logout().then(() => window.location.reload())}
                    className="mt-3 text-[10px] font-black text-red-900 underline uppercase tracking-wider"
                  >
                    Sair e trocar de conta
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-100 p-4 rounded-2xl mb-6 text-left">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-green-900 mb-1">Sessão Identificada</p>
                  <p className="text-[10px] text-green-700 leading-relaxed">
                    Logado como: <strong>{auth.currentUser.email}</strong>. Insira a senha mestra para desbloquear.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                placeholder="E-mail Administrativo"
                className={cn(
                  "w-full pl-12 pr-6 py-4 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-medium",
                  emailError ? "border-red-300 bg-red-50" : "border-slate-100"
                )}
                autoFocus
              />
              {emailError && (
                <p className="text-red-500 text-xs mt-1 text-left ml-2">{emailError}</p>
              )}
            </div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha Mestra"
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-bold tracking-widest"
              />
            </div>
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Desbloquear Painel
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest mb-2">
            <ShieldCheck className="w-4 h-4" />
            Painel de Controle
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Métricas da <span className="text-blue-600">Plataforma</span></h1>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-1 rounded-2xl border border-slate-100 shadow-sm flex">
            <button
              onClick={() => setActiveTab('metrics')}
              className={cn(
                "px-6 py-3 rounded-xl font-bold text-sm transition-all",
                activeTab === 'metrics' ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              Métricas
            </button>
            <button
              onClick={() => setActiveTab('faqs')}
              className={cn(
                "px-6 py-3 rounded-xl font-bold text-sm transition-all",
                activeTab === 'faqs' ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              Gerenciar FAQ
            </button>
          </div>
          <button 
            onClick={activeTab === 'metrics' ? fetchStats : fetchFaqs}
            disabled={loading || faqLoading}
            className="bg-white border border-slate-200 p-4 rounded-2xl hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 font-bold text-slate-600"
          >
            {loading || faqLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
            Atualizar
          </button>
        </div>
      </header>

      {activeTab === 'metrics' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Total de Usuários</p>
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter">
                  {loading ? '...' : stats?.totalUsers || 0}
                </h2>
              </div>
              <Users className="absolute -bottom-6 -right-6 w-32 h-32 text-slate-50 group-hover:scale-110 transition-transform duration-500" />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
                  <Brain className="w-6 h-6" />
                </div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Análises de IA</p>
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter">
                  {loading ? '...' : stats?.aiStats?.totalAnalyses || 0}
                </h2>
              </div>
              <Brain className="absolute -bottom-6 -right-6 w-32 h-32 text-slate-50 group-hover:scale-110 transition-transform duration-500" />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-center text-center"
            >
              <div>
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Status do Sistema</p>
                <h2 className="text-2xl font-black text-emerald-600 tracking-tight">Operacional</h2>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
            >
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                Distribuição de Problemas
              </h3>
              <div className="space-y-4">
                {stats?.aiStats ? Object.entries(stats.aiStats.problemDistribution).map(([type, count]) => (
                  <div key={type} className="space-y-1">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-slate-600">{getProblemLabel(type)}</span>
                      <span className="text-slate-900">{count} ({((count / stats.aiStats!.totalAnalyses) * 100).toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / stats.aiStats!.totalAnalyses) * 100}%` }}
                        className="h-full bg-blue-600 rounded-full"
                      />
                    </div>
                  </div>
                )) : (
                  <p className="text-slate-400 text-sm italic">Nenhum dado disponível</p>
                )}
              </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-8">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] text-white shadow-xl"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Taxa de Sucesso</p>
                    <h4 className="text-2xl font-black">Eficácia da IA</h4>
                  </div>
                </div>
                <div className="flex items-end gap-4">
                  <span className="text-6xl font-black tracking-tighter text-blue-400">
                    {stats?.aiStats?.successRate.toFixed(0)}%
                  </span>
                  <p className="text-sm text-slate-400 mb-2 font-medium">
                    Baseado no feedback positivo dos condôminos sobre as recomendações geradas.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Problema mais Comum</p>
                    <h4 className="text-2xl font-black text-slate-900 tracking-tight">
                      {stats?.aiStats ? getProblemLabel(stats.aiStats.mostCommonProblem) : '...'}
                    </h4>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                Usuários Recentes
              </h3>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg">Top 10</span>
            </div>
            
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-4 sm:px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Usuário</th>
                      <th className="px-4 sm:px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">E-mail</th>
                      <th className="px-4 sm:px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Plano</th>
                      <th className="px-4 sm:px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Cadastro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <AnimatePresence>
                      {stats?.recentUsers.map((u, idx) => (
                        <motion.tr 
                          key={u.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-4 sm:px-8 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-black text-xs shrink-0">
                                {u.displayName?.[0] || 'U'}
                              </div>
                              <span className="font-bold text-slate-700 text-sm sm:text-base">{u.displayName || 'Sem Nome'}</span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-8 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-slate-500 text-xs sm:text-sm">
                              <Mail className="w-3 h-3" />
                              {u.email}
                            </div>
                          </td>
                          <td className="px-4 sm:px-8 py-5 whitespace-nowrap">
                            <span className={cn(
                              "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                              u.plan === 'pro' ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                            )}>
                              {u.plan || 'free'}
                            </span>
                          </td>
                          <td className="px-4 sm:px-8 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-slate-400 text-[10px] sm:text-xs font-bold">
                              <Calendar className="w-3 h-3" />
                              {u.createdAt ? formatDate(u.createdAt) : 'N/A'}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                    {(!stats || stats.recentUsers.length === 0) && !loading && (
                      <tr>
                        <td colSpan={4} className="px-4 sm:px-8 py-12 text-center text-slate-400 font-bold">
                          Nenhum usuário encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-blue-600" />
              Perguntas Frequentes
            </h3>
            <div className="flex gap-4">
              <button
                onClick={() => seedFaqs(true)}
                disabled={faqLoading}
                className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-black hover:bg-red-100 transition-all flex items-center gap-2 border border-red-100"
              >
                <Trash2 className="w-5 h-5" />
                Reset e Seed
              </button>
              <button
                onClick={() => seedFaqs(false)}
                disabled={faqLoading}
                className="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-black hover:bg-slate-200 transition-all flex items-center gap-2"
              >
                <Brain className="w-5 h-5" />
                Carregar Padrão
              </button>
              <button
                onClick={() => setIsAddingFaq(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nova Pergunta
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isAddingFaq && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-xl"
              >
                <form onSubmit={handleAddFaq} className="space-y-6">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-black text-slate-900">Adicionar Nova FAQ</h4>
                    <button type="button" onClick={() => setIsAddingFaq(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-3">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Pergunta</label>
                      <input
                        type="text"
                        value={newFaq.question}
                        onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-bold"
                        placeholder="Ex: Como funciona a análise de multa?"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Ordem</label>
                      <input
                        type="number"
                        value={newFaq.order}
                        onChange={(e) => setNewFaq({ ...newFaq, order: parseInt(e.target.value) || 0 })}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Resposta</label>
                    <textarea
                      value={newFaq.answer}
                      onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-medium min-h-[150px]"
                      placeholder="Descreva a resposta detalhadamente..."
                    />
                  </div>
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setIsAddingFaq(false)}
                      className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={faqLoading}
                      className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center gap-2"
                    >
                      {faqLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Salvar FAQ
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 gap-6">
            {faqs.map((faq) => (
              <motion.div
                key={faq.id}
                layout
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all"
              >
                {editingFaq?.id === faq.id ? (
                  <form onSubmit={handleUpdateFaq} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="md:col-span-3">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Pergunta</label>
                        <input
                          type="text"
                          value={editingFaq.question}
                          onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Ordem</label>
                        <input
                          type="number"
                          value={editingFaq.order}
                          onChange={(e) => setEditingFaq({ ...editingFaq, order: parseInt(e.target.value) || 0 })}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-bold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Resposta</label>
                      <textarea
                        value={editingFaq.answer}
                        onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-medium min-h-[150px]"
                      />
                    </div>
                    <div className="flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => setEditingFaq(null)}
                        className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={faqLoading}
                        className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center gap-2"
                      >
                        {faqLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Atualizar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Ordem: {faq.order || 0}</span>
                        <h4 className="text-xl font-black text-slate-900">{faq.question}</h4>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                    </div>
                    <div className="flex md:flex-col gap-2 shrink-0">
                      <button
                        onClick={() => setEditingFaq(faq)}
                        className="p-3 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                        title="Editar"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFaq(faq.id!)}
                        className="p-3 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                        title="Excluir"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
            {faqs.length === 0 && !faqLoading && (
              <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                <HelpCircle className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">Nenhuma FAQ cadastrada ainda.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
