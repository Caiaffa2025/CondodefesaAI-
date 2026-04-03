import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Lock, ShieldCheck, ArrowRight, Loader2, TrendingUp, Mail, Calendar, Brain, CheckCircle, AlertCircle, PieChart, BarChart3 } from 'lucide-react';
import { auth, db, signInWithGoogle, logout } from '../lib/firebase';
import { collection, getCountFromServer, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';
import { cn, formatDate } from '../lib/utils';

interface AIStats {
  totalAnalyses: number;
  mostCommonProblem: string;
  successRate: number;
  problemDistribution: Record<string, number>;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [stats, setStats] = useState<{ 
    totalUsers: number; 
    recentUsers: any[];
    aiStats: AIStats | null;
  } | null>(null);

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
        // If not logged in with Google, or logged in with wrong account
        if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) {
          toast.info('Para acessar o painel, você deve estar autenticado com sua conta Google administrativa.');
          const user = await signInWithGoogle();
          if (user.email !== ADMIN_EMAIL) {
            toast.error(`Acesso negado. A conta ${user.email} não tem permissões administrativas.`);
            await logout();
            return;
          }
        }
        
        setIsAuthenticated(true);
        fetchStats();
        toast.success('Acesso administrativo concedido');
      } catch (error: any) {
        console.error("Admin login error:", error);
        toast.error(error.message || 'Erro ao autenticar como administrador.');
      } finally {
        setLoading(false);
      }
    } else {
      toast.error('Senha incorreta');
      setPassword('');
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Get total users count
      const usersColl = collection(db, 'users');
      const usersSnapshot = await getCountFromServer(usersColl);
      const totalUsers = usersSnapshot.data().count;

      // Get recent users
      const recentUsersQuery = query(usersColl, orderBy('createdAt', 'desc'), limit(10));
      const recentUsersSnapshot = await getDocs(recentUsersQuery);
      const recentUsers = recentUsersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Get AI stats from cases
      const casesColl = collection(db, 'cases');
      const casesSnapshot = await getDocs(casesColl);
      const cases = casesSnapshot.docs.map(doc => doc.data());
      
      const totalAnalyses = cases.length;
      const problemDistribution: Record<string, number> = {};
      let helpfulCount = 0;
      let feedbackCount = 0;

      cases.forEach(c => {
        // Distribution
        const type = c.problemType || 'outro';
        problemDistribution[type] = (problemDistribution[type] || 0) + 1;

        // Success rate (feedback)
        if (c.feedback && typeof c.feedback.helpful === 'boolean') {
          feedbackCount++;
          if (c.feedback.helpful) helpfulCount++;
        }
      });

      // Find most common problem
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
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 w-full max-w-md text-center"
        >
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Área Administrativa</h1>
          <p className="text-slate-500 text-sm mb-8">Insira a senha de acesso para visualizar as métricas da plataforma.</p>
          
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
                placeholder="Seu e-mail"
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
                placeholder="Senha de Acesso"
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-bold tracking-widest"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
            >
              Acessar Painel
              <ArrowRight className="w-5 h-5" />
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
        <button 
          onClick={fetchStats}
          disabled={loading}
          className="bg-white border border-slate-200 p-4 rounded-2xl hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 font-bold text-slate-600"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
          Atualizar Dados
        </button>
      </header>

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

      {/* AI Insights Section */}
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
    </div>
  );
}
