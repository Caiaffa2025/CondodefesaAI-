import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Upload, 
  Trash2, 
  ShieldCheck, 
  FileCheck, 
  Calendar, 
  Info,
  Loader2,
  FileSearch
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc, deleteField } from 'firebase/firestore';
import { UserProfile } from '../types';
import { toast } from 'sonner';
import { cn, formatDate } from '../lib/utils';
import { Link } from 'react-router-dom';

interface MyDocumentsProps {
  profile: UserProfile | null;
  onUpdateProfile: () => void;
}

export default function MyDocuments({ profile, onUpdateProfile }: MyDocumentsProps) {
  const [uploading, setUploading] = useState<'convention' | 'regulations' | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'convention' | 'regulations') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800 * 1024) { // 800KB limit to stay safe with Firestore 1MB limit
      toast.error('O arquivo é muito grande. O limite é de 800KB para armazenamento direto.');
      return;
    }

    setUploading(type);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      
      try {
        const profileRef = doc(db, 'users', profile!.uid);
        const field = type === 'convention' ? 'condoConvention' : 'internalRegulations';
        
        await updateDoc(profileRef, {
          [field]: {
            name: file.name,
            data: base64,
            uploadedAt: new Date().toISOString()
          }
        });
        
        toast.success(`${type === 'convention' ? 'Convenção' : 'Regimento'} atualizado com sucesso!`);
        onUpdateProfile();
      } catch (error) {
        console.error('Error uploading document:', error);
        toast.error('Erro ao salvar documento no seu perfil.');
      } finally {
        setUploading(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeDocument = async (type: 'convention' | 'regulations') => {
    try {
      const profileRef = doc(db, 'users', profile!.uid);
      const field = type === 'convention' ? 'condoConvention' : 'internalRegulations';
      
      await updateDoc(profileRef, {
        [field]: deleteField()
      });
      
      toast.success('Documento removido.');
      onUpdateProfile();
    } catch (error) {
      console.error('Error removing document:', error);
      toast.error('Erro ao remover documento.');
    }
  };

  const DocumentCard = ({ 
    type, 
    title, 
    description, 
    docData 
  }: { 
    type: 'convention' | 'regulations', 
    title: string, 
    description: string,
    docData?: { name: string, uploadedAt: string }
  }) => (
    <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-6">
        <div className={cn(
          "p-3 sm:p-4 rounded-2xl",
          docData ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
        )}>
          {type === 'convention' ? <FileText className="w-7 h-7 sm:w-8 h-8" /> : <ShieldCheck className="w-7 h-7 sm:w-8 h-8" />}
        </div>
        {docData && (
          <button 
            onClick={() => removeDocument(type)}
            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
            title="Remover documento"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-2 tracking-tight">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">{description}</p>

      {docData ? (
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Arquivo Atual</p>
            <p className="text-sm font-bold text-slate-700 truncate">{docData.name}</p>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400 font-bold">
              <Calendar className="w-3 h-3" />
              Enviado em {formatDate(docData.uploadedAt)}
            </div>
          </div>
          <div className="flex flex-col xs:flex-row gap-2">
            <label className="flex-grow cursor-pointer bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm">
              <Upload className="w-4 h-4" />
              Substituir
              <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, type)} accept="image/*,application/pdf" />
            </label>
            <Link 
              to="/preventiva"
              className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center"
              title="Analisar este documento"
            >
              <FileSearch className="w-5 h-5" />
            </Link>
          </div>
        </div>
      ) : (
        <label className="w-full cursor-pointer bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-100 group-hover:scale-[1.02] text-sm sm:text-base">
          {uploading === type ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Upload className="w-5 h-5" />
          )}
          Fazer Upload Agora
          <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, type)} accept="image/*,application/pdf" />
        </label>
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      <header className="mb-10 sm:mb-12 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl text-blue-600 mb-4"
        >
          <FileCheck className="w-7 h-7 sm:w-8 h-8" />
        </motion.div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">Meus <span className="text-blue-600">Documentos</span></h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          Mantenha sua Convenção e Regimento Interno salvos no sistema para acesso rápido e análises instantâneas.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12">
        <DocumentCard 
          type="convention"
          title="Convenção do Condomínio"
          description="O documento principal que rege a propriedade, as áreas comuns e as obrigações fundamentais dos condôminos."
          docData={profile?.condoConvention}
        />
        <DocumentCard 
          type="regulations"
          title="Regimento Interno"
          description="As regras do dia a dia: uso de áreas de lazer, horários de silêncio, mudanças e convivência social."
          docData={profile?.internalRegulations}
        />
      </div>

      <div className="bg-blue-50 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-blue-100 flex flex-col md:flex-row items-center gap-6">
        <div className="bg-white p-3 sm:p-4 rounded-2xl text-blue-600 shadow-sm shrink-0">
          <Info className="w-7 h-7 sm:w-8 h-8" />
        </div>
        <div className="flex-grow text-center md:text-left">
          <h4 className="text-lg font-black text-blue-900 mb-1">Por que salvar seus documentos?</h4>
          <p className="text-xs sm:text-sm text-blue-700 leading-relaxed">
            Ao manter seus documentos salvos, nossa IA pode cruzar informações automaticamente quando você registrar um novo caso ou fizer uma análise preventiva, garantindo uma defesa muito mais precisa e personalizada.
          </p>
        </div>
      </div>
    </div>
  );
}
