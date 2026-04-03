import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { CondoCase } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Download, 
  Copy, 
  Check, 
  AlertTriangle, 
  FileText, 
  ShieldCheck, 
  Gavel, 
  Trash2,
  Printer,
  PlusCircle,
  X,
  MessageCircle,
  Info,
  FileCheck,
  ThumbsUp,
  ThumbsDown,
  Send,
  Eye,
  Maximize2,
  Bell,
  BellRing
} from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { AnimatePresence } from 'motion/react';
import { updateDoc } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import { requestNotificationPermission } from '../lib/notifications';

interface CaseDetailProps {
  user: User;
}

export default function CaseDetail({ user }: CaseDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [condoCase, setCondoCase] = useState<CondoCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [selectedHelpful, setSelectedHelpful] = useState<boolean | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfPreviewTitle, setPdfPreviewTitle] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    typeof Notification !== 'undefined' && Notification.permission === 'granted'
  );
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'rights' | 'steps' | 'docs'>('diagnosis');

  const tabs = [
    { id: 'diagnosis', label: 'Diagnóstico', icon: ShieldCheck },
    { id: 'rights', label: 'Seus Direitos', icon: Gavel },
    { id: 'steps', label: 'Próximos Passos', icon: PlusCircle },
    { id: 'docs', label: 'Documentos', icon: FileText },
  ] as const;

  useEffect(() => {
    const fetchCase = async () => {
      if (!id) return;
      const path = `cases/${id}`;
      try {
        const docRef = doc(db, 'cases', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as CondoCase;
          if (data.userId !== user.uid) {
            navigate('/dashboard');
            return;
          }
          setCondoCase({ id: docSnap.id, ...data });
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [id, user.uid, navigate]);

  const toggleNotifications = async () => {
    if (!id || !condoCase) return;

    if (!notificationsEnabled) {
      const token = await requestNotificationPermission(user.uid);
      if (!token) {
        toast.error('Você precisa permitir notificações no navegador primeiro.');
        return;
      }
      setNotificationsEnabled(true);
    }

    try {
      const caseRef = doc(db, 'cases', id);
      const newStatus = !condoCase.notificationsEnabled;
      await updateDoc(caseRef, {
        notificationsEnabled: newStatus
      });
      setCondoCase({ ...condoCase, notificationsEnabled: newStatus });
      toast.success(newStatus ? 'Notificações ativadas para este caso!' : 'Notificações desativadas para este caso.');
    } catch (error) {
      toast.error('Erro ao atualizar notificações.');
    }
  };

  const handleFeedback = async (helpful: boolean) => {
    if (!id || !condoCase) return;
    
    setSelectedHelpful(helpful);
    setShowCommentInput(true);
  };

  const submitFeedback = async () => {
    if (!id || selectedHelpful === null) return;
    
    setIsSubmittingFeedback(true);
    const path = `cases/${id}`;
    try {
      await updateDoc(doc(db, 'cases', id), {
        feedback: {
          helpful: selectedHelpful,
          comment: feedbackComment,
          createdAt: new Date().toISOString()
        }
      });
      setFeedbackSubmitted(true);
      toast.success('Obrigado pelo seu feedback!');
    } catch (error) {
      toast.error('Erro ao enviar feedback.');
      handleFirestoreError(error, OperationType.UPDATE, path);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success('Texto copiado para a área de transferência!');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async () => {
    if (!id || !window.confirm("Tem certeza que deseja excluir esta análise?")) return;
    const path = `cases/${id}`;
    try {
      await deleteDoc(doc(db, 'cases', id));
      toast.success('Análise excluída com sucesso.');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Erro ao excluir análise.');
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const handleDownloadAll = () => {
    if (!condoCase) return;
    setShowPreviewModal(true);
  };

  const createPdfDoc = (title: string, content: string) => {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    // Add Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(30, 64, 175); // blue-800
    doc.text('CondoDefesa AI', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(220, 38, 38); // red-600
    doc.text('“O Serasa do condomínio Faz  análise, diagnóstico e defesa em minutos.”', 105, 28, { align: 'center' });
    
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(20, 35, 190, 35);
    
    // Document Title
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text(title, 20, 45);
    
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} para ${condoCase?.condoName}`, 20, 52);
    
    // Content
    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85); // slate-700
    
    const splitText = doc.splitTextToSize(content, 170);
    doc.text(splitText, 20, 65);
    
    return doc;
  };

  const generatePdfPreview = async (title: string, content: string) => {
    if (!condoCase) return;
    setIsGeneratingPdf(true);
    setPdfPreviewTitle(title);
    
    try {
      const doc = createPdfDoc(title, content);
      const blob = doc.output('bloburl');
      setPdfPreviewUrl(blob as unknown as string);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar visualização do PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadIndividual = (title: string, content: string) => {
    try {
      const doc = createPdfDoc(title, content);
      doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}.pdf`);
      toast.success('Documento baixado com sucesso!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Erro ao baixar o documento.');
    }
  };

  const executePrint = () => {
    if (!condoCase) return;
    toast.info('Gerando dossiê de documentos...');
    const win = window.open('', '_blank');
    const content = `
      <html>
        <head>
          <title>Documentos - CondoDefesa AI</title>
          <style>
            body { font-family: serif; padding: 40px; line-height: 1.6; max-width: 800px; margin: 0 auto; color: #1a202c; }
            h1 { text-align: center; color: #1e40af; margin-bottom: 30px; font-family: sans-serif; }
            .doc-section { white-space: pre-wrap; margin-bottom: 50px; page-break-after: always; }
            .doc-title { border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px; font-size: 24px; font-family: sans-serif; color: #2d3748; }
            .header-info { text-align: center; font-size: 12px; color: #718096; margin-bottom: 40px; font-family: sans-serif; }
          </style>
        </head>
        <body>
          <h1>CondoDefesa AI - Relatório de Documentos</h1>
          <div class="header-info">
            Gerado em ${new Date().toLocaleDateString('pt-BR')} para o condomínio ${condoCase.condoName}
          </div>
          
          ${condoCase.documents.notificacao ? `
          <div class="doc-section">
            <h2 class="doc-title">1. Notificação Extrajudicial</h2>
            <div>${condoCase.documents.notificacao}</div>
          </div>` : ''}
          
          ${condoCase.documents.pedido ? `
          <div class="doc-section">
            <h2 class="doc-title">2. Pedido de Esclarecimentos</h2>
            <div>${condoCase.documents.pedido}</div>
          </div>` : ''}
          
          ${condoCase.documents.impugnacao ? `
          <div class="doc-section">
            <h2 class="doc-title">3. Impugnação Formal</h2>
            <div>${condoCase.documents.impugnacao}</div>
          </div>` : ''}

          ${condoCase.documents.notificacaoInadimplencia ? `
          <div class="doc-section">
            <h2 class="doc-title">4. Notificação de Inadimplência</h2>
            <div>${condoCase.documents.notificacaoInadimplencia}</div>
          </div>` : ''}
        </body>
      </html>
    `;
    win?.document.write(content);
    win?.document.close();
    win?.focus();
    setTimeout(() => {
      win?.print();
    }, 500);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!condoCase) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-12">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium mb-6 md:mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-6 mb-8 md:mb-10">
        <div className="w-full md:w-auto">
          <h1 className="text-2xl xs:text-3xl md:text-4xl font-black text-slate-900 mb-2 leading-tight">
            {condoCase.problemType === 'multa' ? 'Análise de Multa Injusta' : 
             condoCase.problemType === 'abuso_sindico' ? 'Análise de Abuso de Síndico' :
             condoCase.problemType === 'taxa_indevida' ? 'Análise de Taxa Indevida' : 'Análise de Caso'}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1 font-medium">
            <span className="text-blue-600 font-bold">{condoCase.condoName}</span>
            <span className="hidden xs:inline text-slate-300">•</span>
            <span>{condoCase.location}</span>
            <span className="hidden xs:inline text-slate-300">•</span>
            <span>{formatDate(condoCase.createdAt)}</span>
          </p>
        </div>
        <div className="flex flex-row sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleNotifications}
            className={cn(
              "flex-1 md:flex-none px-4 sm:px-6 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border text-xs sm:text-sm",
              condoCase.notificationsEnabled 
                ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100" 
                : "bg-white text-slate-600 border-slate-200 hover:border-blue-200 hover:text-blue-600"
            )}
          >
            {condoCase.notificationsEnabled ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            <span className="hidden xs:inline">{condoCase.notificationsEnabled ? 'Notificações Ativas' : 'Ativar Notificações'}</span>
            <span className="xs:hidden">{condoCase.notificationsEnabled ? 'Ativo' : 'Notificar'}</span>
          </motion.button>
          
          <button 
            onClick={handleDelete}
            className="flex-1 md:flex-none text-red-500 hover:text-red-700 px-4 sm:px-6 py-2.5 border border-red-100 rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm font-bold"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden xs:inline">Excluir Análise</span>
            <span className="xs:hidden">Excluir</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-8 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/60 sticky top-[72px] z-30 backdrop-blur-md shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-[9px] xs:text-xs sm:text-sm transition-all flex-1 md:flex-none justify-center",
              activeTab === tab.id 
                ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200" 
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            )}
          >
            <tab.icon className="w-3.5 h-3.5 sm:w-4 h-4" />
            <span className="truncate">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {activeTab === 'diagnosis' && (
                <div className="space-y-8">
                  {/* Severity Banner */}
                  <div className={cn(
                    "p-5 sm:p-6 rounded-3xl flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-4 sm:gap-6 border shadow-sm transition-all",
                    condoCase.severity === 'alto' ? "bg-red-50 border-red-100 text-red-900" :
                    condoCase.severity === 'medio' ? "bg-yellow-50 border-yellow-100 text-yellow-900" :
                    "bg-emerald-50 border-emerald-100 text-emerald-900"
                  )}>
                    <div className={cn(
                      "w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center flex-shrink-0",
                      condoCase.severity === 'alto' ? "bg-red-100 text-red-600" :
                      condoCase.severity === 'medio' ? "bg-yellow-100 text-yellow-600" :
                      "bg-emerald-100 text-emerald-600"
                    )}>
                      {condoCase.severity === 'alto' ? <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10" /> :
                       condoCase.severity === 'medio' ? <FileCheck className="w-8 h-8 sm:w-10 sm:h-10" /> :
                       <Info className="w-8 h-8 sm:w-10 sm:h-10" />}
                    </div>
                    <div className="flex-grow text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                        <span className={cn(
                          "w-2 h-2 sm:w-3 sm:h-3 rounded-full animate-pulse",
                          condoCase.severity === 'alto' ? "bg-red-500" :
                          condoCase.severity === 'medio' ? "bg-yellow-500" :
                          "bg-emerald-500"
                        )} />
                        <h3 className="font-black text-lg sm:text-xl uppercase tracking-tight">
                          {condoCase.severity === 'alto' ? 'Alto Risco' : 
                           condoCase.severity === 'medio' ? 'Risco Médio' : 'Baixa Complexidade'}
                        </h3>
                      </div>
                      
                      {condoCase.severity === 'alto' ? (
                        <div className="space-y-4">
                          <p className="font-medium text-red-800 text-sm sm:text-base">
                            Seu caso pode exigir ação jurídica. Fale com um especialista agora.
                          </p>
                          <Link 
                            to="/suporte" 
                            className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-700 transition-all shadow-md hover:shadow-red-200 text-sm"
                          >
                            <MessageCircle className="w-5 h-5" />
                            Falar com Especialista
                          </Link>
                        </div>
                      ) : condoCase.severity === 'medio' ? (
                        <p className="font-medium text-yellow-800 text-sm sm:text-base">
                          Recomendamos o uso imediato dos documentos automáticos gerados abaixo para sua defesa.
                        </p>
                      ) : (
                        <p className="font-medium text-emerald-800 text-sm sm:text-base">
                          Caso de baixa complexidade. Siga as orientações e passos sugeridos pela nossa IA.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Diagnosis */}
                  <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <ShieldCheck className="w-6 h-6 text-blue-600" />
                      Diagnóstico da IA
                    </h2>
                    <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-lg">
                      {condoCase.diagnosis}
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'rights' && (
                <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Gavel className="w-6 h-6 text-blue-600" />
                    Seus Direitos
                  </h2>
                  <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-lg">
                    {condoCase.rights}
                  </div>
                </section>
              )}

              {activeTab === 'steps' && (
                <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <PlusCircle className="w-6 h-6 text-blue-600" />
                    Próximos Passos Estratégicos
                  </h2>
                  <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-lg">
                    {condoCase.nextSteps}
                  </div>
                </section>
              )}

              {activeTab === 'docs' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Documentos Gerados
                    </h2>
                    <button 
                      onClick={handleDownloadAll}
                      className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Baixar Todos (PDF)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { id: 'notificacao', title: 'Notificação Extrajudicial', content: condoCase.documents.notificacao },
                      { id: 'pedido', title: 'Pedido de Esclarecimentos', content: condoCase.documents.pedido },
                      { id: 'impugnacao', title: 'Impugnação Formal', content: condoCase.documents.impugnacao },
                      { id: 'notificacaoInadimplencia', title: 'Notificação de Inadimplência', content: condoCase.documents.notificacaoInadimplencia }
                    ].filter(doc => doc.content).map((doc) => (
                      <motion.div 
                        key={doc.id}
                        whileHover={{ y: -2 }}
                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col"
                      >
                        <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                          <h3 className="font-bold text-sm text-slate-700">{doc.title}</h3>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => generatePdfPreview(doc.title, doc.content)}
                              className="p-2 hover:bg-white rounded-lg transition-colors text-slate-500 hover:text-blue-600"
                              title="Visualizar PDF"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDownloadIndividual(doc.title, doc.content)}
                              className="p-2 hover:bg-white rounded-lg transition-colors text-slate-500 hover:text-blue-600"
                              title="Baixar PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleCopy(doc.content, doc.id)}
                              className="p-2 hover:bg-white rounded-lg transition-colors text-slate-500 hover:text-blue-600"
                              title="Copiar Texto"
                            >
                              {copied === doc.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="p-5 flex-grow flex flex-col">
                          <div className="text-xs text-slate-400 line-clamp-4 mb-6 font-mono leading-relaxed flex-grow">
                            {doc.content}
                          </div>
                          <button 
                            onClick={() => generatePdfPreview(doc.title, doc.content)}
                            className="w-full py-2.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-100 transition-all flex items-center justify-center gap-2 mt-auto"
                          >
                            <Eye className="w-4 h-4" />
                            Visualizar PDF
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-lg">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5" />
                      Aviso Importante
                    </h4>
                    <p className="text-xs text-blue-100 leading-relaxed">
                      Estes documentos são modelos gerados por IA. Revise todos os dados (nomes, datas, valores) antes de enviar. 
                      Para maior segurança, consulte um advogado.
                    </p>
                  </div>
                </div>
              )}

              {/* Feedback Section (Always visible at bottom of active tab content) */}
              <section className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
                <div className="relative z-10">
                  {!feedbackSubmitted && !condoCase.feedback ? (
                    <>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Esta análise foi útil?</h3>
                      <p className="text-slate-500 mb-6">Seu feedback nos ajuda a melhorar a precisão da nossa inteligência artificial.</p>
                      
                      {!showCommentInput ? (
                        <div className="flex gap-4">
                          <button 
                            onClick={() => handleFeedback(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm"
                          >
                            <ThumbsUp className="w-5 h-5" />
                            Sim, ajudou
                          </button>
                          <button 
                            onClick={() => handleFeedback(false)}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:border-red-500 hover:text-red-600 transition-all shadow-sm"
                          >
                            <ThumbsDown className="w-5 h-5" />
                            Não muito
                          </button>
                        </div>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4"
                        >
                          <textarea
                            value={feedbackComment}
                            onChange={(e) => setFeedbackComment(e.target.value)}
                            placeholder="Conte-nos mais (opcional)..."
                            className="w-full p-4 rounded-xl border border-slate-200 focus:border-blue-600 outline-none min-h-[100px] bg-white transition-all"
                          />
                          <div className="flex gap-3">
                            <button 
                              disabled={isSubmittingFeedback}
                              onClick={submitFeedback}
                              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50 flex items-center gap-2"
                            >
                              {isSubmittingFeedback ? 'Enviando...' : 'Enviar Feedback'}
                              <Send className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setShowCommentInput(false)}
                              className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all"
                            >
                              Cancelar
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-4 text-emerald-700">
                      <div className="bg-emerald-100 p-3 rounded-full">
                        <Check className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Obrigado pelo seu feedback!</h3>
                        <p className="text-sm opacity-80">Sua opinião é fundamental para evoluirmos a CondoDefesa AI.</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar: Quick Info & Actions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              Resumo do Caso
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500">Condomínio</span>
                <span className="text-sm font-bold text-blue-600">{condoCase.condoName}</span>
              </div>
              <div className="flex flex-col py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500 mb-1">Endereço</span>
                <span className="text-sm font-medium text-slate-700">{condoCase.condoAddress}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500">Síndico(a)</span>
                <span className="text-sm font-medium text-slate-700">{condoCase.managerName}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500">Apartamentos</span>
                <span className="text-sm font-medium text-slate-700">{condoCase.numApartments}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500">Torres</span>
                <span className="text-sm font-medium text-slate-700">{condoCase.numTowers}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500">Status</span>
                <span className={cn(
                  "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                  condoCase.status === 'resolvido' ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                )}>
                  {condoCase.status}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500">Gravidade</span>
                <span className={cn(
                  "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                  condoCase.severity === 'alto' ? "bg-red-100 text-red-700" :
                  condoCase.severity === 'medio' ? "bg-yellow-100 text-yellow-700" :
                  "bg-emerald-100 text-emerald-700"
                )}>
                  {condoCase.severity}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500">Data</span>
                <span className="text-sm font-medium text-slate-700">
                  {new Date(condoCase.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Precisa de ajuda?
            </h3>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Nossos especialistas estão prontos para analisar seu caso detalhadamente.
            </p>
            <Link 
              to="/suporte" 
              className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
            >
              Iniciar Chat
            </Link>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPreviewModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Pré-visualização do Dossiê</h2>
                  <p className="text-xs text-slate-500">Confira os documentos antes de imprimir ou salvar em PDF</p>
                </div>
                <button 
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-4 sm:p-8 space-y-8 sm:space-y-12 bg-white">
                <div className="max-w-2xl mx-auto space-y-8 sm:space-y-12">
                  <div className="text-center pb-6 sm:pb-8 border-b-2 border-slate-100">
                    <h1 className="text-xl sm:text-2xl font-serif font-bold text-blue-800 mb-1 uppercase tracking-tight">CondoDefesa AI</h1>
                    <p className="text-[10px] sm:text-xs text-red-600 font-bold mb-2">“O Serasa do condomínio Faz  análise, diagnóstico e defesa em minutos.”</p>
                    <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest">Relatório de Documentos de Defesa</p>
                  </div>

                  {condoCase.documents.notificacao && (
                    <section>
                      <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4 border-l-4 border-blue-600 pl-3">1. Notificação Extrajudicial</h3>
                      <div className="text-xs sm:text-sm text-slate-700 font-serif leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100">
                        {condoCase.documents.notificacao}
                      </div>
                    </section>
                  )}

                  {condoCase.documents.pedido && (
                    <section>
                      <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4 border-l-4 border-blue-600 pl-3">2. Pedido de Esclarecimentos</h3>
                      <div className="text-xs sm:text-sm text-slate-700 font-serif leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100">
                        {condoCase.documents.pedido}
                      </div>
                    </section>
                  )}

                  {condoCase.documents.impugnacao && (
                    <section>
                      <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4 border-l-4 border-blue-600 pl-3">3. Impugnação Formal</h3>
                      <div className="text-xs sm:text-sm text-slate-700 font-serif leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100">
                        {condoCase.documents.impugnacao}
                      </div>
                    </section>
                  )}

                  {condoCase.documents.notificacaoInadimplencia && (
                    <section>
                      <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4 border-l-4 border-blue-600 pl-3">4. Notificação de Inadimplência</h3>
                      <div className="text-xs sm:text-sm text-slate-700 font-serif leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100">
                        {condoCase.documents.notificacaoInadimplencia}
                      </div>
                    </section>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-3 justify-end">
                <button 
                  onClick={() => setShowPreviewModal(false)}
                  className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    setShowPreviewModal(false);
                    executePrint();
                  }}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Printer className="w-5 h-5" />
                  Confirmar e Imprimir / PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pdfPreviewUrl && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-white w-full max-w-5xl h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">{pdfPreviewTitle}</h2>
                    <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Visualizador de PDF Integrado</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = pdfPreviewUrl;
                      link.download = `${pdfPreviewTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`;
                      link.click();
                    }}
                    className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    Baixar PDF
                  </button>
                  <button 
                    onClick={() => setPdfPreviewUrl(null)}
                    className="p-3 hover:bg-slate-100 rounded-2xl transition-colors text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="flex-grow bg-slate-100 p-4 sm:p-8 overflow-hidden relative">
                <iframe 
                  src={`${pdfPreviewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="w-full h-full rounded-2xl shadow-xl bg-white border border-slate-200"
                  title="PDF Preview"
                />
                
                {/* Mobile Download Button Overlay */}
                <div className="absolute bottom-8 right-8 sm:hidden">
                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = pdfPreviewUrl;
                      link.download = `${pdfPreviewTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`;
                      link.click();
                    }}
                    className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl"
                  >
                    <Download className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center">
                <p className="text-xs text-slate-400 font-medium">
                  Este é um documento gerado automaticamente pela CondoDefesa AI.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setPdfPreviewUrl(null)}
                    className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {isGeneratingPdf && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="font-bold text-slate-700">Gerando visualização do PDF...</p>
          </div>
        </div>
      )}
    </div>
  );
}
