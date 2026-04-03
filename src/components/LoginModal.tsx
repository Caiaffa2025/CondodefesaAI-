import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Bem-vindo ao CondoDefesa AI!');
      onClose();
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Login failed", error);
      toast.error(error.message || 'Falha ao entrar com Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Acesse sua Conta</h2>
              <p className="text-slate-500 font-medium mb-10">
                Utilize sua conta <span className="text-blue-600 font-bold">Gmail</span> para acessar instantaneamente e proteger seus direitos.
              </p>

              <div className="space-y-4">
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full bg-white border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50 text-slate-700 py-4 px-6 rounded-2xl font-black flex items-center justify-center gap-3 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  ) : (
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  )}
                  {loading ? 'Autenticando...' : 'Entrar com Google (Gmail)'}
                </button>

                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-left">
                  <div className="flex gap-3">
                    <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-[10px] text-slate-600 leading-relaxed">
                      <p className="font-bold mb-1 text-blue-900">Problemas ao entrar?</p>
                      <ul className="list-disc ml-3 space-y-0.5">
                        <li>Certifique-se de que os <strong>pop-ups</strong> estão permitidos.</li>
                        <li>No Safari/iPhone, desative temporariamente o <strong>"Prevenir Rastreamento"</strong>.</li>
                        <li>Tente usar o navegador <strong>Chrome</strong> para melhor compatibilidade.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 font-medium mt-6 leading-relaxed">
                  Ao entrar, você concorda com nossos{' '}
                  <Link to="/termos" onClick={onClose} className="text-slate-500 hover:text-blue-600 underline transition-colors">Termos de Uso</Link>{' '}
                  e{' '}
                  <Link to="/privacidade" onClick={onClose} className="text-slate-500 hover:text-blue-600 underline transition-colors">Políticas de Privacidade</Link>
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
              <p className="text-sm text-slate-500 font-medium">
                Dificuldade com o login? <button onClick={() => navigate('/suporte')} className="text-blue-600 font-bold hover:underline">Fale com o suporte</button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
