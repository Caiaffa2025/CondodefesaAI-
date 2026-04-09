import { Shield, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex flex-col mb-4">
              <div className="flex items-center gap-2 text-white">
                <Shield className="w-6 h-6 text-blue-500" />
                <span className="font-bold text-lg">CondoDefesa AI</span>
              </div>
              <span className="text-[10px] text-red-500 font-bold mt-1 ml-8">
                “O Serasa do condomínio Faz  análise, diagnóstico e defesa em minutos.”
              </span>
              <span className="text-[9px] text-slate-500 font-medium mt-1 ml-8 uppercase tracking-widest">
                Startup jurídica agressiva e moderna
              </span>
            </div>
            <p className="text-sm">
              Sua plataforma inteligente de apoio ao condômino. 
              Tecnologia e informação jurídica para garantir seus direitos.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <a 
                href="https://condodefesaai.netlify.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
              >
                🌐 condodefesaai.netlify.app
              </a>
              <a 
                href="https://github.com/scaiaffa2014/condodefesa-ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-bold hover:text-white transition-colors"
              >
                <Github className="w-4 h-4" />
                Repositório GitHub
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Links Úteis</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/faq" className="hover:text-white font-bold text-blue-400">Perguntas Frequentes (FAQ)</Link></li>
              <li><Link to="/protecao" className="hover:text-white">Proteção Condominial</Link></li>
              <li><Link to="/sobre" className="hover:text-white">Sobre Nós</Link></li>
              <li><Link to="/suporte" className="hover:text-white">Central de Ajuda</Link></li>
              <li><a href="https://wa.me/5511984937529" target="_blank" rel="noopener noreferrer" className="hover:text-white">WhatsApp Suporte</a></li>
              <li><Link to="/termos" className="hover:text-white">Termos de Uso</Link></li>
              <li><Link to="/privacidade" className="hover:text-white">Privacidade (LGPD)</Link></li>
              <li><Link to="/admin" className="hover:text-white opacity-20">Admin</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Aviso Legal</h3>
            <p className="text-xs leading-relaxed">
              O CondoDefesa AI é uma ferramenta de apoio informativo baseada em inteligência artificial. 
              Não prestamos assessoria jurídica nem substituímos a consulta com um advogado devidamente inscrito na OAB.
            </p>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 text-center text-xs">
          <p>© {new Date().getFullYear()} CondoDefesa AI. Todos os direitos reservados.</p>
          <p className="mt-1 font-bold text-slate-500">Agência Stc Mobile | Sydney Caiaffa</p>
        </div>
      </div>
    </footer>
  );
}
