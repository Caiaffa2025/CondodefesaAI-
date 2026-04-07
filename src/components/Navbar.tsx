import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';
import { logout } from '../lib/firebase';
import { toast } from 'sonner';
import { Shield, LogOut, LayoutDashboard, Scale, HelpCircle, Menu, X, Trophy, Camera, ShieldCheck, FolderOpen, ArrowUpRight, ShieldAlert, Calculator, FileText, Key, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import LoginModal from './LoginModal';
import firebaseConfig from '../../firebase-applet-config.json';

interface NavbarProps {
  user: User | null;
  profile: UserProfile | null;
}

export default function Navbar({ user, profile }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const baseTitle = 'CondoDefesa AI';
    const path = location.pathname;

    if (path === '/') {
      document.title = baseTitle;
    } else if (path === '/dashboard') {
      document.title = `${baseTitle} | Dashboard`;
    } else if (path === '/analisar') {
      document.title = `${baseTitle} | Analisar`;
    } else if (path === '/quiz') {
      document.title = `${baseTitle} | Quiz`;
    } else if (path === '/faq') {
      document.title = `${baseTitle} | FAQ`;
    } else if (path === '/scanner') {
      document.title = `${baseTitle} | Scanner de Multa`;
    } else if (path === '/calculadora') {
      document.title = `${baseTitle} | Calculadora Financeira`;
    } else if (path === '/ata-digital') {
      document.title = `${baseTitle} | Ata de Ocorrência`;
    } else if (path === '/preventiva') {
      document.title = `${baseTitle} | Análise Preventiva`;
    } else if (path === '/documentos') {
      document.title = `${baseTitle} | Meus Documentos`;
    } else if (path === '/protecao') {
      document.title = `${baseTitle} | Proteção Condominial`;
    } else if (path === '/suporte') {
      document.title = `${baseTitle} | Suporte`;
    } else if (path === '/sobre') {
      document.title = `${baseTitle} | Sobre Nós`;
    } else if (path.startsWith('/caso/')) {
      document.title = `${baseTitle} | Detalhes do Caso`;
    } else {
      document.title = baseTitle;
    }
  }, [location]);

  const handleLogin = () => {
    setIsLoginModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sessão encerrada com sucesso.');
      navigate('/');
      setIsMenuOpen(false);
    } catch (error) {
      toast.error('Erro ao sair.');
    }
  };

  const handleSelectApiKey = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      // Assume success to hide the button and encourage the user to try again
      setHasKey(true);
      toast.info("Chave de API selecionada. Tente a operação novamente.");
    }
  };

  const hasAiStudio = typeof window !== 'undefined' && (window as any).aistudio;
  
  // Check for key presence in a way that handles runtime injection
  const checkHasKey = async () => {
    if (typeof window === 'undefined') return false;
    
    const isPlaceholder = (k: any) => !k || k === 'TODO_KEYHERE' || k === 'MY_GEMINI_API_KEY' || k === 'YOUR_API_KEY' || k === '';

    const win = window as any;
    
    // Check runtime process.env (injected by AI Studio)
    const runtimeKey = win.process?.env?.GEMINI_API_KEY || win.process?.env?.API_KEY || win.GEMINI_API_KEY || win.API_KEY || win.aistudio?.apiKey;
    if (!isPlaceholder(runtimeKey)) return true;
    
    // Check AI Studio helper if available
    if (win.aistudio?.hasSelectedApiKey) {
      try {
        const hasSelected = await win.aistudio.hasSelectedApiKey();
        if (hasSelected) return true;
      } catch (e) {}
    }

    // Check build-time process.env safely
    const getBuildTimeKey = () => {
      try {
        // @ts-ignore
        return process.env.GEMINI_API_KEY || process.env.API_KEY;
      } catch (e) {
        return null;
      }
    };
    
    const buildTimeKey = getBuildTimeKey();
    if (!isPlaceholder(buildTimeKey)) return true;
    
    // Check VITE_ prefixed env
    const viteKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (!isPlaceholder(viteKey)) return true;
    
    // Check Firebase key as fallback
    if (!isPlaceholder(firebaseConfig.apiKey)) return true;
    
    return false;
  };

  const [hasKey, setHasKey] = useState(false);

  // Re-check key presence periodically or on focus
  useEffect(() => {
    const updateKeyStatus = async () => {
      const status = await checkHasKey();
      setHasKey(status);
    };

    updateKeyStatus();

    const interval = setInterval(updateKeyStatus, 2000);
    
    window.addEventListener('focus', updateKeyStatus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', updateKeyStatus);
    };
  }, []);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex flex-col group" onClick={() => setIsMenuOpen(false)}>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg text-white group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5 sm:w-6 h-6" />
              </div>
              <span className="font-black text-xl sm:text-2xl tracking-tighter text-slate-900">CondoDefesa<span className="text-blue-600 italic">AI</span></span>
            </div>
            <span className="text-[8px] sm:text-[10px] text-red-600 font-black leading-none mt-1 ml-9 sm:ml-11 hidden xs:block uppercase tracking-tighter">
              “O Serasa do condomínio Faz  análise, diagnóstico e defesa em minutos.”
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={cn(
                    "font-bold flex items-center gap-1.5 text-xs transition-colors px-3 py-2 rounded-lg",
                    location.pathname === '/dashboard' ? "text-blue-600 bg-blue-50" : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                  )}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                <div className="relative">
                  <button 
                    onMouseEnter={() => setIsToolsOpen(true)}
                    onClick={() => setIsToolsOpen(!isToolsOpen)}
                    className={cn(
                      "font-bold flex items-center gap-1.5 text-xs transition-colors px-3 py-2 rounded-lg",
                      isToolsOpen ? "text-blue-600 bg-blue-50" : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                    )}
                  >
                    Ferramentas
                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isToolsOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {isToolsOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-0" 
                          onMouseEnter={() => setIsToolsOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          onMouseLeave={() => setIsToolsOpen(false)}
                          className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-10"
                        >
                          <div className="grid grid-cols-1 gap-1">
                            {[
                              { to: '/scanner', icon: Camera, label: 'Scanner de Multa', desc: 'Analise fotos de multas' },
                              { to: '/calculadora', icon: Calculator, label: 'Calculadora', desc: 'Juros e multas legais' },
                              { to: '/ata-digital', icon: FileText, label: 'Ata Digital', desc: 'Registre ocorrências' },
                              { to: '/preventiva', icon: ShieldCheck, label: 'Preventiva', desc: 'Audite sua convenção' },
                              { to: '/documentos', icon: FolderOpen, label: 'Documentos', desc: 'Gerencie seus arquivos' },
                              { to: '/protecao', icon: ShieldAlert, label: 'Proteção', desc: 'Direitos do condômino' },
                            ].map((item) => (
                              <Link
                                key={item.to}
                                to={item.to}
                                onClick={() => setIsToolsOpen(false)}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                              >
                                <div className="bg-slate-50 p-2 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                  <item.icon className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-[11px] font-black text-slate-900 leading-none">{item.label}</p>
                                  <p className="text-[9px] text-slate-400 mt-1">{item.desc}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <Link 
                  to="/quiz" 
                  className={cn(
                    "font-bold flex items-center gap-1.5 text-xs transition-colors px-3 py-2 rounded-lg",
                    location.pathname === '/quiz' ? "text-blue-600 bg-blue-50" : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                  )}
                >
                  <Trophy className="w-4 h-4" />
                  Quiz
                </Link>

                <Link 
                  to="/faq" 
                  className={cn(
                    "font-bold flex items-center gap-1.5 text-xs transition-colors px-3 py-2 rounded-lg",
                    location.pathname === '/faq' ? "text-blue-600 bg-blue-50" : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                  )}
                >
                  <HelpCircle className="w-4 h-4" />
                  FAQ
                </Link>

                <Link 
                  to="/sobre" 
                  className={cn(
                    "font-bold flex items-center gap-1.5 text-xs transition-colors px-3 py-2 rounded-lg",
                    location.pathname === '/sobre' ? "text-blue-600 bg-blue-50" : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                  )}
                >
                  <Shield className="w-4 h-4" />
                  Sobre
                </Link>

                <Link 
                  to="/analisar" 
                  className="relative group overflow-hidden bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black text-[11px] tracking-tight hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
                >
                  <Scale className="w-4 h-4" />
                  <span>Nova Análise</span>
                </Link>

                {hasAiStudio && !hasKey && (
                  <button 
                    onClick={handleSelectApiKey}
                    className="bg-amber-50 text-amber-700 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 border border-amber-200 hover:bg-amber-100 transition-all"
                  >
                    <Key className="w-4 h-4" />
                    API
                  </button>
                )}

                <button 
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-600 p-2 transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button 
                onClick={handleLogin}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                Entrar / Começar
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
            />
            
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 z-50 lg:hidden shadow-2xl overflow-hidden"
            >
              <div className="max-h-[80vh] overflow-y-auto py-6 px-4 space-y-6">
                {user ? (
                  <>
                    {/* User Profile Info */}
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-100">
                        {user.isAnonymous ? 'V' : (user.displayName?.[0] || 'U')}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-black text-slate-900 truncate">
                          {user.isAnonymous ? 'Visitante' : user.displayName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {user.isAnonymous ? 'Modo de Teste' : user.email}
                        </p>
                      </div>
                    </div>

                    {/* Primary Actions */}
                    <div className="grid grid-cols-1 gap-2">
                      <Link 
                        to="/analisar" 
                        onClick={() => setIsMenuOpen(false)}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl font-black transition-all shadow-lg",
                          location.pathname === '/analisar' 
                            ? "bg-blue-600 text-white shadow-blue-200" 
                            : "bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-blue-100"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Scale className="w-5 h-5" />
                          Nova Análise Jurídica
                        </div>
                        <ArrowUpRight className="w-4 h-4 opacity-60" />
                      </Link>
                    </div>

                    {/* Navigation Links Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {hasAiStudio && !hasKey && (
                        <button 
                          onClick={handleSelectApiKey}
                          className="col-span-2 flex items-center justify-center gap-3 p-4 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 font-black text-sm"
                        >
                          <Key className="w-5 h-5" />
                          CONFIGURAR CHAVE DE API
                        </button>
                      )}
                      {[
                        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                        { to: '/scanner', icon: Camera, label: 'Scanner de Multa' },
                        { to: '/calculadora', icon: Calculator, label: 'Calculadora' },
                        { to: '/ata-digital', icon: FileText, label: 'Ata Digital' },
                        { to: '/preventiva', icon: ShieldCheck, label: 'Preventiva' },
                        { to: '/documentos', icon: FolderOpen, label: 'Documentos' },
                        { to: '/protecao', icon: ShieldAlert, label: 'Proteção' },
                        { to: '/quiz', icon: Trophy, label: 'Quiz' },
                        { to: '/faq', icon: HelpCircle, label: 'FAQ' },
                        { to: '/suporte', icon: HelpCircle, label: 'Suporte' },
                        { to: '/sobre', icon: Shield, label: 'Sobre Nós' },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.to;
                        return (
                          <Link 
                            key={item.to}
                            to={item.to}
                            onClick={() => setIsMenuOpen(false)}
                            className={cn(
                              "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all",
                              isActive 
                                ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm" 
                                : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
                            )}
                          >
                            <Icon className={cn("w-6 h-6", isActive ? "text-blue-600" : "text-slate-400")} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>

                    {/* Logout */}
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-red-50 text-red-600 font-black text-sm hover:bg-red-100 transition-all"
                    >
                      <LogOut className="w-5 h-5" />
                      ENCERRAR SESSÃO
                    </button>
                  </>
                ) : (
                  <div className="py-4">
                    <button 
                      onClick={handleLogin}
                      className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-blue-100 flex items-center justify-center gap-3"
                    >
                      <Shield className="w-6 h-6" />
                      ENTRAR / CADASTRAR
                    </button>
                    <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-6">
                      Proteja seus direitos condominiais hoje
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </nav>
  );
}
