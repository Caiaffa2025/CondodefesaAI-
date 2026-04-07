import { GoogleGenAI, Type } from "@google/genai";
import firebaseConfig from "../../firebase-applet-config.json";

const getAI = () => {
  const isPlaceholder = (k: any) => !k || k === 'TODO_KEYHERE' || k === 'MY_GEMINI_API_KEY' || k === 'YOUR_API_KEY' || k === '';

  // Try to get the key from multiple possible environment variable names
  // We use a dynamic lookup to avoid Vite's static replacement if possible
  const getRuntimeKey = () => {
    if (typeof window === 'undefined') return null;
    
    try {
      // Check for process.env.GEMINI_API_KEY and process.env.API_KEY
      // These might be injected by the platform at runtime
      const win = window as any;
      const k = win.process?.env?.GEMINI_API_KEY || 
                win.process?.env?.API_KEY || 
                win.GEMINI_API_KEY || 
                win.API_KEY ||
                win.aistudio?.apiKey; // Some versions might use this
      return isPlaceholder(k) ? null : k;
    } catch (e) {
      return null;
    }
  };

  // Safe check for process.env variables which might not be defined by Vite
  const getBuildTimeKey = () => {
    try {
      // @ts-ignore
      const k = process.env.GEMINI_API_KEY || process.env.API_KEY;
      return isPlaceholder(k) ? null : k;
    } catch (e) {
      return null;
    }
  };

  const getViteKey = () => {
    try {
      const k = (import.meta as any).env?.VITE_GEMINI_API_KEY;
      return isPlaceholder(k) ? null : k;
    } catch (e) {
      return null;
    }
  };

  const key = getRuntimeKey() || getBuildTimeKey() || getViteKey() || (isPlaceholder(firebaseConfig.apiKey) ? null : firebaseConfig.apiKey);
  
  if (!key) {
    const isAiStudio = typeof window !== 'undefined' && (window as any).aistudio;
    const message = isAiStudio 
      ? "Chave de API não configurada. Clique no botão 'Configurar API' no topo da página ou use o menu de Segredos do projeto."
      : "Chave de API não encontrada. Por favor, configure a GEMINI_API_KEY nos segredos do projeto.";
    throw new Error(message);
  }

  const genAI = new GoogleGenAI({ apiKey: key });

  // Add a proxy to handle common API errors globally if possible, 
  // but since we call methods directly, we'll wrap the calls or provide a helper.
  return genAI;
};

const handleGeminiError = (err: any): never => {
  console.error("Gemini API Error Details:", err);
  
  const errorString = typeof err === 'string' ? err : JSON.stringify(err);
  const errorMessage = err?.message || errorString;

  if (errorString.includes('PERMISSION_DENIED') || errorString.includes('API_KEY_SERVICE_BLOCKED')) {
    throw new Error("Sua chave de API do Gemini está bloqueada ou não tem permissão para este serviço. Por favor, clique em 'Configurar API' no topo da página e selecione uma chave válida de um projeto com faturamento ativo.");
  }

  if (errorString.includes('quota') || errorString.includes('429')) {
    throw new Error("Limite de cota atingido para a API do Gemini. Por favor, tente novamente em alguns instantes.");
  }

  if (errorString.includes('API key not found') || errorString.includes('invalid API key')) {
    throw new Error("Chave de API inválida. Por favor, configure uma nova chave clicando em 'Configurar API'.");
  }

  throw new Error(errorMessage || "Ocorreu um erro na comunicação com a Inteligência Artificial.");
};

export interface AnalysisResult {
  severity: 'baixo' | 'medio' | 'alto';
  diagnosis: string;
  rights: string;
  nextSteps: string;
  detailedReport: string;
  documents: {
    notificacao: string;
    pedido: string;
    impugnacao: string;
    notificacaoInadimplencia: string;
  };
}

export const analyzeCondoProblem = async (
  problemType: string,
  description: string,
  condoName: string,
  condoAddress: string,
  location: string,
  managerName: string,
  numApartments: number,
  numTowers: number,
  triedToResolve: boolean
): Promise<AnalysisResult> => {
  const ai = getAI();
  const prompt = `
    Você é um assistente jurídico especializado em direito condominial brasileiro.
    Analise o seguinte problema relatado por um condômino:
    
    Condomínio: ${condoName}
    Endereço: ${condoAddress}
    Localização: ${location}
    Síndico(a): ${managerName}
    Número de Apartamentos: ${numApartments}
    Número de Torres: ${numTowers}
    Tipo de Problema: ${problemType}
    Descrição: ${description}
    Já tentou resolver? ${triedToResolve ? 'Sim' : 'Não'}
    
    Sua tarefa é:
    1. Classificar a gravidade (baixo, medio, alto).
    2. Fornecer um diagnóstico claro do problema.
    3. Listar os direitos do condômino com base no Código Civil Brasileiro (Lei 10.406/02), na Lei do Condomínio (Lei 4.591/64) e outras normas pertinentes.
    4. Sugerir os próximos passos estratégicos.
    5. Gerar um RELATÓRIO DETALHADO (detailedReport) que inclua:
       - Contextualização jurídica do problema.
       - Referências específicas a artigos da Lei 4.591/64 e do Código Civil.
       - Análise de jurisprudência genérica (tendências dos tribunais para casos similares).
       - Riscos de não agir e benefícios da resolução amigável vs. judicial.
    6. Gerar modelos de 4 documentos COMPLETOS e DETALHADOS:
       - Notificação Extrajudicial: Deve conter preâmbulo completo, fatos, fundamentos jurídicos (Lei 4.591/64 e Código Civil), pedidos claros e prazo para resposta.
       - Pedido Formal de Esclarecimentos: Estruturado como um requerimento administrativo formal ao síndico/administradora.
       - Impugnação: Um documento robusto contestando a irregularidade, com fundamentação legal sólida.
       - Notificação de Inadimplência: Adaptada para casos de inadimplência condominial, incluindo campos para o nome do condômino inadimplente, valor em atraso, data de vencimento, juros e multa aplicáveis (limitados a 2% conforme Art. 1.336 do CC), e um prazo para regularização.
    
    IMPORTANTE: Deixe claro que esta é uma ferramenta informativa e não substitui um advogado.
    Use uma linguagem profissional, técnica e jurídica, mas acessível ao condômino.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            severity: { type: Type.STRING, enum: ["baixo", "medio", "alto"] },
            diagnosis: { type: Type.STRING },
            rights: { type: Type.STRING },
            nextSteps: { type: Type.STRING },
            detailedReport: { type: Type.STRING },
            documents: {
              type: Type.OBJECT,
              properties: {
                notificacao: { type: Type.STRING },
                pedido: { type: Type.STRING },
                impugnacao: { type: Type.STRING },
                notificacaoInadimplencia: { type: Type.STRING }
              },
              required: ["notificacao", "pedido", "impugnacao", "notificacaoInadimplencia"]
            }
          },
          required: ["severity", "diagnosis", "rights", "nextSteps", "detailedReport", "documents"]
        }
      }
    });

    if (!response.text) {
      throw new Error("A IA não retornou uma resposta válida. Por favor, tente novamente.");
    }

    try {
      return JSON.parse(response.text);
    } catch (e) {
      console.error("Erro ao parsear JSON da IA:", response.text);
      throw new Error("Erro ao processar a resposta da IA. O formato retornado é inválido.");
    }
  } catch (err) {
    return handleGeminiError(err);
  }
};

export const supportChat = async (message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  const ai = getAI();
  
  // Gemini history must start with 'user' and alternate roles.
  // Our initial message is from 'model', so we should skip it if it's the first one.
  let chatHistory = history.slice(0, -1);
  if (chatHistory.length > 0 && chatHistory[0].role === 'model') {
    chatHistory = chatHistory.slice(1);
  }

  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `Você é o assistente de suporte da CondoDefesa AI, um especialista empático e encorajador em direito condominial brasileiro. Sua missão é apoiar os usuários em momentos de conflito, oferecendo clareza e orientação.

Diretrizes:
1. RECONHECIMENTO E EMPATIA: Antes de oferecer soluções, reconheça e valide o problema relatado pelo usuário de forma acolhedora.
2. AVISO LEGAL PROEMINENTE: Em respostas longas ou orientações específicas, inicie a mensagem com um aviso claro: "⚠️ IMPORTANTE: Sou uma IA informativa e não substituo a consulta com um advogado especializado."
3. ENCORAJAMENTO: Mantenha um tom profissional e motivador, mostrando que o usuário não está sozinho e que existem caminhos para resolver conflitos de forma justa.
4. LIMITES: Ajude com o uso da plataforma e dúvidas gerais. Para casos complexos, sugira sempre o auxílio de um profissional jurídico.`,
      },
      history: chatHistory,
    });

    const response = await chat.sendMessage({
      message: message,
    });

    return response.text;
  } catch (err) {
    return handleGeminiError(err);
  }
};

export interface FineScanResult {
  isLegal: boolean;
  canBeContested: boolean;
  analysis: string;
  extractedData: {
    date: string;
    amount: string;
    reason: string;
    condoName: string;
  };
  arguments: string[];
}

export const scanFineImage = async (base64Data: string, mimeType: string): Promise<FineScanResult> => {
  const ai = getAI();
  const prompt = `
    Você é um especialista em direito condominial brasileiro. 
    Analise esta imagem de uma multa condominial.
    
    Sua tarefa é:
    1. Extrair os dados principais (data, valor, motivo, nome do condomínio).
    2. Avaliar a legalidade da multa com base no Código Civil (Art. 1.336 e 1.337) e na Lei 4.591/64.
    3. Verificar se houve o devido processo legal (direito de defesa, notificação prévia, previsão na convenção).
    4. Fornecer uma análise detalhada, técnica e fundamentada.
    5. Listar argumentos jurídicos sólidos para a defesa, citando artigos e princípios do direito condominial.
    6. Determinar se a multa é passível de contestação.
    
    IMPORTANTE: Esta é uma análise preliminar baseada em IA e não substitui um advogado. Use um tom profissional, técnico e encorajador.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isLegal: { type: Type.BOOLEAN },
            canBeContested: { type: Type.BOOLEAN },
            analysis: { type: Type.STRING },
            extractedData: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                amount: { type: Type.STRING },
                reason: { type: Type.STRING },
                condoName: { type: Type.STRING }
              },
              required: ["date", "amount", "reason", "condoName"]
            },
            arguments: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["isLegal", "canBeContested", "analysis", "extractedData", "arguments"]
        }
      }
    });

    if (!response.text) {
      throw new Error("A IA não retornou uma resposta válida para a imagem.");
    }

    try {
      return JSON.parse(response.text);
    } catch (e) {
      console.error("Erro ao parsear JSON da IA (Multa):", response.text);
      throw new Error("Erro ao processar a análise da multa.");
    }
  } catch (err) {
    return handleGeminiError(err);
  }
};

export interface PreventiveAnalysisResult {
  risks: {
    title: string;
    description: string;
    severity: 'baixo' | 'medio' | 'alto';
    legalBasis: string;
  }[];
  summary: string;
  recommendations: string[];
}

export const analyzePreventiveDocument = async (base64Data: string, mimeType: string): Promise<PreventiveAnalysisResult> => {
  const ai = getAI();
  const prompt = `
    Você é um advogado sênior especializado em compliance condominial e direito imobiliário brasileiro.
    Analise este documento (Convenção de Condomínio ou Regimento Interno).
    
    Sua tarefa é:
    1. Identificar cláusulas potencialmente abusivas, ilegais ou que contrariem o Código Civil Brasileiro (Lei 10.406/02) e a Lei do Condomínio (Lei 4.591/64).
    2. Apontar riscos futuros para os condôminos (ex: multas desproporcionais, restrições de uso ilegais, falta de transparência, taxas abusivas).
    3. Fornecer a base legal DETALHADA para cada risco identificado, citando artigos específicos.
    4. Dar recomendações estratégicas e completas de como o condômino deve agir ou propor alterações em assembleia.
    
    Retorne um resumo geral robusto, uma lista detalhada de riscos e recomendações estratégicas em formato JSON.
    
    IMPORTANTE: Esta é uma análise informativa baseada em IA e não substitui o parecer de um advogado. Use um tom técnico e profissional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            risks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ["baixo", "medio", "alto"] },
                  legalBasis: { type: Type.STRING }
                },
                required: ["title", "description", "severity", "legalBasis"]
              }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["summary", "risks", "recommendations"]
        }
      }
    });

    if (!response.text) {
      throw new Error("A IA não retornou uma resposta válida para o documento.");
    }

    try {
      return JSON.parse(response.text);
    } catch (e) {
      console.error("Erro ao parsear JSON da IA (Preventiva Doc):", response.text);
      throw new Error("Erro ao processar a análise preventiva do documento.");
    }
  } catch (err) {
    return handleGeminiError(err);
  }
};

export const analyzePreventiveText = async (text: string): Promise<PreventiveAnalysisResult> => {
  const ai = getAI();
  const prompt = `
    Você é um advogado sênior especializado em compliance condominial e direito imobiliário brasileiro.
    Analise o seguinte texto de uma Convenção de Condomínio ou Regimento Interno.
    
    Texto:
    ${text}
    
    Sua tarefa é:
    1. Identificar cláusulas potencialmente abusivas, ilegais ou que contrariem o Código Civil Brasileiro (Lei 10.406/02) e a Lei do Condomínio (Lei 4.591/64).
    2. Apontar riscos futuros para os condôminos (ex: multas desproporcionais, restrições de uso ilegais, falta de transparência, taxas abusivas).
    3. Fornecer a base legal DETALHADA para cada risco identificado, citando artigos específicos.
    4. Dar recomendações estratégicas e completas de como o condômino deve agir ou propor alterações em assembleia.
    
    Retorne um resumo geral robusto, uma lista detalhada de riscos e recomendações estratégicas em formato JSON.
    
    IMPORTANTE: Esta é uma análise informativa baseada em IA e não substitui o parecer de um advogado. Use um tom técnico e profissional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            risks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ["baixo", "medio", "alto"] },
                  legalBasis: { type: Type.STRING }
                },
                required: ["title", "description", "severity", "legalBasis"]
              }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["summary", "risks", "recommendations"]
        }
      }
    });

    if (!response.text) {
      throw new Error("A IA não retornou uma resposta válida para o texto.");
    }

    try {
      return JSON.parse(response.text);
    } catch (e) {
      console.error("Erro ao parsear JSON da IA (Preventiva Texto):", response.text);
      throw new Error("Erro ao processar a análise preventiva do texto.");
    }
  } catch (err) {
    return handleGeminiError(err);
  }
};

export interface OccurrenceReportResult {
  title: string;
  content: string;
  legalContext: string;
  recommendations: string[];
}

export const generateOccurrenceReport = async (
  problemType: string,
  description: string,
  date: string,
  time: string,
  location: string,
  involvedParties: string,
  evidence: string,
  images?: { data: string; mimeType: string }[]
): Promise<OccurrenceReportResult> => {
  const ai = getAI();
  const prompt = `
    Você é um especialista em gestão condominial e direito civil brasileiro.
    Sua tarefa é gerar uma "Ata de Ocorrência" formal e estruturada para ser registrada no livro de ocorrências de um condomínio.
    
    Dados da Ocorrência:
    - Tipo de Problema: ${problemType}
    - Data: ${date}
    - Hora: ${time}
    - Local: ${location}
    - Partes Envolvidas: ${involvedParties}
    - Descrição dos Fatos: ${description}
    - Evidências Mencionadas: ${evidence}
    ${images && images.length > 0 ? `- Imagens Anexadas: Foram enviadas ${images.length} fotos como evidência. Analise-as se possível para complementar o relato.` : ''}
    
    O documento deve:
    1. Ter um título formal e profissional.
    2. Apresentar os fatos de forma clara, objetiva, impessoal e cronológica.
    3. Fornecer um EMBASAMENTO LEGAL COMPLETO (legalContext), citando artigos específicos do Código Civil (ex: Art. 1.331 a 1.358), da Lei 4.591/64 e princípios gerais do direito.
    4. Fornecer recomendações estratégicas detalhadas sobre como proceder após o registro, incluindo prazos e possíveis desdobramentos.
    
    Retorne o resultado no formato JSON especificado, garantindo que o conteúdo seja robusto e formal.
  `;

  try {
    const parts: any[] = [{ text: prompt }];
    
    if (images && images.length > 0) {
      images.forEach(img => {
        parts.push({
          inlineData: {
            data: img.data,
            mimeType: img.mimeType
          }
        });
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            legalContext: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "content", "legalContext", "recommendations"]
        }
      }
    });

    if (!response.text) {
      throw new Error("A IA não retornou uma resposta válida para a ocorrência.");
    }

    try {
      return JSON.parse(response.text);
    } catch (e) {
      console.error("Erro ao parsear JSON da IA (Ocorrência):", response.text);
      throw new Error("Erro ao gerar o relatório de ocorrência.");
    }
  } catch (err) {
    return handleGeminiError(err);
  }
};

export interface FinanceAnalysisResult {
  isLegal: boolean;
  totalCalculated: number;
  fineCalculated: number;
  interestCalculated: number;
  limitFine: number;
  limitInterest: number;
  analysis: string;
  recommendation: string;
  legalBasis: string;
}

export const analyzeFinanceLegality = async (
  principal: number,
  fineCharged: number,
  interestCharged: number,
  dueDate: string,
  paymentDate: string
): Promise<FinanceAnalysisResult> => {
  const ai = getAI();
  const prompt = `
    Você é um especialista em direito condominial e cálculos financeiros do Brasil.
    Analise a legalidade de uma cobrança de condomínio em atraso.
    
    Dados da Cobrança:
    - Valor Principal: R$ ${principal}
    - Multa Cobrada: R$ ${fineCharged}
    - Juros Cobrados: R$ ${interestCharged}
    - Data de Vencimento: ${dueDate}
    - Data de Pagamento/Cálculo: ${paymentDate}
    
    Regras do Código Civil Brasileiro (Art. 1.336, § 1º):
    - Multa máxima: 2% sobre o valor do débito.
    - Juros moratórios: 1% ao mês (pro rata die), salvo se a convenção previr menos (assuma 1% como limite padrão legal se não houver convenção).
    
    Sua tarefa é:
    1. Calcular a multa legal (máximo 2% conforme Art. 1.336, § 1º do Código Civil).
    2. Calcular os juros legais (máximo 1% ao mês pro rata die, conforme Art. 1.336, § 1º do Código Civil).
    3. Comparar os valores cobrados com os limites legais e identificar abusividades.
    4. Fornecer uma análise técnica, detalhada e fundamentada na Lei do Condomínio (Lei 4.591/64) e no Código Civil.
    5. Fornecer recomendações estratégicas sobre como contestar valores indevidos ou regularizar a situação.
    
    Retorne os resultados no formato JSON especificado.
    totalCalculated deve ser a soma do principal + multa legal + juros legais.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isLegal: { type: Type.BOOLEAN },
            totalCalculated: { type: Type.NUMBER },
            fineCalculated: { type: Type.NUMBER },
            interestCalculated: { type: Type.NUMBER },
            limitFine: { type: Type.NUMBER },
            limitInterest: { type: Type.NUMBER },
            analysis: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            legalBasis: { type: Type.STRING }
          },
          required: ["isLegal", "totalCalculated", "fineCalculated", "interestCalculated", "limitFine", "limitInterest", "analysis", "recommendation", "legalBasis"]
        }
      }
    });

    if (!response.text) {
      throw new Error("A IA não retornou uma resposta válida para a análise financeira.");
    }

    try {
      return JSON.parse(response.text);
    } catch (e) {
      console.error("Erro ao parsear JSON da IA (Financeiro):", response.text);
      throw new Error("Erro ao processar a análise financeira.");
    }
  } catch (err) {
    return handleGeminiError(err);
  }
};
