import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ArrowLeft, CheckCircle2, XCircle, Trophy, RefreshCcw, ChevronRight, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Qual o quórum necessário para alterar a Convenção do Condomínio?",
    options: [
      "Maioria simples dos presentes",
      "2/3 (dois terços) dos votos dos condôminos",
      "Unanimidade dos condôminos",
      "50% mais um de todos os condôminos"
    ],
    correctAnswer: 1,
    explanation: "Segundo o Art. 1.333 do Código Civil, a convenção que constitui o condomínio edilício deve ser subscrita pelos titulares de, no mínimo, dois terços das frações ideais."
  },
  {
    id: 2,
    question: "Quem é responsável por representar o condomínio, ativa e passivamente, em juízo ou fora dele?",
    options: [
      "O Conselho Fiscal",
      "A Administradora",
      "O Síndico",
      "O Zelador"
    ],
    correctAnswer: 2,
    explanation: "O Art. 1.348, II do Código Civil estabelece que compete ao síndico representar o condomínio, praticando os atos necessários à defesa dos interesses comuns."
  },
  {
    id: 3,
    question: "Qual o prazo máximo de mandato do síndico, de acordo com o Código Civil?",
    options: [
      "1 ano",
      "2 anos, permitida a reeleição",
      "4 anos",
      "Indeterminado"
    ],
    correctAnswer: 1,
    explanation: "O Art. 1.347 do Código Civil define que o mandato do síndico não pode exceder dois anos, embora a reeleição seja permitida."
  },
  {
    id: 4,
    question: "Despesas com pintura da fachada e reformas estruturais são consideradas:",
    options: [
      "Despesas Ordinárias",
      "Despesas Extraordinárias",
      "Despesas de Consumo",
      "Despesas de Emergência"
    ],
    correctAnswer: 1,
    explanation: "Despesas extraordinárias são aquelas que não se referem aos gastos rotineiros de manutenção, como obras de reformas ou acréscimos que interessem à estrutura integral da edificação."
  },
  {
    id: 5,
    question: "O condômino que não pagar a sua contribuição ficará sujeito a juros moratórios e multa de até:",
    options: [
      "10%",
      "5%",
      "2%",
      "20%"
    ],
    correctAnswer: 2,
    explanation: "O Art. 1.336, § 1º do Código Civil limita a multa por atraso no pagamento do condomínio a 2% sobre o débito."
  },
  {
    id: 6,
    question: "Para realizar obras voluptuárias (de mero deleite ou recreio), qual o quórum necessário?",
    options: [
      "2/3 dos condôminos",
      "Maioria simples",
      "Unanimidade",
      "Voto de 50% dos presentes"
    ],
    correctAnswer: 0,
    explanation: "O Art. 1.341, I do Código Civil exige o voto de dois terços dos condôminos para a realização de obras voluptuárias."
  },
  {
    id: 7,
    question: "O que acontece se o síndico não prestar contas anualmente?",
    options: [
      "Nada acontece",
      "Pode ser destituído em assembleia",
      "A administradora assume automaticamente",
      "O condomínio é multado pela prefeitura"
    ],
    correctAnswer: 1,
    explanation: "A prestação de contas é um dever do síndico (Art. 1.348, VIII). A falha nesse dever pode levar à sua destituição conforme o Art. 1.349."
  },
  {
    id: 8,
    question: "Qual documento regula as normas de convivência e o uso das áreas comuns?",
    options: [
      "Código Civil",
      "Convenção de Condomínio",
      "Regimento Interno",
      "Lei do Inquilinato"
    ],
    correctAnswer: 2,
    explanation: "O Regimento Interno é o documento que detalha as normas de conduta, horários e uso das áreas comuns, visando a boa convivência."
  },
  {
    id: 9,
    question: "Qual o quórum necessário para a realização de obras úteis no condomínio?",
    options: [
      "Maioria simples dos presentes",
      "Voto da maioria dos condôminos",
      "2/3 dos condôminos",
      "Unanimidade"
    ],
    correctAnswer: 1,
    explanation: "O Art. 1.341, II do Código Civil exige o voto da maioria dos condôminos (50% + 1 de todos os proprietários) para a realização de obras úteis."
  },
  {
    id: 10,
    question: "O condômino inadimplente tem direito a votar nas assembleias?",
    options: [
      "Sim, em qualquer situação",
      "Sim, desde que a dívida seja menor que 3 meses",
      "Não, o Código Civil proíbe o voto do inadimplente",
      "Apenas em assembleias extraordinárias"
    ],
    correctAnswer: 2,
    explanation: "O Art. 1.335, III do Código Civil estabelece que é direito do condômino votar nas deliberações da assembleia e delas participar, desde que esteja quite."
  },
  {
    id: 11,
    question: "A Convenção de Condomínio pode proibir genericamente a permanência de animais nas unidades?",
    options: [
      "Sim, a Convenção é soberana",
      "Não, pois fere o direito de propriedade se o animal não causar transtornos",
      "Sim, se aprovado por unanimidade",
      "Apenas animais de grande porte podem ser proibidos"
    ],
    correctAnswer: 1,
    explanation: "O STJ consolidou o entendimento de que a proibição genérica de animais, sem que estes representem risco à segurança, higiene ou sossego, é abusiva e fere o direito de propriedade."
  },
  {
    id: 12,
    question: "Com que frequência deve ocorrer a Assembleia Geral Ordinária (AGO)?",
    options: [
      "A cada 6 meses",
      "Anualmente, conforme previsto na convenção",
      "Apenas quando houver necessidade de obras",
      "A cada 2 anos, junto com a eleição do síndico"
    ],
    correctAnswer: 1,
    explanation: "O Art. 1.350 do Código Civil determina que o síndico convocará, anualmente, assembleia dos condôminos para aprovar o orçamento, as contribuições e a prestação de contas."
  },
  {
    id: 13,
    question: "Para que serve prioritariamente o Fundo de Reserva do condomínio?",
    options: [
      "Pagar salários atrasados",
      "Custear despesas ordinárias do dia a dia",
      "Atender despesas imprevistas e extraordinárias",
      "Comprar brindes para os moradores no Natal"
    ],
    correctAnswer: 2,
    explanation: "O Fundo de Reserva é uma garantia para despesas extraordinárias ou emergenciais, não devendo ser usado para o custeio rotineiro (ordinário) sem previsão específica."
  },
  {
    id: 14,
    question: "O condomínio pode impedir o morador inadimplente de utilizar o elevador social?",
    options: [
      "Sim, como forma de pressão para o pagamento",
      "Não, pois é um serviço essencial e fere a dignidade humana",
      "Sim, se estiver previsto no Regimento Interno",
      "Apenas se o morador morar no primeiro andar"
    ],
    correctAnswer: 1,
    explanation: "A justiça brasileira proíbe medidas vexatórias ou que impeçam o acesso a serviços essenciais (como elevadores ou áreas comuns de lazer) por motivo de inadimplência."
  },
  {
    id: 15,
    question: "Qual o quórum para alteração da destinação do edifício ou da unidade imobiliária?",
    options: [
      "Maioria simples",
      "2/3 dos condôminos",
      "Unanimidade dos condôminos",
      "50% mais um de todos os condôminos"
    ],
    correctAnswer: 2,
    explanation: "O Art. 1.351 do Código Civil exige a unanimidade dos condôminos para a alteração da destinação do edifício ou da unidade imobiliária."
  }
];

export default function Quiz() {
  const [currentStep, setCurrentStep] = useState<'start' | 'quiz' | 'result'>('start');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number, isCorrect: boolean }[]>([]);

  const handleStart = () => {
    setCurrentStep('quiz');
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnswers([]);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleConfirm = () => {
    if (selectedOption === null || isAnswered) return;

    const isCorrect = selectedOption === QUESTIONS[currentQuestionIndex].correctAnswer;
    if (isCorrect) setScore(prev => prev + 1);
    
    setAnswers(prev => [...prev, { questionId: QUESTIONS[currentQuestionIndex].id, isCorrect }]);
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setCurrentStep('result');
    }
  };

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium mb-6 sm:mb-8 transition-colors text-sm sm:text-base">
        <ArrowLeft className="w-4 h-4" />
        Voltar ao Dashboard
      </Link>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden min-h-[500px] flex flex-col">
        <AnimatePresence mode="wait">
          {currentStep === 'start' && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-grow flex flex-col items-center justify-center p-6 sm:p-10 text-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 tracking-tight">
                Desafio de Direito Condominial
              </h1>
              <p className="text-sm sm:text-base text-slate-500 max-w-md mb-8 leading-relaxed">
                Teste seus conhecimentos sobre as leis que regem a vida em condomínio no Brasil. Você está pronto para o desafio?
              </p>
              <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="block text-xl sm:text-2xl font-black text-blue-600">{QUESTIONS.length}</span>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Questões</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="block text-xl sm:text-2xl font-black text-blue-600">5 min</span>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Tempo Médio</span>
                </div>
              </div>
              <button
                onClick={handleStart}
                className="w-full sm:w-auto bg-blue-600 text-white px-12 py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 hover:shadow-2xl hover:-translate-y-1 active:scale-95"
              >
                Começar Quiz
              </button>
            </motion.div>
          )}

          {currentStep === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-grow flex flex-col p-5 sm:p-8 md:p-10"
            >
              {/* Progress Bar */}
              <div className="mb-6 sm:mb-8">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">
                    Questão {currentQuestionIndex + 1} de {QUESTIONS.length}
                  </span>
                  <span className="text-[10px] sm:text-xs font-black text-blue-600">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-blue-600 rounded-full"
                  />
                </div>
              </div>

              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-6 sm:mb-8 leading-tight">
                {currentQuestion.question}
              </h2>

              <div className="space-y-3 mb-8">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedOption === index;
                  const isCorrect = index === currentQuestion.correctAnswer;
                  
                  let stateClasses = "border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/30";
                  if (isAnswered) {
                    if (isCorrect) stateClasses = "border-green-200 bg-green-50 text-green-900";
                    else if (isSelected) stateClasses = "border-red-200 bg-red-50 text-red-900";
                    else stateClasses = "border-slate-100 bg-white opacity-50";
                  } else if (isSelected) {
                    stateClasses = "border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-600/10";
                  }

                  return (
                    <button
                      key={index}
                      disabled={isAnswered}
                      onClick={() => handleOptionSelect(index)}
                      className={cn(
                        "w-full p-3 sm:p-4 rounded-2xl border text-left transition-all flex items-center gap-3 sm:gap-4 group",
                        stateClasses
                      )}
                    >
                      <div className={cn(
                        "w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm transition-all shrink-0",
                        isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600",
                        isAnswered && isCorrect && "bg-green-600 text-white",
                        isAnswered && isSelected && !isCorrect && "bg-red-600 text-white"
                      )}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="font-medium text-sm sm:text-base leading-snug">{option}</span>
                      {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 ml-auto shrink-0" />}
                      {isAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 ml-auto shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 mb-8"
                  >
                    <p className="text-xs sm:text-sm text-blue-900 leading-relaxed">
                      <span className="font-black uppercase text-[10px] tracking-widest block mb-1">Explicação</span>
                      {currentQuestion.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-auto pt-6 flex justify-end">
                {!isAnswered ? (
                  <button
                    disabled={selectedOption === null}
                    onClick={handleConfirm}
                    className="w-full sm:w-auto bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    Confirmar Resposta
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 text-sm sm:text-base"
                  >
                    {currentQuestionIndex < QUESTIONS.length - 1 ? 'Próxima Questão' : 'Ver Resultado'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {currentStep === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-grow flex flex-col items-center justify-center p-6 sm:p-10 text-center"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-yellow-50 rounded-3xl flex items-center justify-center mb-6 relative">
                <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-600" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-lg"
                >
                  {Math.round((score / QUESTIONS.length) * 100)}%
                </motion.div>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 tracking-tight">
                {score === QUESTIONS.length ? 'Incrível! Você é um expert!' : 
                 score >= QUESTIONS.length / 2 ? 'Bom trabalho!' : 'Continue estudando!'}
              </h2>
              <p className="text-sm sm:text-base text-slate-500 mb-8">
                Você acertou {score} de {QUESTIONS.length} questões sobre direito condominial.
              </p>

              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 w-full max-w-2xl mb-8">
                {answers.map((answer, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100 text-left">
                    <div className={cn(
                      "w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0",
                      answer.isCorrect ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    )}>
                      {answer.isCorrect ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 truncate">Q{idx + 1}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                <button
                  onClick={handleStart}
                  className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <RefreshCcw className="w-5 h-5" />
                  Tentar Novamente
                </button>
                <Link
                  to="/dashboard"
                  className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 text-sm sm:text-base"
                >
                  <Shield className="w-5 h-5" />
                  Ir para Dashboard
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 sm:mt-12 bg-blue-600 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xl sm:text-2xl font-black mb-2">Precisa de ajuda com um caso real?</h3>
          <p className="text-blue-100 text-xs sm:text-sm mb-6 max-w-lg">
            Se você está enfrentando problemas no seu condomínio, nossa IA pode analisar sua situação e gerar documentos jurídicos personalizados em segundos.
          </p>
          <Link
            to="/analisar"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-black hover:bg-blue-50 transition-all text-sm sm:text-base"
          >
            Iniciar Nova Análise
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <HelpCircle className="absolute -bottom-10 -right-10 w-48 h-48 sm:w-64 sm:h-64 text-blue-500/20" />
      </div>
    </div>
  );
}
