import { motion } from 'motion/react';
import { Shield, Lock, Eye, Database, UserCheck, ArrowLeft, FileCheck, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header */}
      <section className="bg-white border-b border-slate-200 py-10 sm:py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium mb-6 sm:mb-8 transition-colors text-sm sm:text-base">
            <ArrowLeft className="w-4 h-4" />
            Voltar para a Home
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4 sm:mb-6 tracking-tight">
              Política de <span className="text-blue-600">Privacidade (LGPD)</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Sua privacidade é nossa prioridade absoluta. Entenda como protegemos seus dados em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 sm:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 shadow-sm p-6 sm:p-8 md:p-12 space-y-10 sm:space-y-12">
            
            {/* 1. Coleta de Dados */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <Database className="w-5 h-5 sm:w-6 h-6" />
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">1. Coleta de Dados</h2>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Coletamos apenas os dados estritamente necessários para a prestação de nossos serviços:
              </p>
              <ul className="space-y-3 text-sm sm:text-base text-slate-600 list-disc pl-6">
                <li><strong>Dados de Identificação:</strong> Nome e e-mail (via Google Login) para criação de conta.</li>
                <li><strong>Dados do Caso:</strong> Informações sobre conflitos condominiais que você insere voluntariamente para análise da IA.</li>
                <li><strong>Dados de Uso:</strong> Informações técnicas sobre como você interage com a plataforma para melhorias de performance.</li>
              </ul>
            </div>

            {/* 2. Finalidade do Tratamento */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <FileCheck className="w-5 h-5 sm:w-6 h-6" />
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">2. Finalidade do Tratamento</h2>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Seus dados são utilizados exclusivamente para:
              </p>
              <ul className="space-y-3 text-sm sm:text-base text-slate-600 list-disc pl-6">
                <li>Processar e gerar diagnósticos jurídicos baseados em IA.</li>
                <li>Manter seu histórico de casos acessível apenas para você.</li>
                <li>Enviar comunicações importantes sobre sua conta ou atualizações do serviço.</li>
                <li>Garantir a segurança e prevenir fraudes na plataforma.</li>
              </ul>
            </div>

            {/* 3. Segurança da Informação */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <Lock className="w-5 h-5 sm:w-6 h-6" />
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">3. Segurança da Informação</h2>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Implementamos medidas técnicas e organizacionais rigorosas para proteger seus dados:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">Criptografia</h4>
                  <p className="text-xs sm:text-sm text-slate-500">Dados protegidos em trânsito e em repouso utilizando padrões bancários.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">Acesso Restrito</h4>
                  <p className="text-xs sm:text-sm text-slate-500">Apenas você tem acesso ao conteúdo detalhado de seus casos.</p>
                </div>
              </div>
            </div>

            {/* 4. Seus Direitos (LGPD) */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <UserCheck className="w-5 h-5 sm:w-6 h-6" />
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">4. Seus Direitos (LGPD)</h2>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Como titular dos dados, você possui direitos garantidos pela LGPD, que podem ser exercidos a qualquer momento:
              </p>
              <ul className="space-y-3 text-sm sm:text-base text-slate-600 list-disc pl-6">
                <li><strong>Confirmação e Acesso:</strong> Saber quais dados tratamos.</li>
                <li><strong>Correção:</strong> Solicitar a alteração de dados incompletos ou inexatos.</li>
                <li><strong>Eliminação:</strong> Solicitar a exclusão definitiva de seus dados de nossa base.</li>
                <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado.</li>
                <li><strong>Revogação do Consentimento:</strong> Retirar sua autorização para o tratamento de dados.</li>
              </ul>
            </div>

            {/* 5. Compartilhamento com Terceiros */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <Eye className="w-5 h-5 sm:w-6 h-6" />
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">5. Compartilhamento com Terceiros</h2>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                <strong>Não vendemos seus dados para terceiros.</strong> O compartilhamento ocorre apenas com provedores de infraestrutura essenciais (como Google Cloud e Firebase) para o funcionamento da plataforma, sempre sob contratos de confidencialidade rigorosos.
              </p>
            </div>

            {/* 6. Retenção de Dados */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <Shield className="w-5 h-5 sm:w-6 h-6" />
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">6. Retenção de Dados</h2>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Mantemos seus dados apenas pelo tempo necessário para cumprir as finalidades descritas nesta política ou para cumprir obrigações legais. Caso você decida excluir sua conta, todos os seus dados pessoais e casos serão removidos permanentemente de nossos servidores ativos em até 30 dias.
              </p>
            </div>

            {/* 7. Alterações e Contato */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <Bell className="w-5 h-5 sm:w-6 h-6" />
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">7. Alterações e Contato</h2>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Esta política pode ser atualizada periodicamente. Recomendamos a revisão regular. Para exercer seus direitos ou tirar dúvidas sobre privacidade, entre em contato com nosso DPO (Encarregado de Dados):
              </p>
              <div className="bg-blue-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-blue-100 text-center">
                <p className="text-blue-900 font-bold text-sm sm:text-base">dpo@condodefesa.ai</p>
                <p className="text-blue-700 text-xs sm:text-sm mt-1">Assunto: Requisição LGPD</p>
              </div>
            </div>

            {/* Final Note */}
            <div className="pt-8 border-t border-slate-100 text-center">
              <p className="text-slate-500 text-xs italic">
                CondoDefesa AI - Tecnologia a serviço da justiça condominial e da proteção de dados.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
