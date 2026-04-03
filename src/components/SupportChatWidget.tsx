import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import { supportChat } from '../lib/gemini';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface SupportChatWidgetProps {
  className?: string;
  isMini?: boolean;
}

export default function SupportChatWidget({ className, isMini = false }: SupportChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Olá! Sou o assistente de suporte da CondoDefesa AI. Como posso ajudar você hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSelectApiKey = async () => {
    try {
      if ((window as any).aistudio) {
        await (window as any).aistudio.openSelectKey();
      }
    } catch (e) {
      console.error("Error opening API key selector", e);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const response = await supportChat(userMessage, history);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      console.error("Support chat error", error);
      let errorMessage = 'Desculpe, tive um problema ao processar sua mensagem. Tente novamente em instantes.';
      if (error instanceof Error && (error.message.includes('API key') || error.message.includes('Chave de API') || error.message.includes('Configurar API'))) {
        errorMessage = error.message;
      }
      setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col bg-white overflow-hidden", className)}>
      {!isMini && (
        <div className="bg-blue-600 p-6 text-white flex items-center gap-3">
          <MessageSquare className="w-6 h-6" />
          <div>
            <h1 className="font-bold text-lg leading-none">Chat de Suporte</h1>
            <p className="text-blue-100 text-xs mt-1">IA treinada em direito condominial</p>
          </div>
        </div>
      )}

      <div 
        ref={scrollRef}
        className={cn(
          "flex-grow overflow-y-auto p-4 space-y-6 bg-slate-50/50 custom-scrollbar",
          isMini ? "h-[350px]" : "h-[500px]"
        )}
      >
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex flex-col gap-1.5",
                m.role === 'user' ? "items-end" : "items-start"
              )}
            >
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest px-1",
                m.role === 'user' ? "text-blue-600" : "text-slate-400"
              )}>
                {m.role === 'user' ? 'Você' : 'CondoDefesa IA'}
              </span>
              <div
                className={cn(
                  "max-w-[90%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm",
                  m.role === 'user' 
                    ? "bg-blue-600 text-white rounded-tr-none" 
                    : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                )}
              >
                <div className="markdown-body">
                  <Markdown>{m.text}</Markdown>
                  {(m.text.includes('Chave de API') || m.text.includes('Configurar API')) && (window as any).aistudio && (
                    <button
                      type="button"
                      onClick={handleSelectApiKey}
                      className="mt-3 text-[10px] bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg font-bold transition-colors"
                    >
                      Configurar Chave de API
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1"
          >
            <Loader2 className="w-3 h-3 animate-spin" />
            IA está digitando...
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua dúvida..."
          className="flex-grow px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all text-xs"
        />
        <button
          disabled={loading || !input.trim()}
          type="submit"
          className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-all shadow-md disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
