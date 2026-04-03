import { motion } from 'motion/react';
import { Shield, FileText, Scale, AlertCircle, CheckCircle2, ArrowLeft, Zap, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsOfUse() {
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
              Termos de <span className="text-blue-600">Uso</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Última atualização: 27 de Março de 2026. Por favor, leia atentamente estes termos antes de utilizar nossa plataforma.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 sm:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 shadow-sm p-6 sm:p-8 md:p-12 space-y-10 sm:space-y-12">
            
            {/* 1. Aceitação */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <CheckCircle2 className="w-5 h-5 sm:w-6 h-6" />
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">1. Aceitação dos Termos</h2>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Ao acessar e utilizar a plataforma <strong>CondoDefesa AI</strong>, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
              </p>
            </div>

            {/* 2. Descrição do Serviço */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <Zap className="w-5 h-5 sm:w-6 h-6" />
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">2. Descrição do Serviço</h2>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                O CondoDefesa AI é uma plataforma de tecnologia que utiliza Inteligência Artificial para fornecer análises informativas, diagnósticos preliminares e modelos de documentos relacionados a conflitos condominiais. 
              </p>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 sm:p-6 rounded-r-xl sm:rounded-r-2xl">
                <div className="flex items-center gap-2 text-amber-800 font-bold mb-2 text-sm sm:text-base">
                  <AlertCircle className="w-4 h-4 sm:w-5 h-5" />
                  AVISO LEGAL CRÍTICO
                </div>
                <p className="text-amber-900 text-xs sm:text-sm leading-relaxed font-medium">
                  A plataforma <strong>NÃO PRESTA ASSESSORIA JURÍDICA</strong>. As informações e documentos gerados são de caráter meramente informativo e educacional. O CondoDefesa AI não substitui, em hipótese alguma, a consulta e o acompanhamento de um advogado devidamente inscrito na Ordem dos Advogados do Brasil (OAB).
                </p>
              </div>
            </div>

            {/* 3. Responsabilidades do Usuário */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <Users className="w-5 h-5 sm:w-6 h-6" />
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">3. Responsabilidades do Usuário</h2>
              </div>
              <ul className="space-y-3 text-sm sm:text-base text-slate-600 list-disc pl-6">
                <li>Você é responsável pela veracidade de todas as informações fornecidas à plataforma.</li>
                <li>Você deve revisar cuidadosamente qualquer documento gerado pela IA antes de utilizá-lo, garantindo que os dados estejam corretos e adequados ao seu caso específico.</li>
                <li>O uso da plataforma é pessoal e intransferível.</li>
                <li>Você se compromete a não utilizar a plataforma para fins ilícitos ou que violem direitos de terceiros.</li>
              </ul>
            </div>

            {/* 4. Limitação de Responsabilidade */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <Scale className="w-5 h-5 sm:w-6 h-6" />
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">4. Limitação de Responsabilidade</h2>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                O CondoDefesa AI não se responsabiliza por:
              </p>
              <ul className="space-y-3 text-sm sm:text-base text-slate-600 list-disc pl-6">
                <li>Decisões tomadas pelo usuário com base nas análises da IA.</li>
                <li>Resultados de processos judiciais ou administrativos onde os documentos gerados foram utilizados.</li>
                <li>Danos indiretos, incidentais ou consequenciais decorrentes do uso ou da incapacidade de usar o serviço.</li>
                <li>Interrupções temporárias do serviço por motivos técnicos ou de força maior.</li>
              </ul>
            </div>

            {/* 5. Propriedade Intelectual */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <Shield className="w-5 h-5 sm:w-6 h-6" />
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">5. Propriedade Intelectual</h2>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Todo o conteúdo da plataforma, incluindo textos, logotipos, designs, códigos e algoritmos de IA, é de propriedade exclusiva do CondoDefesa AI ou de seus licenciadores e está protegido por leis de direitos autorais e propriedade intelectual.
              </p>
            </div>

            {/* 6. Privacidade e LGPD */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <FileText className="w-5 h-5 sm:w-6 h-6" />
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">6. Privacidade e Dados (LGPD)</h2>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                O tratamento de seus dados pessoais é regido por nossa Política de Privacidade, em total conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Ao utilizar a plataforma, você consente com a coleta e processamento de dados necessários para a prestação do serviço.
              </p>
            </div>

            {/* 7. Alterações nos Termos */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <AlertCircle className="w-5 h-5 sm:w-6 h-6" />
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">7. Alterações nos Termos</h2>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações significativas serão notificadas através da plataforma ou por e-mail. O uso continuado do serviço após tais alterações constitui sua aceitação dos novos termos.
              </p>
            </div>

            {/* Final Note */}
            <div className="pt-8 border-t border-slate-100 text-center">
              <p className="text-slate-500 text-xs sm:text-sm">
                Dúvidas sobre estes termos? Entre em contato com nosso suporte jurídico em <a href="mailto:suporte@condodefesa.ai" className="text-blue-600 font-bold hover:underline">suporte@condodefesa.ai</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
