// Mock AI Service until real LLM API keys are provided
import AIConversation from '../models/AIConversation.js';
import AIPrediction from '../models/AIPrediction.js';

export class AIService {
  public async generateChatResponse(userId: string, message: string, conversationId?: string) {
    let conversation;

    if (conversationId) {
      conversation = await AIConversation.findById(conversationId);
      if (!conversation) throw new Error('Conversation not found');
    } else {
      conversation = new AIConversation({
        userId,
        title: message.substring(0, 30) + (message.length > 30 ? '...' : ''),
        messages: [{ role: 'system', content: 'Tu es un assistant agricole expert (AgroMaître).' }],
      });
    }

    // Add user message
    conversation.messages.push({ role: 'user', content: message, timestamp: new Date() });

    // Mock AI Response generated based on context or keywords
    const aiResponseContent = this.getMockResponse(message);
    
    // Add assistant message
    conversation.messages.push({ role: 'assistant', content: aiResponseContent, timestamp: new Date() });
    
    conversation.tokensUsed += 150; // mock tokens
    conversation.lastMessageAt = new Date();
    await conversation.save();

    return conversation;
  }

  public async generatePrediction(domainId: string, type: 'yield' | 'disease' | 'weather_impact', target: string) {
    const mockData = this.getMockPredictionData(type, target);
    
    const prediction = new AIPrediction({
      domainId,
      type,
      target,
      predictionData: mockData,
      confidence: 85 + Math.random() * 10, // 85-95%
      modelUsed: 'agromaitre-vision-v1',
    });

    await prediction.save();
    return prediction;
  }

  private getMockResponse(query: string): string {
    const q = query.toLowerCase();
    if (q.includes('météo') || q.includes('pluie')) {
      return "Les prévisions indiquent une probabilité de pluie de 60% dans les 48 prochaines heures. Il est conseillé de reporter les traitements phytosanitaires.";
    }
    if (q.includes('maladie') || q.includes('champignon')) {
      return "D'après les symptômes décrits, il pourrait s'agir de mildiou. Pouvez-vous fournir une photo ou plus de détails sur l'aspect des feuilles ?";
    }
    if (q.includes('récolte') || q.includes('rendement')) {
      return "Le modèle prédictif estime le rendement de la parcelle à 4.5 tonnes par hectare cette saison, en légère hausse par rapport à l'année dernière.";
    }
    return "Je suis à votre disposition pour vous aider dans la gestion de votre exploitation agricole. Que puis-je faire pour vous aujourd'hui ?";
  }

  private getMockPredictionData(type: string, target: string) {
    switch (type) {
      case 'yield':
        return {
          estimatedYield: '4.5 t/ha',
          variance: '+/- 0.3 t/ha',
          factors: ['Température optimale (+15%)', 'Irrigation régulière (+5%)']
        };
      case 'disease':
        return {
          riskLevel: 'Moyen',
          pathogen: 'Oïdium',
          probability: '65%',
          recommendation: 'Traitement préventif au soufre sous 48h'
        };
      case 'weather_impact':
        return {
          alert: 'Gel tardif potentiel',
          affectedArea: 'Parcelles Nord',
          mitigation: 'Préparer les systèmes anti-gel'
        };
      default:
        return { status: 'ok', detail: 'Analysis complete.' };
    }
  }
}

export const aiService = new AIService();
