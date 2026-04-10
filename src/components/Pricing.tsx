import React from 'react';
import { motion } from 'motion/react';
import { Check, Shield, Zap, Building2, ArrowRight, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';

interface PricingProps {
  user: User | null;
  profile: UserProfile | null;
  onUpdateProfile?: () => void;
}

export default function Pricing({ user, profile, onUpdateProfile }: PricingProps) {
  const handleUpgrade = async (plan: 'free' | 'pro' | 'condo') => {
    if (!user) {
      toast.error('Você precisa estar logado para assinar um plano.');
      return;
    }

    if (profile?.plan === plan) {
      toast.info('Você já possui este plano.');
      return;
    }

    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, { plan });
      toast.success(`Plano atualizado para ${plan.toUpperCase()} com sucesso!`);
      if (onUpdateProfile) onUpdateProfile();
    } catch (error) {
      console.error('Error upgrading plan:', error);
      toast.error('Ocorreu um erro ao atualizar seu plano.');
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Essencial',
      price: 'R$ 0',
      period: '/sempre',
      description: 'Ideal para consultas rápidas e dúvidas pontuais.',
      features: [
        'Análise básica de 1 caso/mês',
        'Acesso ao Chat de Suporte IA',
        'Calculadora Financeira básica',
        'Visualização de direitos básicos',
      ],
      icon: Shield,
      color: 'slate',
      buttonText: 'Plano Atual',
      highlight: false
    },
    {
      id: 'pro',
      name: 'Defesa Pro',
      price: 'R$ 49,90',
      period: '/mês',
      description: 'Para quem precisa de defesa robusta e documentos prontos.',
      features: [
        'Análises ilimitadas',
        'Geração de Documentos Jurídicos',
        'Scanner de Multas Inteligente',
        'Suporte Prioritário IA',
        'Relatórios Detalhados',
      ],
      icon: Zap,
      color: 'blue',
      buttonText: 'Assinar Pro',
      highlight: true
    },
    {
      id: 'condo',
      name: 'Condomínio',
      price: 'R$ 199,90',
      period: '/mês',
      description: 'Gestão preventiva completa para síndicos e administradoras.',
      features: [
        'Tudo do Plano Pro',
        'Análise Preventiva de Convenção',
        'Gerador de Atas de Ocorrência',
        'Painel de Gestão de Conflitos',
        'Consultoria Preventiva IA',
      ],
      icon: Building2,
      color: 'emerald',
      buttonText: 'Assinar Condomínio',
      highlight: false
    }
  ];

  return (
    <div className="py-12 md:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest mb-4"
          >
            <Star className="w-4 h-4 fill-current" />
            Planos & Preços
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight"
          >
            Escolha sua <span className="text-blue-600">Blindagem Jurídica</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-lg max-w-2xl mx-auto font-medium"
          >
            Seja você um condômino ou um síndico, temos o plano ideal para garantir que as leis sejam respeitadas no seu condomínio.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className={cn(
                "relative flex flex-col p-8 rounded-[2.5rem] border-2 transition-all duration-300",
                plan.highlight 
                  ? "bg-white border-blue-600 shadow-2xl shadow-blue-100 scale-105 z-10" 
                  : "bg-white border-slate-100 hover:border-blue-200 shadow-xl shadow-slate-200/50"
              )}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                  Mais Popular
                </div>
              )}

              <div className="mb-8">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-6",
                  plan.color === 'blue' ? "bg-blue-100 text-blue-600" :
                  plan.color === 'emerald' ? "bg-emerald-100 text-emerald-600" :
                  "bg-slate-100 text-slate-600"
                )}>
                  <plan.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                  <span className="text-slate-400 font-bold text-sm">{plan.period}</span>
                </div>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="flex-grow space-y-4 mb-10">
                {plan.features.map((feature, fIndex) => (
                  <div key={fIndex} className="flex items-start gap-3">
                    <div className={cn(
                      "mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                      plan.highlight ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                    )}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleUpgrade(plan.id as any)}
                className={cn(
                  "w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 group",
                  plan.highlight
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {profile?.plan === plan.id ? 'Plano Atual' : plan.buttonText}
                {profile?.plan !== plan.id && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 p-8 bg-white rounded-[2rem] border border-slate-100 shadow-xl text-center"
        >
          <h4 className="text-xl font-black text-slate-900 mb-4">Precisa de uma solução personalizada?</h4>
          <p className="text-slate-500 font-medium mb-8 max-w-2xl mx-auto">
            Para grandes administradoras ou redes de condomínios, oferecemos planos Enterprise com integrações via API e suporte jurídico dedicado.
          </p>
          <button className="inline-flex items-center gap-2 text-blue-600 font-black uppercase tracking-widest text-sm hover:underline">
            Falar com um especialista
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
