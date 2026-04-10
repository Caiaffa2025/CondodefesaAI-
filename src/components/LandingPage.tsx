import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, AlertTriangle, FileText, ArrowRight, Star, HelpCircle, Zap, Scale, Users, MessageSquare, Trophy, Building2 } from 'lucide-react';
import { logout } from '../lib/firebase';
import { toast } from 'sonner';
import { useRef, useState, useEffect, lazy, Suspense } from 'react';
import { cn } from '../lib/utils';
import LoginModal from './LoginModal';

const Pricing = lazy(() => import('./Pricing'));

interface LandingPageProps {
  user: User | null;
}

export default function LandingPage({ user }: LandingPageProps) {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const [isBlinking, setIsBlinking] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBlinking(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const handleCTA = () => {
    if (user) {
      navigate('/analisar');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  return (
    <div className="overflow-hidden bg-white" ref={containerRef}>
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-blue-600 origin-left z-[60]"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 pb-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.div 
            style={{ y: y1, opacity }}
            className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px]"
          />
          <motion.div 
            style={{ y: useTransform(scrollYProgress, [0, 1], [0, -150]), opacity }}
            className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px]"
          />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
          
          {/* Floating Elements */}
          <motion.div 
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] right-[15%] hidden md:block"
          >
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/50 flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg text-green-600">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Status</p>
                <p className="text-sm font-black text-slate-900">Multa Anulada</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[30%] left-[10%] hidden md:block"
          >
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/50 flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">IA Ativa</p>
                <p className="text-sm font-black text-slate-900">Análise em 12s</p>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                Justiça Condominial em Tempo Real
              </motion.div>

              <h1 className="text-4xl xs:text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 mb-6 leading-[1.1] sm:leading-[1.05]">
                Seu condomínio está <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">abusando de você?</span>
              </h1>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-red-600 font-black text-base sm:text-xl md:text-2xl mb-6 px-4 tracking-tight uppercase"
              >
                “O Serasa do condomínio Faz análise, diagnóstico e defesa em minutos.”
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={isBlinking ? { 
                  opacity: [0, 1, 0, 1],
                  y: 0 
                } : { 
                  opacity: 1, 
                  y: 0 
                }}
                transition={isBlinking ? { 
                  opacity: { repeat: Infinity, duration: 0.8, ease: "easeInOut" },
                  y: { duration: 0.8 }
                } : { 
                  duration: 0.5 
                }}
                className="mb-10 px-4"
              >
                <p className={cn(
                  "font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight uppercase tracking-tighter transition-colors duration-500",
                  isBlinking ? "text-red-600" : "text-blue-600"
                )}>
                  CondodefesaAI Não é só um sistema<br className="hidden sm:block" />
                  <span className={cn("block mt-2", isBlinking ? "text-red-700" : "text-blue-700")}>
                    É sua proteção contra abusos. Criado exclusivamente para o condômino brasileiro.
                  </span>
                </p>
              </motion.div>

              <p className="text-base sm:text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto mb-12 leading-relaxed px-6 font-medium">
                Nossa IA jurídica analisa multas, taxas e abusos de síndicos em segundos, gerando documentos prontos para sua defesa imediata.
              </p>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 px-4 mb-20">
                <motion.button 
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCTA}
                  className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 sm:px-10 sm:py-5 rounded-2xl font-black text-lg sm:text-xl hover:bg-blue-700 transition-all shadow-xl flex items-center justify-center gap-3 group"
                >
                  Analisar meu caso agora
                  <ArrowRight className="w-5 h-5 sm:w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.a 
                  whileHover={{ backgroundColor: "rgba(241, 245, 249, 1)" }}
                  href="#como-funciona"
                  className="w-full sm:w-auto bg-slate-50 text-slate-700 px-8 py-4 sm:px-10 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl border border-slate-200 transition-all flex items-center justify-center"
                >
                  Ver como funciona
                </motion.a>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="flex items-center gap-2 font-bold text-slate-400 text-xs sm:text-sm">
                  <Shield className="w-4 h-4 sm:w-5 h-5" />
                  <span>100% SEGURO</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-400 text-xs sm:text-sm">
                  <Scale className="w-4 h-4 sm:w-5 h-5" />
                  <span>BASE LEGAL ATUALIZADA</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-400 text-xs sm:text-sm">
                  <Users className="w-4 h-4 sm:w-5 h-5" />
                  <span>+500 CASOS RESOLVIDOS</span>
                </div>
              </div>

              {/* Partners/Logos */}
              <div className="mt-20 pt-10 border-t border-slate-100 flex flex-wrap justify-center gap-6 sm:gap-12 md:gap-16 opacity-30 grayscale">
                <div className="text-lg sm:text-xl font-black tracking-tighter">OAB/SP</div>
                <div className="text-lg sm:text-xl font-black tracking-tighter italic">CÓDIGO CIVIL</div>
                <div className="text-lg sm:text-xl font-black tracking-tighter uppercase">LGPD Compliant</div>
                <div className="text-lg sm:text-xl font-black tracking-tighter uppercase">AI Justice</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-20 sm:py-32 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-xs sm:text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Poder de Fogo</h2>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-tight">Tecnologia a favor do morador</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-2 lg:col-span-2 bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 sm:gap-10 items-center"
            >
              <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-blue-200 shadow-2xl">
                <Shield className="w-10 h-10 sm:w-12 h-12" />
              </div>
              <div className="text-center md:text-left">
                <h4 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">Análise com IA Jurídica</h4>
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed">Nossa plataforma não apenas lê seu relato; ela cruza cada detalhe com o Código Civil, a Lei do Condomínio e jurisprudências recentes para encontrar brechas e abusos.</p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-blue-600 p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl text-white flex flex-col justify-between"
            >
              <AlertTriangle className="w-10 h-10 sm:w-12 h-12 mb-8 opacity-50" />
              <div>
                <h4 className="text-xl sm:text-2xl font-black mb-4">Detecta Abusos Reais</h4>
                <p className="text-blue-100 text-sm sm:text-base leading-relaxed">Dizemos explicitamente se há abuso da síndica ou administradora no seu caso, sem rodeios.</p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between"
            >
              <FileText className="w-10 h-10 sm:w-12 h-12 text-blue-600 mb-8" />
              <div>
                <h4 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">Defesa Automática</h4>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">Gera notificações jurídicas e impugnações automaticamente, formatadas e prontas para envio.</p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-2 lg:col-span-2 bg-slate-900 p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl text-white flex flex-col md:flex-row gap-6 sm:gap-10 items-center"
            >
              <div className="bg-blue-600 p-6 rounded-3xl text-white">
                <Zap className="w-10 h-10 sm:w-12 h-12" />
              </div>
              <div className="text-center md:text-left">
                <h4 className="text-xl sm:text-2xl font-black mb-4">Velocidade de Resposta</h4>
                <p className="text-slate-400 text-base sm:text-lg leading-relaxed">O que levaria semanas com um consultor tradicional, resolvemos em menos de 2 minutos. O tempo está do seu lado.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-20 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 sm:mb-20 gap-8">
            <div className="max-w-2xl text-center md:text-left">
              <h2 className="text-xs sm:text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-4">O que combatemos</h2>
              <h3 className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-900 leading-tight">Identificamos abusos que você nem sabia que existiam</h3>
            </div>
            <p className="text-slate-600 text-base sm:text-lg max-w-sm text-center md:text-right">Não aceite cobranças ou regras sem antes passar pela nossa análise.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { icon: AlertTriangle, title: "Multas Injustas", desc: "Multas aplicadas sem direito de defesa, sem provas ou fora das normas da convenção.", color: "bg-red-50 text-red-600" },
              { icon: Shield, title: "Abuso de Síndico", desc: "Decisões autoritárias, falta de prestação de contas ou perseguição pessoal e seletiva.", color: "bg-blue-50 text-blue-600" },
              { icon: FileText, title: "Taxas Indevidas", desc: "Cobranças extras não aprovadas em assembleia ou rateios irregulares e abusivos.", color: "bg-indigo-50 text-indigo-600" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="group p-8 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] border border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100 transition-all duration-500 bg-white"
              >
                <div className={cn("w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 duration-500", item.color)}>
                  <item.icon className="w-7 h-7 sm:w-8 h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black mb-4 text-slate-900">{item.title}</h3>
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works - Modern Timeline */}
      <section id="como-funciona" className="py-20 sm:py-32 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent_70%)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 sm:mb-24">
            <h2 className="text-xs sm:text-sm font-black text-blue-400 uppercase tracking-[0.2em] mb-4">O Caminho</h2>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black">Simples, rápido e 100% digital</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16">
            {[
              { step: "01", title: "Relate o Problema", desc: "Conte-nos o que está acontecendo no seu condomínio em linguagem simples. Sem juridiquês.", icon: MessageSquare },
              { step: "02", title: "Análise Inteligente", desc: "Nossa IA cruza os dados com o Código Civil e normas condominiais em tempo real.", icon: Zap },
              { step: "03", title: "Documentos Prontos", desc: "Receba um diagnóstico completo e documentos para agir imediatamente contra o abuso.", icon: FileText }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative group text-center md:text-left"
              >
                <div className="text-7xl sm:text-8xl font-black text-white/5 absolute -top-10 sm:-top-12 left-1/2 md:left-[-1rem] -translate-x-1/2 md:translate-x-0 select-none">
                  {item.step}
                </div>
                <div className="bg-blue-600 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-900/20 group-hover:scale-110 transition-transform mx-auto md:mx-0">
                  <item.icon className="w-7 h-7 sm:w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black mb-4">{item.title}</h3>
                <p className="text-slate-400 text-base sm:text-lg leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quiz Section */}
      <section className="py-20 sm:py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-[2rem] sm:rounded-[4rem] p-8 sm:p-12 md:p-20 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 items-center">
              <div className="text-center lg:text-left">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  Desafio de Conhecimento
                </motion.div>
                <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-6 leading-tight">
                  Você conhece seus direitos no condomínio?
                </h2>
                <p className="text-blue-100/70 text-base sm:text-lg md:text-xl mb-10 leading-relaxed">
                  Muitos moradores aceitam abusos por simples desconhecimento da lei. Teste seu nível de conhecimento agora com nosso quiz interativo e gratuito.
                </p>
                <Link
                  to="/quiz"
                  className="inline-flex items-center gap-3 bg-white text-blue-900 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-black text-lg sm:text-xl hover:bg-blue-50 transition-all shadow-xl hover:-translate-y-1 w-full sm:w-auto justify-center"
                >
                  Fazer o Quiz Grátis
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </div>
              <div className="relative mt-8 lg:mt-0">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  className="bg-white/10 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-white/20 shadow-2xl"
                >
                  <div className="space-y-4 sm:space-y-6">
                    {[
                      "Qual o quórum para obras voluptuárias?",
                      "O síndico pode ser destituído?",
                      "Qual o limite da multa por atraso?"
                    ].map((q, i) => (
                      <div key={i} className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500 flex items-center justify-center font-black text-xs sm:text-sm shrink-0">
                          {i + 1}
                        </div>
                        <span className="font-bold text-blue-50 text-sm sm:text-base">{q}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
                <Trophy className="absolute -bottom-10 -right-10 w-32 h-32 sm:w-48 sm:h-48 text-white/5 -z-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Premium Testimonials */}
      <section className="py-20 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-24">
            <h2 className="text-xs sm:text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Impacto Real</h2>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900">O que dizem nossos usuários</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
            {[
              { name: "Ricardo S.", role: "Morador em SP", text: "Consegui anular uma multa de R$ 800,00 com a notificação gerada pela plataforma. O síndico recuou na hora que viu o embasamento jurídico.", stars: 5 },
              { name: "Mariana L.", role: "Moradora em Curitiba", text: "O síndico parou de me perseguir depois que enviei o pedido formal de esclarecimentos. A CondoDefesa me deu a voz que eu não tinha.", stars: 5 }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-slate-50 p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[3rem] border border-slate-100 relative"
              >
                <div className="flex gap-1 mb-6 sm:mb-8">
                  {[...Array(item.stars)].map((_, j) => <Star key={j} className="w-4 h-4 sm:w-5 h-5 fill-current text-yellow-400" />)}
                </div>
                <p className="text-lg sm:text-2xl font-medium text-slate-800 mb-8 sm:mb-10 leading-relaxed italic">"{item.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-sm sm:text-base">
                    {item.name[0]}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm sm:text-base">{item.name}</p>
                    <p className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider">{item.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-20 sm:py-32 bg-slate-50">
        <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div></div>}>
          <Pricing user={user} profile={null} />
        </Suspense>
      </section>

      {/* FAQ - Clean & Functional */}
      <section className="py-20 sm:py-32 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-xs sm:text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Dúvidas</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900">Perguntas Frequentes</h3>
          </div>

          <div className="space-y-4">
            {[
              { q: "Isso substitui um advogado?", a: "Não. Somos uma ferramenta de apoio informativo e diagnóstico. Para casos que exigem representação judicial ou consultoria jurídica personalizada, recomendamos sempre a contratação de um advogado especializado." },
              { q: "Quanto tempo leva para receber a análise?", a: "A análise é instantânea. Assim que você descreve seu problema, nossa IA processa as informações e gera o diagnóstico e os documentos em poucos segundos." },
              { q: "E se o síndico ou a administradora ignorarem o documento?", a: "Nossos documentos são fundamentados em normas legais (Código Civil e leis condominiais). O descumprimento pode servir como prova em uma futura ação judicial, demonstrando sua tentativa de resolução amigável." },
              { q: "Posso usar para qualquer tipo de condomínio?", a: "Sim. A plataforma está configurada para atender condomínios residenciais, comerciais e mistos em todo o território brasileiro, baseando-se na legislação nacional." },
              { q: "É seguro compartilhar meus dados?", a: "Totalmente. Utilizamos criptografia de ponta a ponta e seguimos rigorosamente a LGPD (Lei Geral de Proteção de Dados). Seus relatos são usados apenas para gerar sua análise personalizada." },
              { q: "Quais documentos são gerados?", a: "Dependendo da gravidade, geramos notificações extrajudiciais, pedidos formais de esclarecimentos, impugnações de multas e roteiros de argumentação para assembleias." },
              { q: "A plataforma é gratuita?", a: "Oferecemos uma análise inicial gratuita para que você entenda seus direitos. Para recursos avançados e geração de documentos complexos, temos planos acessíveis." }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 overflow-hidden"
              >
                <details className="group">
                  <summary className="flex justify-between items-center p-6 sm:p-8 cursor-pointer list-none font-black text-base sm:text-lg text-slate-900">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <HelpCircle className="w-5 h-5 sm:w-6 h-6 text-blue-600" />
                      {item.q}
                    </div>
                    <span className="transition-transform group-open:rotate-180">
                      <ArrowRight className="w-4 h-4 sm:w-5 h-5 rotate-90" />
                    </span>
                  </summary>
                  <div className="px-6 sm:px-8 pb-6 sm:pb-8 text-slate-600 text-base sm:text-lg leading-relaxed border-t border-slate-100 pt-6">
                    {item.a}
                  </div>
                </details>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Aggressive & High Impact */}
      <section className="py-20 sm:py-32 bg-blue-600 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%,transparent)] bg-[length:64px_64px] opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black mb-8 leading-tight">Não deixe seus direitos <br /> serem pisoteados</h2>
            <p className="text-yellow-300 font-black text-lg sm:text-2xl mb-12 uppercase tracking-widest italic px-4">“Descubra seus direitos antes que seja tarde.”</p>
            <p className="text-base sm:text-xl md:text-2xl text-blue-100 mb-16 max-w-3xl mx-auto font-medium px-6">
              Junte-se a centenas de condôminos que já equilibraram as forças no condomínio. O conhecimento é sua melhor arma.
            </p>
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: "#ffffff", color: "#2563eb" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCTA}
              className="bg-white text-blue-600 px-8 sm:px-12 py-4 sm:py-6 rounded-2xl sm:rounded-[2rem] font-black text-lg sm:text-2xl shadow-2xl transition-all w-[90%] sm:w-auto mx-auto"
            >
              Começar Agora Gratuitamente
            </motion.button>
          </motion.div>
        </div>
      </section>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}
