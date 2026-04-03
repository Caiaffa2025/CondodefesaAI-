import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, MessageSquare, Phone, HelpCircle, BookOpen, ExternalLink, ChevronRight, Search, ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import SupportChatWidget from './SupportChatWidget';

export default function FloatingSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const relevantLinks = useMemo(() => [
    { q: 'Analisar meu caso', link: '/analisar' },
    { q: 'Central de Suporte', link: '/suporte' },
    { q: 'Sobre o CondoDefesa', link: '/sobre' },
    { q: 'Proteção Condominial', link: '/protecao' },
    { q: 'Meu Painel (Dashboard)', link: '/dashboard' },
    { q: 'Quiz de Direitos', link: '/quiz' },
    { q: 'Scanner de Multas', link: '/scanner' }
  ], []);

  const contextFaqs = useMemo(() => {
    const path = location.pathname;
    let faqs = [];
    
    if (path === '/dashboard') {
      faqs = [
        { q: 'Como funciona a análise?', link: '/suporte' },
        { q: 'Onde vejo meus documentos?', link: '/dashboard' },
        { q: 'Como fazer upgrade?', link: '/dashboard' }
      ];
    } else if (path === '/analisar') {
      faqs = [
        { q: 'Que tipo de problema relatar?', link: '/suporte' },
        { q: 'Quanto tempo demora?', link: '/suporte' },
        { q: 'Meus dados estão seguros?', link: '/privacidade' }
      ];
    } else if (path.startsWith('/caso/')) {
      faqs = [
        { q: 'Como baixar o PDF?', link: '/suporte' },
        { q: 'O que fazer agora?', link: '/suporte' },
        { q: 'Falar com advogado?', link: 'https://wa.me/5511984937529' }
      ];
    } else {
      faqs = [
        { q: 'O que é o CondoDefesa?', link: '/sobre' },
        { q: 'Como entrar em contato?', link: '/suporte' }
      ];
    }

    // Filter relevant links to exclude current page and include them in suggestions
    const suggestions = relevantLinks.filter(item => item.link !== path);
    
    const combined = [...faqs, ...suggestions];

    if (searchQuery.trim()) {
      return combined.filter(f => f.q.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    // If not searching, prioritize contextual FAQs but show some relevant links
    return combined.slice(0, 6);
  }, [location.pathname, searchQuery, relevantLinks]);

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-16 right-0 w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden"
          >
            <div className="bg-blue-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isChatOpen ? (
                  <button onClick={() => setIsChatOpen(false)} className="hover:scale-110 transition-transform">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                ) : (
                  <HelpCircle className="w-5 h-5" />
                )}
                <span className="font-black text-sm uppercase tracking-tight">
                  {isChatOpen ? 'Chat com IA' : 'Central de Ajuda'}
                </span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                {isChatOpen ? (
                  <motion.div
                    key="chat"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 50, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SupportChatWidget isMini className="h-[450px]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 space-y-4"
                  >
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Pesquisar ajuda..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                      />
                    </div>

                    {/* Contextual FAQs */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                        {searchQuery ? 'Resultados da Busca' : 'Dúvidas Frequentes'}
                      </p>
                      <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                        {contextFaqs.length > 0 ? (
                          contextFaqs.map((faq, i) => (
                            faq.link.startsWith('http') ? (
                              <a 
                                key={i}
                                href={faq.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 transition-colors text-slate-700 group border border-transparent hover:border-blue-100"
                              >
                                <span className="text-xs font-bold">{faq.q}</span>
                                <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-blue-600" />
                              </a>
                            ) : (
                              <Link 
                                key={i}
                                to={faq.link}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 transition-colors text-slate-700 group border border-transparent hover:border-blue-100"
                              >
                                <span className="text-xs font-bold">{faq.q}</span>
                                <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-blue-600" />
                              </Link>
                            )
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 text-center py-4">Nenhum resultado encontrado.</p>
                        )}
                      </div>
                    </div>

                    {/* Direct Support Links */}
                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Fale Conosco</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => setIsChatOpen(true)}
                          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition-all group border border-transparent hover:border-blue-100"
                        >
                          <MessageSquare className="w-5 h-5 text-blue-600" />
                          <span className="font-bold text-[10px]">Chat IA</span>
                        </button>
                        <a 
                          href="https://wa.me/5511984937529" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={() => setIsOpen(false)}
                          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 hover:bg-green-50 hover:text-green-600 transition-all group border border-transparent hover:border-green-100"
                        >
                          <Phone className="w-5 h-5 text-green-600" />
                          <span className="font-bold text-[10px]">WhatsApp</span>
                        </a>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl text-center">
                      <p className="text-[9px] text-slate-400 font-medium">
                        Atendimento humano: Seg-Sex, 9h às 18h
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95, rotate: -5 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white px-6 py-4 rounded-full shadow-2xl hover:bg-blue-700 transition-all flex items-center gap-3 relative group"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <HelpCircle className="w-6 h-6" />
            <span className="font-black text-sm uppercase tracking-tight hidden md:block">Ajuda</span>
          </>
        )}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
        )}
      </motion.button>
    </div>
  );
}
