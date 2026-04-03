import { motion } from 'motion/react';
import { ShieldCheck, Gavel, FileText, MessageCircle, ArrowRight, CheckCircle2, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-bold mb-6"
            >
              <ShieldCheck className="w-4 h-4" />
              Sua Defesa Condominial Inteligente
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight"
            >
              Justiça e Transparência para <span className="text-blue-600">Condôminos</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 mb-10 leading-relaxed"
            >
              A CondoDefesa AI nasceu para equilibrar o jogo. Utilizamos inteligência artificial de ponta para analisar abusos, multas indevidas e má gestão, devolvendo o poder para quem realmente importa: você.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-5 sm:p-6 border-2 border-red-600/20 bg-red-50 rounded-2xl sm:rounded-3xl text-center"
            >
              <p className="text-red-600 font-black text-lg sm:text-xl md:text-2xl leading-tight uppercase tracking-tighter">
                CondodefesaAI Não é só um sistema<br />
                <span className="text-red-700">É sua proteção contra abusos. Criado exclusivamente para o condômino brasileiro.</span>
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Alert Section (User Requested Text) */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[2.5rem] p-8 md:p-12 text-center text-white"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-6">
              🚨 SEU CONDOMÍNIO PODE ESTAR TE PREJUDICANDO
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl font-medium mb-8 leading-relaxed opacity-90">
              Muita gente paga multa, taxa ou aceita regras abusivas sem saber que isso pode ser ilegal.
            </p>
            <div className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-lg sm:text-xl inline-block mb-8">
              Eu analiso seu caso e te mostro exatamente o que fazer.
            </div>
            <p className="text-base sm:text-lg font-bold">
              Se quiser ajuda, comenta <span className="underline">“ANÁLISE”</span> ou me chama no direct.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How it Works / About the System */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-6">
                Como funciona o nosso <span className="text-blue-600">Ecossistema</span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed">
                Nossa plataforma não é apenas um gerador de documentos. É um cérebro jurídico digital treinado para identificar padrões de abuso e fornecer a melhor estratégia de defesa.
              </p>
              
              <div className="space-y-6">
                {[
                  {
                    icon: Zap,
                    title: "Análise Instantânea",
                    desc: "Nossa IA processa seu relato e documentos em segundos, identificando pontos de ilegalidade."
                  },
                  {
                    icon: Gavel,
                    title: "Estratégia Jurídica",
                    desc: "Receba um diagnóstico completo com base no Código Civil e jurisprudências atualizadas."
                  },
                  {
                    icon: FileText,
                    title: "Documentação Pronta",
                    desc: "Geramos notificações, impugnações e pedidos de esclarecimento prontos para uso."
                  }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="bg-blue-100 p-3 rounded-xl text-blue-600 shrink-0">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-blue-600/10 rounded-[3rem] blur-2xl" />
              <div className="relative bg-white p-8 rounded-[3rem] border border-slate-100 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-700">98% de precisão diagnóstica</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-700">+5.000 condôminos protegidos</span>
                  </div>
                  <div className="p-6 bg-blue-600 rounded-2xl text-white">
                    <p className="text-sm font-medium opacity-80 mb-2">Economia Gerada</p>
                    <p className="text-3xl font-black">R$ 1.2M+</p>
                    <p className="text-[10px] uppercase tracking-widest mt-2 opacity-60">Em multas e taxas revertidas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -mr-48 -mt-48" />
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-8">Pronto para retomar o controle?</h2>
          <p className="text-slate-400 text-base sm:text-lg mb-10 max-w-2xl mx-auto">
            Não aceite o abuso em silêncio. Nossa tecnologia está aqui para garantir que seus direitos sejam respeitados.
          </p>
          <Link
            to="/analisar"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-lg sm:text-xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-900/40 group"
          >
            Começar Análise Agora
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
