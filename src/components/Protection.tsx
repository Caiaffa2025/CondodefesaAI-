import { motion } from 'motion/react';
import { ShieldAlert, AlertCircle, Info, Brain, Rocket, CheckCircle2, ArrowRight, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Protection() {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-black mb-8 uppercase tracking-widest"
            >
              <ShieldAlert className="w-4 h-4" />
              Alerta de Proteção
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-7xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tight"
            >
              🚨 Você está <span className="text-red-600 underline decoration-red-600/20 underline-offset-8">protegido</span> dentro do seu condomínio?
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl md:text-2xl text-slate-600 mb-12 leading-relaxed font-medium"
            >
              Mais de 80 milhões de brasileiros vivem em condomínios — e milhares enfrentam problemas todos os anos com síndicos e administradoras.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -mr-48 -mt-48" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="flex items-start gap-4">
                <div className="bg-blue-600/20 p-3 rounded-2xl text-blue-400 shrink-0">
                  <Scale className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-3xl md:text-4xl font-black mb-2 tracking-tighter">5.000 a 15.000</p>
                  <p className="text-slate-400 text-lg">Processos judiciais surgem a cada ano por conflitos condominiais no Brasil.</p>
                </div>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
                <p className="text-xl font-bold text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6" />
                  E o pior: a maioria poderia ser evitada.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-1 rounded-[3rem]">
                <div className="bg-slate-900 p-8 md:p-12 rounded-[2.9rem] text-center">
                  <h3 className="text-2xl font-black mb-6 uppercase tracking-widest text-blue-400">⚠️ Problemas mais comuns</h3>
                  <ul className="space-y-4 text-left">
                    {[
                      "Falta de transparência nas contas",
                      "Decisões sem aprovação dos moradores",
                      "Má gestão financeira",
                      "Cobranças indevidas",
                      "Abuso de poder do síndico"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-lg font-bold text-slate-200">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Truth Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 mb-8">
              💥 A verdade que <span className="text-blue-600">ninguém te conta</span>
            </h2>
            <div className="space-y-6 text-lg sm:text-xl text-slate-600 leading-relaxed">
              <p>Antes de virar processo, o condômino geralmente está perdido, sem orientação e sem saber seus direitos.</p>
              <p className="font-black text-slate-900 text-xl sm:text-2xl">E é exatamente nesse momento que prejuízos acontecem.</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-slate-900 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-16 text-white text-left relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-blue-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                  <Brain className="w-6 h-6 sm:w-8 h-8" />
                </div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">🧠 Surge o CondoDefesaAI</h3>
              </div>
              <p className="text-blue-200 text-lg sm:text-xl mb-10 font-medium">Uma plataforma criada para:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {[
                  "Orientar condôminos em tempo real",
                  "Identificar possíveis irregularidades",
                  "Ajudar você a agir antes que o problema piore",
                  "Evitar prejuízos e dores de cabeça"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white/5 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-white/10">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 h-6 text-emerald-400 shrink-0" />
                    <span className="font-bold text-base sm:text-lg">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <Brain className="absolute -bottom-20 -right-20 w-80 h-80 text-white/5 -z-0" />
          </motion.div>

          {/* New Solution Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 p-6 sm:p-8 border-2 border-red-600/20 bg-red-50 rounded-[2rem] sm:rounded-[2.5rem] text-center"
          >
            <h3 className="text-red-600 font-black text-xl sm:text-2xl uppercase tracking-widest mb-4">Nossa solução</h3>
            <p className="text-red-700 font-bold text-lg sm:text-xl md:text-2xl leading-relaxed">
              O CondoDefesaAI nasce para prevenir conflitos, orientar decisões e proteger condôminos de abusos — antes que o problema chegue à Justiça.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-8 leading-tight">
              🚀 Não espere virar um processo
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
              Quanto antes você agir, maior a chance de evitar conflitos, perdas financeiras e desgaste.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <Link
                to="/analisar"
                className="w-full sm:w-auto bg-white text-blue-600 px-8 sm:px-12 py-4 sm:py-6 rounded-xl sm:rounded-[2rem] font-black text-xl sm:text-2xl shadow-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 group"
              >
                Proteger meus direitos
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <p className="mt-10 text-blue-200 font-black text-base sm:text-lg uppercase tracking-widest flex items-center justify-center gap-2">
              <Info className="w-5 h-5" />
              Proteja seus direitos dentro do condomínio com inteligência.
            </p>
          </motion.div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid-cta" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-cta)" />
          </svg>
        </div>
      </section>
    </div>
  );
}
