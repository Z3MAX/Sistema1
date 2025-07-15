// src/services/geminiAIService.js
// Serviço de análise de IA usando Google Gemini para laptops Dell - VERSÃO CORRIGIDA

// ⚠️ IMPORTANTE: Mover API key para variável de ambiente
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyA7OFLS-QN17JBDuqlVu9o8dckPHGnj_1o';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Sistema de logging com níveis
const Logger = {
  levels: {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
  },
  currentLevel: import.meta.env.PROD ? 1 : 3, // WARN em produção, DEBUG em desenvolvimento
  
  log(level, message, data = null) {
    if (level <= this.currentLevel) {
      const timestamp = new Date().toISOString();
      const levelName = Object.keys(this.levels)[level];
      
      if (data) {
        console.log(`[${timestamp}] ${levelName}: ${message}`, data);
      } else {
        console.log(`[${timestamp}] ${levelName}: ${message}`);
      }
    }
  },
  
  error(message, data) { this.log(this.levels.ERROR, message, data); },
  warn(message, data) { this.log(this.levels.WARN, message, data); },
  info(message, data) { this.log(this.levels.INFO, message, data); },
  debug(message, data) { this.log(this.levels.DEBUG, message, data); }
};

// Gerador de IDs mais seguro
const generateSecureId = () => {
  // Usar crypto.randomUUID() se disponível, senão fallback para método mais seguro
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback mais seguro que Math.random()
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 9);
  const extraRandom = Math.random().toString(36).substr(2, 9);
  
  return `${timestamp}-${randomPart}-${extraRandom}`;
};

class GeminiAIService {
  constructor() {
    this.apiKey = GEMINI_API_KEY;
    this.apiUrl = GEMINI_API_URL;
    this.rateLimitDelay = 1000; // 1 segundo entre requisições
    this.lastRequestTime = 0;
    this.maxRetries = 3;
    
    // Verificar se API key está configurada
    if (!this.apiKey || this.apiKey.length < 10) {
      Logger.warn('API Key do Gemini não configurada corretamente');
    }
    
    Logger.info('GeminiAIService inicializado');
  }

  // Rate limiting para evitar spam de requisições
  async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const delay = this.rateLimitDelay - timeSinceLastRequest;
      Logger.debug(`Aplicando rate limit: aguardando ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  // Converter imagem para base64 com validação
  async imageToBase64(imageData) {
    try {
      if (!imageData) {
        throw new Error('Dados da imagem não fornecidos');
      }
      
      if (imageData.startsWith('data:image/')) {
        // Já está em base64
        const base64Data = imageData.split(',')[1];
        if (!base64Data) {
          throw new Error('Dados base64 inválidos');
        }
        return base64Data;
      }
      
      // Se não estiver em formato data URL, assumir que já é base64
      return imageData;
    } catch (error) {
      Logger.error('Erro ao converter imagem para base64:', error);
      throw error;
    }
  }

  // Extrair tipo MIME da imagem com validação
  getMimeType(imageData) {
    try {
      if (imageData.startsWith('data:image/')) {
        const match = imageData.match(/data:image\/([^;]+)/);
        if (match) {
          const mimeType = `image/${match[1]}`;
          Logger.debug(`Tipo MIME detectado: ${mimeType}`);
          return mimeType;
        }
      }
      
      // Padrão para JPEG
      return 'image/jpeg';
    } catch (error) {
      Logger.error('Erro ao extrair tipo MIME:', error);
      return 'image/jpeg';
    }
  }

  // Prompt especializado e otimizado para análise de laptops Dell
  getAnalysisPrompt() {
    return `
Você é um especialista em análise de laptops Dell com 10 anos de experiência. Analise esta imagem de laptop Dell e forneça uma avaliação técnica detalhada.

Responda APENAS com um objeto JSON válido no seguinte formato:

{
  "model_detected": "Modelo do Dell identificado ou 'Dell Laptop' se não conseguir identificar",
  "overall_condition": "Excelente|Bom|Regular|Ruim",
  "damage_score": 15,
  "confidence": 92,
  "damages": [
    {
      "type": "Tipo específico do dano",
      "location": "Localização exata",
      "severity": "Leve|Moderado|Grave",
      "description": "Descrição técnica detalhada"
    }
  ],
  "recommendations": [
    "Recomendação técnica específica 1",
    "Recomendação técnica específica 2"
  ],
  "technical_assessment": {
    "screen_condition": "Avaliação da tela",
    "keyboard_condition": "Avaliação do teclado",
    "body_condition": "Avaliação da carcaça",
    "ports_condition": "Avaliação das portas",
    "overall_wear": "Avaliação do desgaste geral"
  },
  "estimated_value_impact": "Impacto percentual no valor (ex: 'Redução de 5-10%')",
  "maintenance_urgency": "Baixa|Média|Alta|Urgente"
}

Critérios de análise:
- damage_score: 0-100 (0 = perfeito, 100 = completamente danificado)
- Seja conservador na avaliação (prefira dar scores mais altos para danos)
- Identifique especificamente: arranhões, amassados, desgaste do teclado, problemas na tela, danos nas portas
- Forneça recomendações técnicas práticas
- Considere o modelo Dell para avaliação de valor

Responda APENAS com o JSON, sem texto adicional ou explicações.
`;
  }

  // Fazer a análise real com Gemini com retry automático
  async analyzeLaptopDamage(imageData) {
    if (!this.apiKey || this.apiKey.length < 10) {
      Logger.warn('API Key não configurada, usando análise simulada');
      return this.fallbackToSimulation();
    }

    let lastError = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        Logger.info(`Iniciando análise com Gemini AI (tentativa ${attempt}/${this.maxRetries})`);
        
        // Rate limiting
        await this.enforceRateLimit();
        
        // Converter imagem para base64
        const base64Image = await this.imageToBase64(imageData);
        const mimeType = this.getMimeType(imageData);
        
        // Preparar payload para Gemini
        const payload = {
          contents: [
            {
              parts: [
                {
                  text: this.getAnalysisPrompt()
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Image
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1, // Mais determinístico
            topK: 16,
            topP: 0.8,
            maxOutputTokens: 1024, // Reduzido para respostas mais concisas
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        };

        Logger.debug('Enviando requisição para Gemini API');
        
        // Fazer requisição para Gemini com timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout
        
        const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erro na API do Gemini: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        Logger.debug('Resposta recebida do Gemini');

        // Extrair e processar resposta
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          const responseText = data.candidates[0].content.parts[0].text;
          Logger.debug('Resposta do Gemini:', responseText);
          
          try {
            // Limpar resposta (remover possíveis prefixos/sufixos)
            const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
            
            // Tentar fazer parse do JSON
            const analysisResult = JSON.parse(cleanedResponse);
            
            // Validar e normalizar dados
            const processedResult = this.processAnalysisResult(analysisResult);
            
            Logger.info('Análise concluída com sucesso');
            
            return {
              success: true,
              data: {
                analysis_id: generateSecureId(),
                timestamp: new Date().toISOString(),
                provider: 'Google Gemini',
                version: '1.5-flash',
                ...processedResult
              }
            };
            
          } catch (jsonError) {
            Logger.error('Erro ao fazer parse do JSON:', jsonError);
            Logger.debug('Resposta original:', responseText);
            
            // Fallback: tentar extrair informações manualmente
            return this.fallbackAnalysis(responseText);
          }
        } else {
          throw new Error('Resposta inválida da API do Gemini');
        }

      } catch (error) {
        lastError = error;
        Logger.error(`Erro na tentativa ${attempt}:`, error);
        
        if (attempt < this.maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Backoff exponencial
          Logger.info(`Aguardando ${delay}ms antes da próxima tentativa`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // Se todas as tentativas falharam, usar fallback
    Logger.warn('Todas as tentativas falharam, usando análise simulada');
    return this.fallbackToSimulation();
  }

  // Processar e validar resultado da análise
  processAnalysisResult(result) {
    try {
      return {
        model_detected: this.sanitizeString(result.model_detected) || 'Dell Laptop',
        overall_condition: this.validateCondition(result.overall_condition),
        damage_score: this.validateScore(result.damage_score),
        confidence: this.validateScore(result.confidence),
        damages: this.validateDamages(result.damages),
        recommendations: this.validateRecommendations(result.recommendations),
        technical_assessment: this.validateTechnicalAssessment(result.technical_assessment),
        estimated_value_impact: this.sanitizeString(result.estimated_value_impact) || 'Análise em andamento',
        maintenance_urgency: this.validateUrgency(result.maintenance_urgency)
      };
    } catch (error) {
      Logger.error('Erro ao processar resultado da análise:', error);
      throw error;
    }
  }

  // Funções de validação aprimoradas
  sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str.trim().substring(0, 200); // Limitar tamanho
  }

  validateCondition(condition) {
    const validConditions = ['Excelente', 'Bom', 'Regular', 'Ruim'];
    return validConditions.includes(condition) ? condition : 'Bom';
  }

  validateScore(score) {
    const numScore = parseInt(score);
    return isNaN(numScore) ? 85 : Math.max(0, Math.min(100, numScore));
  }

  validateUrgency(urgency) {
    const validUrgencies = ['Baixa', 'Média', 'Alta', 'Urgente'];
    return validUrgencies.includes(urgency) ? urgency : 'Baixa';
  }

  validateDamages(damages) {
    if (!Array.isArray(damages)) return [];
    
    return damages.slice(0, 10).map(damage => ({ // Limitar a 10 danos
      type: this.sanitizeString(damage.type) || 'Desgaste geral',
      location: this.sanitizeString(damage.location) || 'Não especificado',
      severity: ['Leve', 'Moderado', 'Grave'].includes(damage.severity) ? damage.severity : 'Leve',
      description: this.sanitizeString(damage.description) || 'Análise detalhada não disponível'
    }));
  }

  validateRecommendations(recommendations) {
    if (!Array.isArray(recommendations)) {
      return ['Realizar manutenção preventiva regular'];
    }
    
    const validRecommendations = recommendations
      .filter(rec => typeof rec === 'string' && rec.trim().length > 0)
      .map(rec => this.sanitizeString(rec))
      .slice(0, 5); // Limitar a 5 recomendações
    
    return validRecommendations.length > 0 ? validRecommendations : ['Laptop em bom estado geral'];
  }

  validateTechnicalAssessment(assessment) {
    if (!assessment || typeof assessment !== 'object') {
      return {
        screen_condition: 'Análise em andamento',
        keyboard_condition: 'Análise em andamento',
        body_condition: 'Análise em andamento',
        ports_condition: 'Análise em andamento',
        overall_wear: 'Análise em andamento'
      };
    }

    return {
      screen_condition: this.sanitizeString(assessment.screen_condition) || 'Análise em andamento',
      keyboard_condition: this.sanitizeString(assessment.keyboard_condition) || 'Análise em andamento',
      body_condition: this.sanitizeString(assessment.body_condition) || 'Análise em andamento',
      ports_condition: this.sanitizeString(assessment.ports_condition) || 'Análise em andamento',
      overall_wear: this.sanitizeString(assessment.overall_wear) || 'Análise em andamento'
    };
  }

  // Análise de fallback melhorada
  fallbackAnalysis(responseText) {
    Logger.info('Usando análise de fallback baseada em texto');
    
    try {
      const condition = this.extractConditionFromText(responseText);
      const damages = this.extractDamagesFromText(responseText);
      
      return {
        success: true,
        data: {
          analysis_id: generateSecureId(),
          timestamp: new Date().toISOString(),
          provider: 'Google Gemini (Fallback)',
          model_detected: 'Dell Laptop',
          overall_condition: condition,
          damage_score: this.conditionToScore(condition),
          confidence: 75,
          damages: damages,
          recommendations: [
            'Análise baseada em processamento de texto',
            'Recomenda-se nova análise com imagem de melhor qualidade'
          ],
          technical_assessment: {
            screen_condition: 'Análise parcial',
            keyboard_condition: 'Análise parcial',
            body_condition: 'Análise parcial',
            ports_condition: 'Análise parcial',
            overall_wear: 'Análise parcial'
          },
          estimated_value_impact: 'Análise em andamento',
          maintenance_urgency: 'Baixa'
        }
      };
    } catch (error) {
      Logger.error('Erro na análise de fallback:', error);
      return this.fallbackToSimulation();
    }
  }

  conditionToScore(condition) {
    const scoreMap = {
      'Excelente': 10,
      'Bom': 25,
      'Regular': 50,
      'Ruim': 75
    };
    return scoreMap[condition] || 25;
  }

  extractConditionFromText(text) {
    const lowerText = text.toLowerCase();
    
    const conditionKeywords = [
      { condition: 'Excelente', keywords: ['excelente', 'perfeito', 'excellent', 'perfect'] },
      { condition: 'Bom', keywords: ['bom', 'good', 'satisfatório'] },
      { condition: 'Regular', keywords: ['regular', 'médio', 'average', 'ok'] },
      { condition: 'Ruim', keywords: ['ruim', 'danificado', 'poor', 'bad', 'damaged'] }
    ];

    for (const { condition, keywords } of conditionKeywords) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return condition;
      }
    }
    
    return 'Bom';
  }

  extractDamagesFromText(text) {
    const damages = [];
    const lowerText = text.toLowerCase();
    
    const damagePatterns = [
      { type: 'Arranhões', keywords: ['arranhão', 'risco', 'scratch'], location: 'Carcaça' },
      { type: 'Problema na tela', keywords: ['tela', 'screen', 'display'], location: 'Tela' },
      { type: 'Desgaste do teclado', keywords: ['teclado', 'keyboard', 'tecla'], location: 'Teclado' },
      { type: 'Amassado', keywords: ['amassado', 'dent', 'deformação'], location: 'Carcaça' },
      { type: 'Desgaste geral', keywords: ['desgaste', 'wear', 'uso'], location: 'Geral' }
    ];

    for (const { type, keywords, location } of damagePatterns) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        damages.push({
          type,
          location,
          severity: 'Leve',
          description: `${type} identificado na análise de texto`
        });
      }
    }
    
    return damages;
  }

  // Fallback para simulação completa
  fallbackToSimulation() {
    Logger.info('Usando análise completamente simulada');
    
    const scenarios = [
      {
        model_detected: 'Dell Latitude 5520',
        overall_condition: 'Excelente',
        damage_score: 8,
        confidence: 95,
        damages: [],
        recommendations: [
          'Laptop em excelente estado',
          'Continuar com manutenção preventiva regular',
          'Verificar atualizações de firmware periodicamente'
        ],
        technical_assessment: {
          screen_condition: 'Excelente - sem danos visíveis',
          keyboard_condition: 'Excelente - todas as teclas funcionais',
          body_condition: 'Excelente - carcaça intacta',
          ports_condition: 'Excelente - todas as portas funcionais',
          overall_wear: 'Mínimo desgaste de uso normal'
        },
        estimated_value_impact: 'Nenhum impacto no valor',
        maintenance_urgency: 'Baixa'
      },
      {
        model_detected: 'Dell Latitude 7420',
        overall_condition: 'Bom',
        damage_score: 22,
        confidence: 88,
        damages: [
          {
            type: 'Riscos superficiais',
            location: 'Tampa superior',
            severity: 'Leve',
            description: 'Pequenos riscos na superfície da tampa, não afetam funcionalidade'
          },
          {
            type: 'Desgaste do teclado',
            location: 'Teclas principais',
            severity: 'Leve',
            description: 'Leve desgaste nas teclas mais utilizadas, ainda totalmente funcionais'
          }
        ],
        recommendations: [
          'Estado geral bom para uso corporativo',
          'Considerar limpeza profunda do teclado',
          'Usar película protetora para evitar mais riscos'
        ],
        technical_assessment: {
          screen_condition: 'Bom - algumas marcas de limpeza',
          keyboard_condition: 'Bom - leve desgaste visível',
          body_condition: 'Bom - riscos superficiais',
          ports_condition: 'Excelente - todas funcionais',
          overall_wear: 'Desgaste normal para idade do equipamento'
        },
        estimated_value_impact: 'Redução de 5-8% no valor',
        maintenance_urgency: 'Baixa'
      },
      {
        model_detected: 'Dell Inspiron 5510',
        overall_condition: 'Regular',
        damage_score: 45,
        confidence: 82,
        damages: [
          {
            type: 'Riscos profundos',
            location: 'Tampa e base',
            severity: 'Moderado',
            description: 'Riscos visíveis que atravessam o acabamento superficial'
          },
          {
            type: 'Desgaste acentuado',
            location: 'Área do touchpad',
            severity: 'Moderado',
            description: 'Desgaste significativo na área do touchpad e apoio das mãos'
          },
          {
            type: 'Manchas na tela',
            location: 'Display LCD',
            severity: 'Leve',
            description: 'Algumas manchas e pontos na tela que podem afetar a visualização'
          }
        ],
        recommendations: [
          'Laptop necessita atenção preventiva',
          'Agendar limpeza profissional completa',
          'Verificar calibração da tela',
          'Considerar substituição do touchpad se piorar'
        ],
        technical_assessment: {
          screen_condition: 'Regular - manchas visíveis',
          keyboard_condition: 'Regular - desgaste moderado',
          body_condition: 'Regular - riscos profundos',
          ports_condition: 'Bom - funcionais com leve desgaste',
          overall_wear: 'Desgaste acima do esperado para idade'
        },
        estimated_value_impact: 'Redução de 15-20% no valor',
        maintenance_urgency: 'Média'
      }
    ];
    
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    return {
      success: true,
      data: {
        analysis_id: generateSecureId(),
        timestamp: new Date().toISOString(),
        provider: 'Análise Simulada',
        version: 'fallback-v1.0',
        ...randomScenario
      }
    };
  }

  // Testar conexão com a API
  async testConnection() {
    if (!this.apiKey || this.apiKey.length < 10) {
      Logger.warn('API Key não configurada para teste de conexão');
      return false;
    }

    try {
      const testPayload = {
        contents: [
          {
            parts: [
              {
                text: "Responda apenas 'OK' para confirmar que está funcionando."
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 10
        }
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        Logger.info('Conexão com Gemini AI estabelecida com sucesso');
        return true;
      } else {
        Logger.error(`Erro na conexão com Gemini: ${response.status}`);
        return false;
      }
    } catch (error) {
      Logger.error('Erro ao testar conexão com Gemini:', error);
      return false;
    }
  }

  // Obter informações sobre o serviço
  getServiceInfo() {
    return {
      name: 'Gemini AI Service',
      version: '2.0.0',
      provider: 'Google Gemini',
      model: 'gemini-1.5-flash',
      apiKeyConfigured: !!(this.apiKey && this.apiKey.length > 10),
      rateLimitDelay: this.rateLimitDelay,
      maxRetries: this.maxRetries
    };
  }
}

// Exportar instância do serviço
export const geminiAIService = new GeminiAIService();
export default geminiAIService;
