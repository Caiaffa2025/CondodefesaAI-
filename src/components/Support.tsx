import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Loader2, MessageSquare, Shield, HelpCircle, Phone, ArrowLeft, ChevronDown, Search, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supportChat } from '../lib/gemini';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, doc } from 'firebase/firestore';
import { toast } from 'sonner';

import SupportChatWidget from './SupportChatWidget';

interface FaqItemData {
  id?: string;
  question: string;
  answer: string;
  order?: number;
}

interface FaqItemProps {
  faq: FaqItemData;
  isOpen: boolean;
  onClick: () => void;
  isAdmin: boolean;
  onEdit: (faq: FaqItemData) => void;
  onDelete: (id: string) => void;
}

function FaqItem({ faq, isOpen, onClick, isAdmin, onEdit, onDelete }: FaqItemProps) {
  return (
    <div className="border-b border-slate-100 last:border-0">
      <div className="flex items-center justify-between group">
        <button
          onClick={onClick}
          className="flex-grow py-4 flex items-center justify-between text-left transition-all"
        >
          <span className={cn(
            "font-bold text-sm transition-colors pr-4",
            isOpen ? "text-blue-600" : "text-slate-700 group-hover:text-blue-600"
          )}>
            {faq.question}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "p-1 rounded-full transition-colors flex-shrink-0",
              isOpen ? "bg-blue-50 text-blue-600" : "text-slate-400 group-hover:text-blue-600"
            )}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </button>
        
        {isAdmin && (
          <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(faq); }}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              title="Editar FAQ"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); faq.id && onDelete(faq.id); }}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Excluir FAQ"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-slate-500 leading-relaxed">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Support() {
  const [faqs, setFaqs] = useState<FaqItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Management state
  const [isEditing, setIsEditing] = useState(false);
  const [currentFaq, setCurrentFaq] = useState<FaqItemData | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');

  useEffect(() => {
    // Check admin status
    const checkAdmin = () => {
      const user = auth.currentUser;
      if (user && user.email === "scaiaffa2014@gmail.com" && user.emailVerified) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };
    
    checkAdmin();
    const unsubscribeAuth = auth.onAuthStateChanged(checkAdmin);

    // Fetch FAQs
    const q = query(collection(db, 'faqs'), orderBy('order', 'asc'));
    const unsubscribeFaqs = onSnapshot(q, (snapshot) => {
      const faqList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FaqItemData[];
      setFaqs(faqList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'faqs');
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeFaqs();
    };
  }, []);

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveFaq = async () => {
    if (!editQuestion.trim() || !editAnswer.trim()) {
      toast.error('Preencha todos os campos.');
      return;
    }

    try {
      if (currentFaq?.id) {
        // Update
        await updateDoc(doc(db, 'faqs', currentFaq.id), {
          question: editQuestion,
          answer: editAnswer,
          updatedAt: serverTimestamp()
        });
        toast.success('FAQ atualizado com sucesso!');
      } else {
        // Create
        await addDoc(collection(db, 'faqs'), {
          question: editQuestion,
          answer: editAnswer,
          order: faqs.length,
          createdAt: serverTimestamp()
        });
        toast.success('FAQ adicionado com sucesso!');
      }
      setIsEditing(false);
      setCurrentFaq(null);
      setEditQuestion('');
      setEditAnswer('');
    } catch (error) {
      toast.error('Erro ao salvar FAQ.');
      console.error(error);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este FAQ?')) return;
    try {
      await deleteDoc(doc(db, 'faqs', id));
      toast.success('FAQ excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir FAQ.');
    }
  };

  const startEdit = (faq: FaqItemData) => {
    setCurrentFaq(faq);
    setEditQuestion(faq.question);
    setEditAnswer(faq.answer);
    setIsEditing(true);
  };

  const startAdd = () => {
    setCurrentFaq(null);
    setEditQuestion('');
    setEditAnswer('');
    setIsEditing(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium mb-6 sm:mb-8 transition-colors text-sm sm:text-base">
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chat Section */}
        <div className="lg:col-span-2">
          <SupportChatWidget className="h-[500px] sm:h-[600px] rounded-3xl shadow-xl border border-slate-100" />
        </div>

        {/* Info Section */}
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                Dúvidas Frequentes
              </h2>
              {isAdmin && (
                <button 
                  onClick={startAdd}
                  className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
                  title="Adicionar FAQ"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search Field */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Buscar dúvidas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-600 transition-all"
              />
            </div>

            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="py-8 flex justify-center">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
              ) : filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, index) => (
                  <FaqItem
                    key={faq.id || index}
                    faq={faq}
                    isOpen={openFaqIndex === index}
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    isAdmin={isAdmin}
                    onEdit={startEdit}
                    onDelete={handleDeleteFaq}
                  />
                ))
              ) : (
                <div className="py-8 text-center">
                  <p className="text-xs sm:text-sm text-slate-400">Nenhuma dúvida encontrada.</p>
                </div>
              )}
            </div>
          </div>

          {/* Management Modal/Form */}
          <AnimatePresence>
            {isEditing && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
                >
                  <div className="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      {currentFaq ? 'Editar FAQ' : 'Novo FAQ'}
                    </h3>
                    <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                      <X className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>
                  <div className="p-5 sm:p-6 space-y-4">
                    <div>
                      <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pergunta</label>
                      <input 
                        type="text"
                        value={editQuestion}
                        onChange={(e) => setEditQuestion(e.target.value)}
                        placeholder="Ex: Como funciona a análise?"
                        className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition-all text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Resposta</label>
                      <textarea 
                        value={editAnswer}
                        onChange={(e) => setEditAnswer(e.target.value)}
                        placeholder="Ex: Nossa IA processa seu relato..."
                        className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition-all text-xs sm:text-sm min-h-[120px]"
                      />
                    </div>
                    <button 
                      onClick={handleSaveFaq}
                      className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <Check className="w-5 h-5" />
                      Salvar FAQ
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          <div className="bg-green-50 p-5 sm:p-6 rounded-3xl border border-green-100 shadow-sm">
            <h2 className="font-bold text-green-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
              <Phone className="w-5 h-5 text-green-600" />
              Suporte WhatsApp
            </h2>
            <p className="text-xs sm:text-sm text-green-700 mb-4 leading-relaxed">Fale com um atendente humano para questões administrativas.</p>
            <a 
              href="https://wa.me/5511984937529" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full bg-green-600 text-white py-3.5 rounded-xl font-bold text-center hover:bg-green-700 transition-all shadow-md text-sm sm:text-base"
            >
              Abrir WhatsApp
            </a>
          </div>

          <div className="bg-slate-900 p-5 sm:p-6 rounded-3xl text-white shadow-xl">
            <h2 className="font-bold mb-2 flex items-center gap-2 text-sm sm:text-base">
              <Shield className="w-5 h-5 text-blue-400" />
              Segurança
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-400 leading-relaxed">
              Seus dados estão protegidos e são usados apenas para a análise do seu caso. Não compartilhamos informações com terceiros.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
