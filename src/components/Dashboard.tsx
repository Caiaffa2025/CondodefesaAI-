import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from 'firebase/auth';
import { UserProfile, CondoCase } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { PlusCircle, FileText, Calendar, ChevronRight, AlertTriangle, ShieldCheck, Info, FileCheck, Search, Filter, ArrowUpRight, Clock, Bell, BellRing, CheckCircle2, Trophy, Camera, Sparkles, Zap, FolderOpen, Calculator, Trash2 } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { requestNotificationPermission } from '../lib/notifications';

interface DashboardProps {
  user: User;
  profile: UserProfile | null;
}

export default function Dashboard({ user, profile }: DashboardProps) {
  const [cases, setCases] = useState<CondoCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    typeof Notification !== 'undefined' && Notification.permission === 'granted'
  );

  const handleEnableNotifications = async () => {
    const token = await requestNotificationPermission(user.uid);
    if (token) {
      setNotificationsEnabled(true);
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          notificationsEnabled: true
        });
        toast.success('Notificações ativadas com sucesso!');
      } catch (error) {
        console.error("Error updating profile notifications", error);
      }
    } else {
      toast.error('Não foi possível ativar as notificações. Verifique as permissões do navegador.');
    }
  };

  const handleDisableNotifications = async () => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        notificationsEnabled: false
      });
      setNotificationsEnabled(false);
      toast.info('Notificações desativadas no seu perfil.');
    } catch (error) {
      console.error("Error updating profile notifications", error);
      toast.error('Erro ao desativar notificações.');
    }
  };

  const toggleCaseNotifications = async (caseId: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!notificationsEnabled) {
      const token = await requestNotificationPermission(user.uid);
      if (!token) {
        toast.error('Você precisa permitir notificações no navegador primeiro.');
        return;
      }
      setNotificationsEnabled(true);
    }

    try {
      const caseRef = doc(db, 'cases', caseId);
      await updateDoc(caseRef, {
        notificationsEnabled: !currentStatus
      });
      toast.success(!currentStatus ? 'Notificações ativadas para este caso!' : 'Notificações desativadas para este caso.');
    } catch (error) {
      console.error("Error toggling notifications", error);
      toast.error('Erro ao atualizar notificações.');
    }
  };

  const stats = {
    alto: cases.filter(c => c.severity === 'alto').length,
    medio: cases.filter(c => c.severity === 'medio').length,
    baixo: cases.filter(c => c.severity === 'baixo').length,
    total: cases.length
  };

  useEffect(() => {
    const q = query(
      collection(db, 'cases'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const path = 'cases';
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const casesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CondoCase[];
      setCases(casesData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.condoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.problemType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || c.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const handleDeleteCase = async (caseId: string) => {
    setIsDeleting(caseId);
    const path = `cases/${caseId}`;
    try {
      await deleteDoc(doc(db, 'cases', caseId));
      toast.success('Análise excluída com sucesso!');
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting case:', error);
      toast.error('Erro ao excluir a análise.');
      handleFirestoreError(error, OperationType.DELETE, path);
    } finally {
      setIsDeleting(null);
    }
  };

  // Skeleton components for better UX
  const StatSkeleton = () => (
    <div className="bg-white p-3 sm:p-4 md:p-5 rounded-xl md:rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-3 animate-pulse">
      <div className="bg-slate-100 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl"></div>
      <div className="flex-grow space-y-2">
        <div className="h-2 w-16 bg-slate-100 rounded"></div>
        <div className="h-6 w-8 bg-slate-100 rounded"></div>
      </div>
    </div>
  );

  const CaseSkeleton = () => (
    <div className="bg-white p-4 sm:p-6 md:p-7 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 animate-pulse">
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="bg-slate-100 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl"></div>
        <div className="flex-grow space-y-3">
          <div className="h-4 w-1/3 bg-slate-100 rounded"></div>
          <div className="h-3 w-1/2 bg-slate-100 rounded"></div>
          <div className="flex gap-4">
            <div className="h-4 w-20 bg-slate-100 rounded"></div>
            <div className="h-4 w-16 bg-slate-100 rounded"></div>
          </div>
        </div>
        <div className="h-10 w-10 bg-slate-100 rounded-xl"></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
      <header className="mb-8 md:mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl xs:text-3xl md:text-4xl font-black text-slate-900 tracking-tight"
          >
            Olá, {user.displayName?.split(' ')[0]}! 👋
          </motion.h1>
          {loading ? (
            <div className="h-4 w-48 bg-slate-100 rounded animate-pulse mt-2"></div>
          ) : (
            <p className="text-sm md:text-base text-slate-500 font-medium">Você tem {cases.length} {cases.length === 1 ? 'caso registrado' : 'casos registrados'} na plataforma.</p>
          )}
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full sm:w-auto"
        >
          <Link 
            to="/analisar" 
            className="bg-blue-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group text-[9px] md:text-[11px]"
          >
            <PlusCircle className="w-3 h-3 md:w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" />
            Nova Análise Inteligente
          </Link>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 mb-8 md:mb-10">
        {loading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <div className="bg-blue-600/10 p-3 sm:p-4 md:p-5 rounded-xl md:rounded-[1.5rem] animate-pulse"></div>
          </>
        ) : (
          cases.length > 0 && (
            <>
              <div className="relative group">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-3 sm:p-4 md:p-5 rounded-xl md:rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-2.5 sm:gap-3 hover:shadow-md transition-shadow h-full"
                >
                  <div className="bg-red-100 p-2 sm:p-2.5 md:p-3 rounded-lg md:rounded-xl text-red-600">
                    <AlertTriangle className="w-4 h-4 sm:w-5 h-5 md:w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[7px] sm:text-[8px] md:text-[9px] text-slate-400 font-black uppercase tracking-widest">🔴 Alto Risco</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 leading-none mt-0.5">{stats.alto}</p>
                  </div>
                </motion.div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-3 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 shadow-2xl translate-y-2 group-hover:translate-y-0">
                  Casos críticos como multas pesadas, ameaças de despejo ou abusos graves que exigem ação imediata.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                </div>
              </div>

              <div className="relative group">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white p-3 sm:p-4 md:p-5 rounded-xl md:rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-2.5 sm:gap-3 hover:shadow-md transition-shadow h-full"
                >
                  <div className="bg-yellow-100 p-2 sm:p-2.5 md:p-3 rounded-lg md:rounded-xl text-yellow-600">
                    <FileCheck className="w-4 h-4 sm:w-5 h-5 md:w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[7px] sm:text-[8px] md:text-[9px] text-slate-400 font-black uppercase tracking-widest">🟡 Risco Médio</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 leading-none mt-0.5">{stats.medio}</p>
                  </div>
                </motion.div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-3 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 shadow-2xl translate-y-2 group-hover:translate-y-0">
                  Problemas recorrentes como taxas indevidas, barulho excessivo ou falta de transparência em contas.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                </div>
              </div>

              <div className="relative group">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white p-3 sm:p-4 md:p-5 rounded-xl md:rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-2.5 sm:gap-3 hover:shadow-md transition-shadow h-full"
                >
                  <div className="bg-emerald-100 p-2 sm:p-2.5 md:p-3 rounded-lg md:rounded-xl text-emerald-600">
                    <ShieldCheck className="w-4 h-4 sm:w-5 h-5 md:w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[7px] sm:text-[8px] md:text-[9px] text-slate-400 font-black uppercase tracking-widest">🟢 Baixo Risco</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 leading-none mt-0.5">{stats.baixo}</p>
                  </div>
                </motion.div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-3 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 shadow-2xl translate-y-2 group-hover:translate-y-0">
                  Dúvidas sobre regras, pequenos conflitos de convivência ou solicitações de esclarecimentos simples.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-blue-600 p-3 sm:p-4 md:p-5 rounded-xl md:rounded-[1.5rem] text-white shadow-lg shadow-blue-100 flex items-center gap-2.5 sm:gap-3"
              >
                <div className="bg-white/20 p-2 sm:p-2.5 md:p-3 rounded-lg md:rounded-xl">
                  <FileText className="w-4 h-4 sm:w-5 h-5 md:w-6 h-6" />
                </div>
                <div>
                  <p className="text-[7px] sm:text-[8px] md:text-[9px] text-blue-100 font-black uppercase tracking-widest">Total Geral</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-black leading-none mt-0.5">{stats.total}</p>
                </div>
              </motion.div>
            </>
          )
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Case List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2 md:gap-3">
              <Clock className="w-5 h-5 md:w-6 h-6 text-blue-600" />
              Histórico de Análises
            </h2>
            
            {(loading || cases.length > 0) && (
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <div className="relative group w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    type="text"
                    placeholder="Buscar por condomínio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-600 outline-none transition-all w-full sm:w-64"
                  />
                </div>

                <div className="flex items-center gap-1 bg-white p-1 border border-slate-200 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: 'Todos', icon: Filter },
                    { id: 'alto', label: 'Alto', color: 'text-red-600', bg: 'bg-red-50' },
                    { id: 'medio', label: 'Médio', color: 'text-yellow-600', bg: 'bg-yellow-50' },
                    { id: 'baixo', label: 'Baixo', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSeverityFilter(f.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap",
                        severityFilter === f.id 
                          ? "bg-blue-600 text-white shadow-md shadow-blue-100" 
                          : "text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      {f.icon && <f.icon className="w-3 h-3" />}
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="space-y-4">
              <CaseSkeleton />
              <CaseSkeleton />
              <CaseSkeleton />
            </div>
          ) : cases.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-16 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center"
            >
              <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-12 h-12 text-blue-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-3">Sua defesa começa aqui</h3>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">Você ainda não realizou nenhuma análise. Nossa IA está pronta para identificar abusos e gerar seus documentos.</p>
              <Link 
                to="/analisar" 
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg text-sm"
              >
                Fazer minha primeira análise
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredCases.length === 0 ? (
                <div className="text-center py-12 text-slate-400 bg-white rounded-[2rem] border border-slate-100">
                  <Search className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p className="font-bold">Nenhum resultado encontrado</p>
                  <p className="text-xs mt-1">Tente ajustar seus termos de busca ou filtros.</p>
                </div>
              ) : (
                filteredCases.map((c, i) => (
                  <motion.div 
                    key={c.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white p-4 sm:p-6 md:p-7 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-4">
                      <Link to={`/caso/${c.id}`} className="flex items-center gap-3 sm:gap-6 flex-grow min-w-0">
                        <div className={cn(
                          "p-3 sm:p-4 rounded-xl md:rounded-2xl shrink-0 transition-transform group-hover:scale-110",
                          c.severity === 'alto' ? "bg-red-50 text-red-600" :
                          c.severity === 'medio' ? "bg-yellow-50 text-yellow-600" :
                          "bg-emerald-50 text-emerald-600"
                        )}>
                          {c.severity === 'alto' ? <AlertTriangle className="w-5 h-5 sm:w-7 h-7" /> :
                           c.severity === 'medio' ? <FileCheck className="w-5 h-5 sm:w-7 h-7" /> :
                           <ShieldCheck className="w-5 h-5 sm:w-7 h-7" />}
                        </div>
                        <div className="min-w-0 flex-grow">
                          <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                            <h3 className="font-black text-base sm:text-lg md:text-xl text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                              {c.problemType === 'outro' && c.customProblemType ? c.customProblemType :
                               c.problemType === 'multa' ? 'Multa Injusta' : 
                               c.problemType === 'abuso_sindico' ? 'Abuso de Síndico' :
                               c.problemType === 'taxa_indevida' ? 'Taxa Indevida' :
                               c.problemType === 'abuso_taxas' ? 'Abuso na Cobrança' :
                               c.problemType === 'vizinhanca' ? 'Vizinhança' :
                               c.problemType === 'obras_irregulares' ? 'Obras Irregulares' : 'Outro Problema'}
                            </h3>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-500 font-medium mb-2 md:mb-3 truncate flex items-center gap-1.5">
                            <span className="text-blue-600 font-bold">{c.condoName}</span> 
                            <span className="text-slate-300">•</span> 
                            {c.location}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-5">
                            <span className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-slate-400 bg-slate-50 px-2 md:px-3 py-1 md:py-1.5 rounded-lg">
                              <Calendar className="w-3 md:w-3.5 h-3 md:h-3.5" />
                              {formatDate(c.createdAt)}
                            </span>
                            <span className={cn(
                              "px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest",
                              c.severity === 'alto' ? "bg-red-100 text-red-700" :
                              c.severity === 'medio' ? "bg-yellow-100 text-yellow-700" :
                              "bg-emerald-100 text-emerald-700"
                            )}>
                              {c.severity === 'alto' ? '🔴 Alto' : 
                               c.severity === 'medio' ? '🟡 Médio' : '🟢 Baixo'}
                            </span>
                          </div>
                        </div>
                      </Link>
                      
                      <div className="flex items-center justify-end gap-2 sm:gap-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowDeleteConfirm(c.id!);
                          }}
                          className="p-2.5 sm:p-3 rounded-xl transition-all flex items-center gap-2 border bg-white text-slate-400 border-slate-100 hover:border-red-200 hover:text-red-600"
                          title="Excluir análise"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 h-5" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => toggleCaseNotifications(c.id!, !!c.notificationsEnabled, e)}
                          className={cn(
                            "p-2.5 sm:p-3 rounded-xl transition-all flex items-center gap-2 border",
                            c.notificationsEnabled 
                              ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100" 
                              : "bg-white text-slate-400 border-slate-100 hover:border-blue-200 hover:text-blue-600"
                          )}
                          title={c.notificationsEnabled ? "Desativar notificações" : "Ativar notificações"}
                        >
                          {c.notificationsEnabled ? <BellRing className="w-4 h-4 sm:w-5 h-5" /> : <Bell className="w-4 h-4 sm:w-5 h-5" />}
                          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-tight hidden sm:block">
                            {c.notificationsEnabled ? 'Ativo' : 'Notificar'}
                          </span>
                        </motion.button>
                        
                        <Link to={`/caso/${c.id}`} className="bg-slate-50 p-2.5 sm:p-3 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                          <ChevronRight className="w-5 h-5 sm:w-6 h-6" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Sidebar: Quick Info & Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6">
          {/* Finance Calculator Card */}
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden group"
          >
            <div className="relative z-10">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                <Calculator className="w-4 h-4 sm:w-5 h-5 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-black mb-1 tracking-tight">Calculadora</h3>
              <p className="text-emerald-100 text-[10px] sm:text-xs leading-tight mb-4">
                Verifique juros e multas legais.
              </p>
              <Link 
                to="/calculadora" 
                className="w-full bg-white text-emerald-600 py-2 rounded-xl font-black hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                Calcular
                <Calculator className="w-3.5 h-3.5" />
              </Link>
            </div>
            <Calculator className="absolute -bottom-4 -right-4 w-16 h-16 sm:w-20 sm:h-20 text-white/10 group-hover:scale-110 transition-transform duration-500" />
          </motion.div>

          {/* Occurrence Report Card */}
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden group"
          >
            <div className="relative z-10">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                <FileText className="w-4 h-4 sm:w-5 h-5 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-black mb-1 tracking-tight">Ata Digital</h3>
              <p className="text-blue-100 text-[10px] sm:text-xs leading-tight mb-4">
                Registre problemas profissionalmente.
              </p>
              <Link 
                to="/ata-digital" 
                className="w-full bg-white text-blue-700 py-2 rounded-xl font-black hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                Gerar Ata
                <FileText className="w-3.5 h-3.5" />
              </Link>
            </div>
            <FileText className="absolute -bottom-4 -right-4 w-16 h-16 sm:w-20 sm:h-20 text-white/10 group-hover:scale-110 transition-transform duration-500" />
          </motion.div>

          {/* Quiz Card */}
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden group"
          >
            <div className="relative z-10">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                <Trophy className="w-4 h-4 sm:w-5 h-5 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-black mb-1 tracking-tight">Quiz</h3>
              <p className="text-blue-100 text-[10px] sm:text-xs leading-tight mb-4">
                Teste seus conhecimentos.
              </p>
              <Link 
                to="/quiz" 
                className="w-full bg-white text-blue-600 py-2 rounded-xl font-black hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                Começar
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <Trophy className="absolute -bottom-4 -right-4 w-16 h-16 sm:w-20 sm:h-20 text-white/10 group-hover:scale-110 transition-transform duration-500" />
          </motion.div>

          {/* Scanner Card */}
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden group"
          >
            <div className="relative z-10">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-xl flex items-center justify-center mb-3">
                <Camera className="w-4 h-4 sm:w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-base sm:text-lg font-black mb-1 tracking-tight">Scanner</h3>
              <p className="text-slate-400 text-[10px] sm:text-xs leading-tight mb-4">
                Analise legalidade de multas.
              </p>
              <Link 
                to="/scanner" 
                className="w-full bg-blue-600 text-white py-2 rounded-xl font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm shadow-lg shadow-blue-900/20"
              >
                Escanear
                <Camera className="w-3.5 h-3.5" />
              </Link>
            </div>
            <Camera className="absolute -bottom-4 -right-4 w-16 h-16 sm:w-20 sm:h-20 text-white/5 group-hover:scale-110 transition-transform duration-500" />
          </motion.div>

          {/* Preventive Card */}
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden group"
          >
            <div className="relative z-10">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                <ShieldCheck className="w-4 h-4 sm:w-5 h-5 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-black mb-1 tracking-tight">Preventiva</h3>
              <p className="text-emerald-100 text-[10px] sm:text-xs leading-tight mb-4">
                Audite sua convenção.
              </p>
              <Link 
                to="/preventiva" 
                className="w-full bg-white text-emerald-600 py-2 rounded-xl font-black hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                Auditar
                <ShieldCheck className="w-3.5 h-3.5" />
              </Link>
            </div>
            <ShieldCheck className="absolute -bottom-4 -right-4 w-16 h-16 sm:w-20 sm:h-20 text-white/10 group-hover:scale-110 transition-transform duration-500" />
          </motion.div>

          {/* Documents Card */}
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm relative overflow-hidden group"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <FolderOpen className="w-4 h-4 sm:w-5 h-5" />
                </div>
                {profile?.condoConvention && profile?.internalRegulations ? (
                  <span className="bg-emerald-100 text-emerald-700 text-[8px] sm:text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">OK</span>
                ) : (
                  <span className="bg-slate-100 text-slate-500 text-[8px] sm:text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">PENDENTE</span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1 tracking-tight">Documentos</h3>
              <p className="text-slate-500 text-[10px] sm:text-xs leading-tight mb-4">
                Gerencie seus arquivos.
              </p>
              <Link 
                to="/documentos" 
                className="w-full bg-slate-900 text-white py-2 rounded-xl font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                Gerenciar
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>

          {/* Plan Info */}
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-lg relative overflow-hidden group"
          >
            <div className="relative z-10">
              <div className="inline-block px-2 py-1 bg-blue-600 rounded-lg text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-3">
                Plano {profile?.plan === 'pro' ? 'PRO' : 'FREE'}
              </div>
              <h3 className="text-base sm:text-lg font-black mb-1 tracking-tight">Status da Conta</h3>
              <p className="text-slate-400 text-[10px] sm:text-xs leading-tight mb-4">
                {profile?.plan === 'pro' 
                  ? 'Acesso total e ilimitado.' 
                  : 'Plano gratuito limitado.'}
              </p>
              {profile?.plan !== 'pro' && (
                <button 
                  onClick={() => toast.info('O sistema de pagamentos será implementado em breve!')}
                  className="w-full bg-white text-slate-900 py-2 rounded-xl font-black hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  Fazer Upgrade
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <ShieldCheck className="absolute -bottom-5 -right-5 w-20 h-20 sm:w-24 sm:h-24 text-white/5 group-hover:scale-110 transition-transform duration-500" />
          </motion.div>

          {/* Notifications Toggle */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 sm:w-5 h-5 text-blue-600" />
                Notificações
              </h3>
              <div className={cn(
                "w-2 h-2 rounded-full",
                (notificationsEnabled && profile?.notificationsEnabled !== false) ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-slate-300"
              )} />
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 leading-tight mb-4">
              Receba avisos em tempo real sobre seus casos e documentos.
            </p>
            {(!notificationsEnabled || profile?.notificationsEnabled === false) ? (
              <button 
                onClick={handleEnableNotifications}
                className="w-full bg-blue-50 text-blue-600 py-2 rounded-xl font-bold hover:bg-blue-100 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <BellRing className="w-3.5 h-3.5" />
                Ativar Notificações
              </button>
            ) : (
              <button 
                onClick={handleDisableNotifications}
                className="w-full bg-emerald-50 text-emerald-600 py-2 rounded-xl font-bold hover:bg-emerald-100 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Ativas (Desativar)
              </button>
            )}
          </div>

          {/* Smart Alerts */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3">
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 h-5 text-blue-600" />
              Alertas Inteligentes
            </h3>
            <div className="space-y-3">
              {[
                { 
                  title: "Nova regra abusiva", 
                  desc: "Detectamos alteração suspeita na convenção.",
                  type: "warning" 
                },
                { 
                  title: "Conteste cobrança", 
                  desc: "Taxa extra do mês possui vícios legais.",
                  type: "info" 
                }
              ].map((alert, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className={cn(
                    "p-3 rounded-xl border flex gap-3",
                    alert.type === 'warning' ? "bg-red-50 border-red-100" : "bg-blue-50 border-blue-100"
                  )}
                >
                  <Zap className={cn("w-4 h-4 shrink-0", alert.type === 'warning' ? "text-red-500" : "text-blue-500")} />
                  <div>
                    <h4 className={cn("font-bold text-xs mb-0.5", alert.type === 'warning' ? "text-red-900" : "text-blue-900")}>
                      {alert.title}
                    </h4>
                    <p className={cn("text-[10px] leading-tight", alert.type === 'warning' ? "text-red-700/70" : "text-blue-700/70")}>
                      {alert.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm">
            <h3 className="text-base sm:text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 sm:w-5 h-5 text-blue-600" />
              Dicas de Proteção
            </h3>
            <div className="space-y-3">
              {[
                { title: "Documentação", text: "Sempre registre tudo por e-mail ou ata digital." },
                { title: "Regras Internas", text: "Peça cópia atualizada da convenção e regimento." },
                { title: "Direito de Defesa", text: "Nenhuma multa pode ser aplicada sem defesa prévia." }
              ].map((tip, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 font-black text-blue-600 text-[10px]">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs mb-0.5">{tip.title}</h4>
                    <p className="text-[10px] text-slate-500 leading-tight">{tip.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8 sm:p-10"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-600 mb-6">
                  <Trash2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Excluir Análise?</h3>
                <p className="text-slate-500 mb-8 leading-relaxed">
                  Esta ação não pode ser desfeita. Todos os documentos e o diagnóstico gerado para este caso serão removidos permanentemente.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    disabled={isDeleting !== null}
                    onClick={() => handleDeleteCase(showDeleteConfirm)}
                    className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black hover:bg-red-700 transition-all shadow-xl shadow-red-100 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDeleting === showDeleteConfirm ? (
                      <Clock className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                    Sim, Excluir
                  </button>
                  <button
                    disabled={isDeleting !== null}
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
