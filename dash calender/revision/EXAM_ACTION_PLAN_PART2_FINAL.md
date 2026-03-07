# 🤖 FootballHub+ - CAS D'USAGE LLM & IMPLÉMENTATION (Part 2 FINAL)

## 🎯 PARTIE 4 : CAS D'USAGE LLM SPÉCIFIQUES FOOTBALL

### 1. Assistant Match en Direct 🔴

```typescript
// services/llm/liveMatchAssistant.ts

interface LiveMatchContext {
  match: {
    homeTeam: string;
    awayTeam: string;
    score: string;
    minute: number;
    events: Event[];
  };
  stats: MatchStats;
}

class LiveMatchAssistant {
  async generateCommentary(context: LiveMatchContext): Promise<string> {
    const task = {
      type: 'generation' as const,
      complexity: 'simple' as const,
      context: `Tu es un commentateur sportif professionnel en direct. Génère un commentaire captivant basé sur l'action en cours.`,
      input: `
Match: ${context.match.homeTeam} ${context.match.score} ${context.match.awayTeam}
Minute: ${context.match.minute}'
Derniers événements: ${JSON.stringify(context.match.events.slice(-3))}
Statistiques: ${JSON.stringify(context.stats)}
      `,
      maxTokens: 200,
      temperature: 0.8, // Plus créatif
    };

    // Utilise Gemini (rapide + faible coût pour génération simple)
    return await llmRouter.execute(task);
  }

  async analyzeGoalOpportunity(
    situation: string,
    players: string[]
  ): Promise<string> {
    const task = {
      type: 'analysis' as const,
      complexity: 'medium' as const,
      context: `Tu es un analyste tactique expert. Analyse l'occasion de but.`,
      input: `
Situation: ${situation}
Joueurs impliqués: ${players.join(', ')}
Analyse: Probabilité de but? Qualité de la construction? Points clés tactiques?
      `,
      maxTokens: 300,
      temperature: 0.6,
    };

    // Utilise GPT-4 (meilleure analyse tactique)
    return await llmRouter.execute(task);
  }
}

export const liveMatchAssistant = new LiveMatchAssistant();
```

**Exemple d'utilisation:**

```typescript
// Dans votre WebSocket handler
ws.on('goal_scored', async (data) => {
  const commentary = await liveMatchAssistant.generateCommentary({
    match: {
      homeTeam: 'Raja Casablanca',
      awayTeam: 'Wydad',
      score: '2-1',
      minute: 67,
      events: data.recentEvents,
    },
    stats: data.matchStats,
  });

  // Broadcast commentary to all connected clients
  io.emit('ai_commentary', {
    text: commentary,
    timestamp: Date.now(),
  });
});
```

### 2. Analyse Prédictive de Match 📊

```typescript
// services/llm/matchPredictor.ts

interface PredictionInput {
  homeTeam: {
    name: string;
    form: string[]; // ['W', 'L', 'D', 'W', 'W']
    stats: {
      goalsScored: number;
      goalsConceded: number;
      possession: number;
      shots: number;
    };
    injuries: string[];
    suspensions: string[];
  };
  awayTeam: {
    name: string;
    form: string[];
    stats: any;
    injuries: string[];
    suspensions: string[];
  };
  h2h: {
    matches: number;
    homeWins: number;
    draws: number;
    awayWins: number;
  };
  weather?: string;
  referee?: string;
}

class MatchPredictor {
  async predictMatch(input: PredictionInput): Promise<{
    prediction: string;
    homeWinProb: number;
    drawProb: number;
    awayWinProb: number;
    reasoning: string;
    keyFactors: Array<{ factor: string; impact: number }>;
  }> {
    const task = {
      type: 'prediction' as const,
      complexity: 'complex' as const,
      context: `Tu es un expert en prédiction de matchs de football avec accès à des données statistiques avancées. Utilise les données fournies pour faire une prédiction détaillée.`,
      input: `
MATCH: ${input.homeTeam.name} vs ${input.awayTeam.name}

FORME RÉCENTE:
${input.homeTeam.name}: ${input.form.join(' ')} (5 derniers matchs)
${input.awayTeam.name}: ${input.awayTeam.form.join(' ')}

STATISTIQUES:
${input.homeTeam.name}: ${input.homeTeam.stats.goalsScored} buts marqués, ${input.homeTeam.stats.goalsConceded} encaissés
${input.awayTeam.name}: ${input.awayTeam.stats.goalsScored} buts marqués, ${input.awayTeam.stats.goalsConceded} encaissés

FACE À FACE:
${input.h2h.matches} matchs - ${input.h2h.homeWins} victoires ${input.homeTeam.name}, ${input.h2h.draws} nuls, ${input.h2h.awayWins} victoires ${input.awayTeam.name}

ABSENCES:
${input.homeTeam.name}: ${input.homeTeam.injuries.concat(input.homeTeam.suspensions).join(', ') || 'Aucune'}
${input.awayTeam.name}: ${input.awayTeam.injuries.concat(input.awayTeam.suspensions).join(', ') || 'Aucune'}

Fournis une prédiction au format JSON:
{
  "prediction": "1-0 ou 2-1",
  "homeWinProb": 45,
  "drawProb": 30,
  "awayWinProb": 25,
  "reasoning": "...",
  "keyFactors": [
    {"factor": "Forme récente", "impact": 0.8},
    {"factor": "Avantage domicile", "impact": 0.6}
  ]
}
      `,
      maxTokens: 1000,
      temperature: 0.4, // Moins de créativité, plus de précision
    };

    // Utilise Claude (excellent raisonnement analytique)
    const response = await llmRouter.execute(task);
    
    // Parse JSON response
    const prediction = JSON.parse(response);
    
    return prediction;
  }

  async explainPrediction(
    prediction: any,
    userQuestion: string
  ): Promise<string> {
    const task = {
      type: 'chat' as const,
      complexity: 'medium' as const,
      context: `Tu es un analyste sportif. Explique la prédiction du match de manière pédagogique.`,
      input: `
Prédiction: ${JSON.stringify(prediction)}
Question de l'utilisateur: ${userQuestion}
      `,
      maxTokens: 500,
      temperature: 0.7,
    };

    return await llmRouter.execute(task);
  }
}

export const matchPredictor = new MatchPredictor();
```

### 3. Générateur de Contenu Automatique ✍️

```typescript
// services/llm/contentGenerator.ts

class ContentGenerator {
  /**
   * Génère résumé de match
   */
  async generateMatchSummary(matchData: any): Promise<{
    title: string;
    summary: string;
    highlights: string[];
  }> {
    const task = {
      type: 'generation' as const,
      complexity: 'medium' as const,
      context: `Tu es un journaliste sportif professionnel. Rédige un résumé de match captivant et informatif.`,
      input: `
Match: ${matchData.homeTeam} ${matchData.score} ${matchData.awayTeam}
Date: ${matchData.date}
Stade: ${matchData.venue}

Événements clés:
${matchData.events.map((e: any) => `${e.minute}' - ${e.type}: ${e.player} (${e.team})`).join('\n')}

Statistiques:
- Possession: ${matchData.stats.homePossession}% - ${matchData.stats.awayPossession}%
- Tirs: ${matchData.stats.homeShots} - ${matchData.stats.awayShots}
- Tirs cadrés: ${matchData.stats.homeShotsOnTarget} - ${matchData.stats.awayShotsOnTarget}

Génère un résumé au format JSON:
{
  "title": "Titre accrocheur du match",
  "summary": "Résumé de 200-300 mots",
  "highlights": ["Point clé 1", "Point clé 2", "Point clé 3"]
}
      `,
      maxTokens: 800,
      temperature: 0.7,
    };

    const response = await llmRouter.execute(task);
    return JSON.parse(response);
  }

  /**
   * Génère biographie de joueur
   */
  async generatePlayerBio(playerData: any): Promise<string> {
    const task = {
      type: 'generation' as const,
      complexity: 'simple' as const,
      context: `Tu es un rédacteur sportif. Crée une biographie de joueur engageante.`,
      input: `
Nom: ${playerData.name}
Âge: ${playerData.age}
Nationalité: ${playerData.nationality}
Poste: ${playerData.position}
Club actuel: ${playerData.currentClub}
Carrière: ${playerData.careerPath.join(' → ')}
Statistiques saison: ${playerData.seasonStats.goals} buts, ${playerData.seasonStats.assists} passes décisives

Rédige une biographie de 150-200 mots mettant en valeur son parcours et ses qualités.
      `,
      maxTokens: 400,
      temperature: 0.75,
    };

    return await llmRouter.execute(task);
  }

  /**
   * Traduit contenu en plusieurs langues
   */
  async translateContent(
    content: string,
    targetLanguages: string[]
  ): Promise<Record<string, string>> {
    const translations: Record<string, string> = {};

    for (const lang of targetLanguages) {
      const task = {
        type: 'translation' as const,
        complexity: 'simple' as const,
        context: `Tu es un traducteur professionnel spécialisé dans le contenu sportif.`,
        input: `Traduis ce texte en ${lang}:\n\n${content}`,
        maxTokens: content.length * 2,
        temperature: 0.3, // Très précis pour traduction
      };

      // Utilise Gemini (excellent traducteur, faible coût)
      translations[lang] = await llmRouter.execute(task);
    }

    return translations;
  }
}

export const contentGenerator = new ContentGenerator();
```

### 4. Chatbot Support Client 💬

```typescript
// services/llm/supportBot.ts

class SupportBot {
  private knowledgeBase: string[] = [
    "Les billets peuvent être achetés directement sur la plateforme FootballHub+",
    "Pour scanner un billet, utilisez le QR code dans l'application mobile",
    "Les paiements sont sécurisés via Stripe",
    "Vous pouvez suivre les matchs en direct dans la section 'Live'",
    // ... plus de knowledge base
  ];

  async answerQuestion(
    question: string,
    userId?: string,
    conversationHistory?: Array<{ role: string; content: string }>
  ): Promise<string> {
    // 1. Recherche dans la knowledge base (RAG simple)
    const relevantInfo = await this.searchKnowledgeBase(question);

    // 2. Construire le contexte
    let context = `Tu es un assistant support client pour FootballHub+, une plateforme de football marocaine.`;
    
    if (relevantInfo.length > 0) {
      context += `\n\nInformations pertinentes:\n${relevantInfo.join('\n')}`;
    }

    // 3. Inclure l'historique de conversation
    let input = question;
    if (conversationHistory && conversationHistory.length > 0) {
      input = `Historique:\n${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nNouvelle question: ${question}`;
    }

    const task = {
      type: 'chat' as const,
      complexity: 'simple' as const,
      context,
      input,
      maxTokens: 300,
      temperature: 0.6,
    };

    // Utilise Gemini (rapide et économique pour support)
    return await llmRouter.execute(task);
  }

  private async searchKnowledgeBase(query: string): Promise<string[]> {
    // Simple keyword matching (dans un vrai système, utilisez pgvector)
    const keywords = query.toLowerCase().split(' ');
    
    return this.knowledgeBase.filter(item =>
      keywords.some(keyword => item.toLowerCase().includes(keyword))
    );
  }
}

export const supportBot = new SupportBot();
```

---

## 🧪 PARTIE 5 : SCRIPTS DE TEST AUTOMATISÉS

### Script de Test Complet

```typescript
// scripts/test-all-services.ts

import { llmRouter } from '../lib/services/intelligentLLMRouter';
import { liveMatchAssistant } from '../lib/services/llm/liveMatchAssistant';
import { matchPredictor } from '../lib/services/llm/matchPredictor';
import { contentGenerator } from '../lib/services/llm/contentGenerator';
import { supportBot } from '../lib/services/llm/supportBot';

async function testAllServices() {
  console.log('🧪 Testing all LLM services...\n');

  try {
    // 1. Test LLM Router
    console.log('1️⃣ Testing LLM Router...');
    const routerResult = await llmRouter.execute({
      type: 'chat',
      complexity: 'simple',
      context: 'Tu es un assistant football',
      input: 'Qui a gagné la dernière Coupe du Monde?',
      maxTokens: 100,
    });
    console.log('✅ Router:', routerResult.substring(0, 50) + '...\n');

    // 2. Test Live Commentary
    console.log('2️⃣ Testing Live Match Commentary...');
    const commentary = await liveMatchAssistant.generateCommentary({
      match: {
        homeTeam: 'Raja Casablanca',
        awayTeam: 'Wydad Casablanca',
        score: '1-1',
        minute: 78,
        events: [
          { type: 'goal', player: 'Zouheir', minute: 65, team: 'Raja' },
          { type: 'goal', player: 'El Karti', minute: 72, team: 'Wydad' },
        ],
      },
      stats: {
        possession: { home: 52, away: 48 },
        shots: { home: 12, away: 10 },
      },
    });
    console.log('✅ Commentary:', commentary.substring(0, 100) + '...\n');

    // 3. Test Match Prediction
    console.log('3️⃣ Testing Match Prediction...');
    const prediction = await matchPredictor.predictMatch({
      homeTeam: {
        name: 'Raja Casablanca',
        form: ['W', 'W', 'D', 'W', 'L'],
        stats: {
          goalsScored: 18,
          goalsConceded: 8,
          possession: 56,
          shots: 124,
        },
        injuries: [],
        suspensions: [],
      },
      awayTeam: {
        name: 'FAR Rabat',
        form: ['L', 'D', 'W', 'D', 'L'],
        stats: {
          goalsScored: 12,
          goalsConceded: 15,
          possession: 48,
          shots: 98,
        },
        injuries: ['Joueur A'],
        suspensions: [],
      },
      h2h: {
        matches: 10,
        homeWins: 6,
        draws: 2,
        awayWins: 2,
      },
    });
    console.log('✅ Prediction:', JSON.stringify(prediction, null, 2) + '\n');

    // 4. Test Content Generation
    console.log('4️⃣ Testing Content Generation...');
    const summary = await contentGenerator.generateMatchSummary({
      homeTeam: 'Raja',
      awayTeam: 'Wydad',
      score: '2-1',
      date: '2024-02-06',
      venue: 'Stade Mohamed V',
      events: [
        { minute: 23, type: 'goal', player: 'Zouheir', team: 'Raja' },
        { minute: 45, type: 'goal', player: 'El Karti', team: 'Wydad' },
        { minute: 89, type: 'goal', player: 'Ben Malih', team: 'Raja' },
      ],
      stats: {
        homePossession: 54,
        awayPossession: 46,
        homeShots: 15,
        awayShots: 11,
        homeShotsOnTarget: 7,
        awayShotsOnTarget: 5,
      },
    });
    console.log('✅ Summary:', JSON.stringify(summary, null, 2) + '\n');

    // 5. Test Support Bot
    console.log('5️⃣ Testing Support Bot...');
    const answer = await supportBot.answerQuestion(
      'Comment acheter un billet?'
    );
    console.log('✅ Support:', answer.substring(0, 100) + '...\n');

    console.log('🎉 All tests passed!\n');

    // Print cost estimate
    console.log('💰 Estimated costs:');
    console.log('- Router test: ~$0.001');
    console.log('- Commentary: ~$0.0002 (Gemini)');
    console.log('- Prediction: ~$0.003 (Claude)');
    console.log('- Summary: ~$0.01 (GPT-4)');
    console.log('- Support: ~$0.0002 (Gemini)');
    console.log('TOTAL: ~$0.015 per test run\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
testAllServices();
```

**Exécuter les tests:**

```bash
# Install dependencies
npm install openai @anthropic-ai/sdk @google/generative-ai

# Set environment variables
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...
export GOOGLE_AI_API_KEY=...

# Run tests
npx ts-node scripts/test-all-services.ts
```

---

## 📊 PARTIE 6 : MONITORING & ANALYTICS LLM

```typescript
// lib/services/llmAnalytics.ts

interface LLMUsage {
  timestamp: Date;
  provider: string;
  model: string;
  task: string;
  tokensUsed: number;
  cost: number;
  latency: number;
  success: boolean;
}

class LLMAnalytics {
  private usage: LLMUsage[] = [];

  track(usage: LLMUsage) {
    this.usage.push(usage);
    
    // Save to database
    this.saveToDB(usage);

    // Log to console (development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 LLM Usage: ${usage.provider}/${usage.model} - ${usage.tokensUsed} tokens ($${usage.cost.toFixed(4)}) - ${usage.latency}ms`);
    }
  }

  async getStats(period: 'day' | 'week' | 'month') {
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    const filtered = this.usage.filter(u => u.timestamp >= startDate);

    return {
      totalRequests: filtered.length,
      totalTokens: filtered.reduce((sum, u) => sum + u.tokensUsed, 0),
      totalCost: filtered.reduce((sum, u) => sum + u.cost, 0),
      avgLatency: filtered.reduce((sum, u) => sum + u.latency, 0) / filtered.length,
      successRate: (filtered.filter(u => u.success).length / filtered.length) * 100,
      byProvider: this.groupBy(filtered, 'provider'),
      byTask: this.groupBy(filtered, 'task'),
    };
  }

  private groupBy(array: LLMUsage[], key: keyof LLMUsage) {
    return array.reduce((acc: any, item) => {
      const group = item[key] as string;
      if (!acc[group]) {
        acc[group] = { count: 0, cost: 0, tokens: 0 };
      }
      acc[group].count++;
      acc[group].cost += item.cost;
      acc[group].tokens += item.tokensUsed;
      return acc;
    }, {});
  }

  private async saveToDB(usage: LLMUsage) {
    // Save to MongoDB or Supabase
    // await db.collection('llm_usage').insertOne(usage);
  }
}

export const llmAnalytics = new LLMAnalytics();
```

---

## ✅ CHECKLIST FINALE D'INTÉGRATION

```
□ Backend Services
  □ MongoDB connecté et seedé
  □ Redis cache fonctionnel
  □ Toutes les routes API testées
  □ WebSocket live scores actif
  □ CRON jobs lancés

□ Supabase + LLM
  □ Project créé
  □ Tables & extensions configurées
  □ Edge Functions déployées
  □ Secrets configurés
  □ RAG system testé

□ Frontend
  □ Next.js build success
  □ Pages créées
  □ Auth flow complet
  □ Composants UI testés

□ Mobile
  □ Capacitor sync OK
  □ Android build
  □ iOS build
  □ Plugins configurés

□ External APIs
  □ SportMonks configured
  □ OpenAI tested
  □ Anthropic tested
  □ Google AI tested
  □ Stripe webhooks
  □ Firebase push
  □ Resend emails

□ LLM Services
  □ Router intelligent
  □ Live commentary
  □ Match prediction
  □ Content generation
  □ Support bot
  □ Analytics tracking

□ Testing
  □ Unit tests
  □ Integration tests
  □ E2E tests
  □ Load tests
  □ Cost monitoring
```

**INTÉGRATION COMPLÈTE PRÊTE ! 🚀**
