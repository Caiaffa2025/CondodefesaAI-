import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, ArrowRight, Loader2, Mail, Lock, UserPlus, LogIn, UserCircle } from 'lucide-react';
import { loginWithEmail, registerWithEmail, loginAnonymously } from '../lib/firebase';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      await loginAnonymously();
      toast.success('Entrando como visitante...');
      onClose();
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Guest login failed", error);
      if (error.code === 'auth/admin-restricted-operation') {
        toast.error(
          <div className="flex flex-col gap-2">
            <p className="font-bold">Acesso de Visitante desativado!</p>
            <p className="text-xs">Você precisa ativar o "Anonymous Auth" no Console do Firebase para este botão funcionar.</p>
            <a 
              href="https://console.firebase.google.com/project/gen-lang-client-0332084757/authentication/providers" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-red-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase text-center hover:bg-red-50 transition-all shadow-sm"
            >
              Ativar no Console agora
            </a>
          </div>,
          { duration: 10000 }
        );
      } else {
        toast.error('Erro ao entrar como visitante.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegistering && !displayName)) {
      toast.error('Preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        await registerWithEmail(email, password, displayName);
        toast.success('Conta criada com sucesso!');
      } else {
        await loginWithEmail(email, password);
        toast.success('Bem-vindo de volta!');
      }
      onClose();
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Auth failed", error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Este e-mail já está em uso.');
      } else if (error.code === 'auth/invalid-credential') {
        toast.error('E-mail ou senha incorretos.');
      } else if (error.code === 'auth/weak-password') {
        toast.error('A senha deve ter pelo menos 6 caracteres.');
      } else {
        toast.error('Ocorreu um erro na autenticação.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[95vh]"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all z-10"
            >
              <X className="w-5 h-5 sm:w-6 h-6" />
            </button>

            <div className="p-6 sm:p-8 md:p-10 overflow-y-auto custom-scrollbar">
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4 shadow-lg shadow-blue-50">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 tracking-tight">
                  {isRegistering ? 'Criar Nova Conta' : 'Acesse sua Conta'}
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm font-medium">
                  {isRegistering 
                    ? 'Cadastre-se para começar a proteger seus direitos.' 
                    : 'Entre com seu e-mail e senha para acessar o painel.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegistering && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                    <div className="relative">
                      <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Seu nome"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-bold text-slate-700"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3.5 sm:py-4 px-6 rounded-2xl font-black flex items-center justify-center gap-3 transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 disabled:opacity-50 shadow-sm mt-6 text-sm sm:text-base"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {isRegistering ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                      {isRegistering ? 'Criar Conta' : 'Entrar'}
                      <ArrowRight className="w-5 h-5 ml-auto opacity-50" />
                    </>
                  )}
                </button>

                <div className="relative my-6 sm:my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100"></div>
                  </div>
                  <div className="relative flex justify-center text-[9px] sm:text-[10px] uppercase font-black tracking-widest">
                    <span className="bg-white px-4 text-slate-400">Ou entre sem cadastro</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGuestLogin}
                  disabled={loading}
                  className="w-full bg-slate-50 text-slate-600 py-3.5 sm:py-4 px-6 rounded-2xl font-black flex items-center justify-center gap-3 transition-all hover:bg-slate-100 disabled:opacity-50 border border-slate-100 text-sm sm:text-base"
                >
                  <UserCircle className="w-5 h-5" />
                  Entrar como Visitante
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
                >
                  {isRegistering ? 'Já tem uma conta? Entre aqui' : 'Não tem conta? Cadastre-se'}
                </button>
              </div>

              <p className="text-[10px] text-slate-400 font-medium mt-8 text-center leading-relaxed">
                Ao continuar, você concorda com nossos{' '}
                <Link to="/termos" onClick={onClose} className="text-slate-500 hover:text-blue-600 underline transition-colors">Termos de Uso</Link>{' '}
                e{' '}
                <Link to="/privacidade" onClick={onClose} className="text-slate-500 hover:text-blue-600 underline transition-colors">Políticas de Privacidade</Link>
              </p>
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
