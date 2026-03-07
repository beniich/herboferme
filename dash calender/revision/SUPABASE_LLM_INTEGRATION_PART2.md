# 🤖 FootballHub+ - SUPABASE + LLM (Part 2: Edge Functions & Services)

## 🌐 PARTIE 4 : EDGE FUNCTIONS SUPABASE

### Edge Function: Chat IA

```typescript
// supabase/functions/ai-chat/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { OpenAI } from 'https://esm.sh/openai@4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  conversationId?: string;
  message: string;
  model?: string;
  context?: 'match_analysis' | 'player_stats' | 'general_chat';
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse request
    const { conversationId, message, model = 'gpt-4', context }: ChatRequest = await req.json();

    // Check user credits
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('ai_credits_remaining')
      .eq('id', user.id)
      .single();

    if (!profile || profile.ai_credits_remaining <= 0) {
      throw new Error('Insufficient AI credits');
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      const { data } = await supabaseClient
        .from('ai_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();
      conversation = data;
    } else {
      const { data } = await supabaseClient
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          model,
          context_type: context,
          messages: [],
        })
        .select()
        .single();
      conversation = data;
    }

    // Add user message to conversation
    const messages = conversation.messages || [];
    messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    });

    // Get context from knowledge base if needed
    let systemContext = '';
    if (context) {
      systemContext = await getContextualKnowledge(message, context, supabaseClient);
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    // Prepare messages for OpenAI
    const chatMessages = [
      {
        role: 'system',
        content: `Tu es un assistant expert en football. ${systemContext}`,
      },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: model,
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const assistantMessage = completion.choices[0].message.content;

    // Add assistant response
    messages.push({
      role: 'assistant',
      content: assistantMessage,
      timestamp: new Date().toISOString(),
    });

    // Update conversation
    await supabaseClient
      .from('ai_conversations')
      .update({
        messages,
        tokens_used: conversation.tokens_used + (completion.usage?.total_tokens || 0),
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversation.id);

    // Decrement user credits
    await supabaseClient.rpc('increment_ai_usage', {
      user_uuid: user.id,
      credits_used: 1,
    });

    return new Response(
      JSON.stringify({
        success: true,
        conversationId: conversation.id,
        message: assistantMessage,
        tokensUsed: completion.usage?.total_tokens,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Helper: Get contextual knowledge from RAG
async function getContextualKnowledge(
  query: string,
  context: string,
  supabaseClient: any
): Promise<string> {
  // Generate embedding for query
  const openai = new OpenAI({
    apiKey: Deno.env.get('OPENAI_API_KEY'),
  });

  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });

  const embedding = embeddingResponse.data[0].embedding;

  // Search knowledge base
  const { data: results } = await supabaseClient.rpc('match_knowledge', {
    query_embedding: embedding,
    match_threshold: 0.7,
    match_count: 3,
  });

  if (!results || results.length === 0) {
    return '';
  }

  // Format context
  const contextText = results
    .map((r: any) => `- ${r.title}: ${r.content}`)
    .join('\n');

  return `Voici des informations pertinentes de notre base de connaissances :\n${contextText}`;
}
```

### Edge Function: Generate Embeddings

```typescript
// supabase/functions/generate-embeddings/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { OpenAI } from 'https://esm.sh/openai@4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmbeddingRequest {
  content: string;
  title: string;
  sourceType: string;
  sourceId?: string;
  metadata?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { content, title, sourceType, sourceId, metadata }: EmbeddingRequest = 
      await req.json();

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    // Generate embedding
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: content,
    });

    const embedding = embeddingResponse.data[0].embedding;

    // Store in knowledge base
    const { data, error } = await supabaseClient
      .from('knowledge_base')
      .insert({
        content,
        title,
        source_type: sourceType,
        source_id: sourceId,
        embedding: embedding,
        metadata: metadata || {},
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        id: data.id,
        tokensUsed: embeddingResponse.usage.total_tokens,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
```

### Edge Function: Match Prediction

```typescript
// supabase/functions/predict-match/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { OpenAI } from 'https://esm.sh/openai@4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PredictionRequest {
  matchId: string;
  homeTeam: {
    name: string;
    form: string[];
    stats: any;
  };
  awayTeam: {
    name: string;
    form: string[];
    stats: any;
  };
  headToHead: any[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { matchId, homeTeam, awayTeam, headToHead }: PredictionRequest = 
      await req.json();

    // Prepare analysis prompt
    const prompt = `
Tu es un expert en analyse de matchs de football. Analyse ce match et donne une prédiction détaillée.

Équipe à domicile: ${homeTeam.name}
Forme récente: ${homeTeam.form.join(', ')}
Statistiques: ${JSON.stringify(homeTeam.stats)}

Équipe à l'extérieur: ${awayTeam.name}
Forme récente: ${awayTeam.form.join(', ')}
Statistiques: ${JSON.stringify(awayTeam.stats)}

Historique face à face: ${JSON.stringify(headToHead)}

Donne ta prédiction au format JSON suivant:
{
  "homeWinProbability": <0-100>,
  "drawProbability": <0-100>,
  "awayWinProbability": <0-100>,
  "predictedScore": "X-Y",
  "confidence": <0-1>,
  "reasoning": "...",
  "keyFactors": [
    {"factor": "...", "impact": <0-1>}
  ]
}
    `;

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en prédiction de matchs de football. Réponds uniquement en JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const prediction = JSON.parse(completion.choices[0].message.content);

    // Store prediction
    const { data, error } = await supabaseClient
      .from('ai_match_predictions')
      .insert({
        match_id: matchId,
        home_team_win_probability: prediction.homeWinProbability,
        draw_probability: prediction.drawProbability,
        away_team_win_probability: prediction.awayWinProbability,
        predicted_score: prediction.predictedScore,
        model: 'gpt-4',
        confidence_score: prediction.confidence,
        reasoning: prediction.reasoning,
        key_factors: prediction.keyFactors,
        match_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        prediction: data,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
```

---

## 🔧 PARTIE 5 : SERVICES FRONTEND

### Embedding Service

```typescript
// lib/services/embeddingService.ts
import { supabase } from '@/lib/supabase/client';
import OpenAI from 'openai';

class EmbeddingService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true, // Only for client-side demo
    });
  }

  /**
   * Generate embedding for text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Embedding generation error:', error);
      throw error;
    }
  }

  /**
   * Add content to knowledge base via Edge Function
   */
  async addToKnowledgeBase(
    content: string,
    title: string,
    sourceType: string,
    sourceId?: string,
    metadata?: any
  ) {
    try {
      const { data, error } = await supabase.functions.invoke('generate-embeddings', {
        body: {
          content,
          title,
          sourceType,
          sourceId,
          metadata,
        },
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Add to knowledge base error:', error);
      throw error;
    }
  }

  /**
   * Semantic search in knowledge base
   */
  async searchKnowledge(
    query: string,
    threshold: number = 0.7,
    limit: number = 5,
    leagueId?: string
  ) {
    try {
      // Generate query embedding
      const embedding = await this.generateEmbedding(query);

      // Call Supabase RPC
      const { data, error } = await supabase.rpc('match_knowledge', {
        query_embedding: embedding,
        match_threshold: threshold,
        match_count: limit,
        filter_league_id: leagueId || null,
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Knowledge search error:', error);
      throw error;
    }
  }
}

export const embeddingService = new EmbeddingService();
```

### AI Chat Service

```typescript
// lib/services/aiChatService.ts
import { supabase } from '@/lib/supabase/client';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  model: string;
  contextType?: string;
  tokensUsed: number;
  lastMessageAt: string;
  createdAt: string;
}

class AIChatService {
  /**
   * Get user conversations
   */
  async getConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('last_message_at', { ascending: false });

    if (error) throw error;

    return data;
  }

  /**
   * Get conversation by ID
   */
  async getConversation(id: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return data;
  }

  /**
   * Send message to AI
   */
  async sendMessage(
    message: string,
    conversationId?: string,
    model: string = 'gpt-4',
    context?: string
  ) {
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          conversationId,
          message,
          model,
          context,
        },
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  /**
   * Archive conversation
   */
  async archiveConversation(id: string) {
    const { error } = await supabase
      .from('ai_conversations')
      .update({ is_archived: true })
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Delete conversation
   */
  async deleteConversation(id: string) {
    const { error } = await supabase
      .from('ai_conversations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Get user AI credits
   */
  async getUserCredits(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('profiles')
      .select('ai_credits_remaining')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return data.ai_credits_remaining;
  }
}

export const aiChatService = new AIChatService();
```

### Match Prediction Service

```typescript
// lib/services/predictionService.ts
import { supabase } from '@/lib/supabase/client';

interface MatchPrediction {
  id: string;
  matchId: string;
  homeTeamWinProbability: number;
  drawProbability: number;
  awayTeamWinProbability: number;
  predictedScore: string;
  confidence: number;
  reasoning: string;
  keyFactors: Array<{
    factor: string;
    impact: number;
  }>;
}

class PredictionService {
  /**
   * Get prediction for match
   */
  async getPrediction(matchId: string): Promise<MatchPrediction | null> {
    const { data, error } = await supabase
      .from('ai_match_predictions')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) return null;

    return data;
  }

  /**
   * Generate new prediction
   */
  async generatePrediction(
    matchId: string,
    homeTeam: any,
    awayTeam: any,
    headToHead: any[]
  ) {
    try {
      const { data, error } = await supabase.functions.invoke('predict-match', {
        body: {
          matchId,
          homeTeam,
          awayTeam,
          headToHead,
        },
      });

      if (error) throw error;

      return data.prediction;
    } catch (error) {
      console.error('Generate prediction error:', error);
      throw error;
    }
  }

  /**
   * Get prediction accuracy stats
   */
  async getPredictionStats() {
    const { data, error } = await supabase
      .from('ai_match_predictions')
      .select('prediction_accuracy')
      .not('prediction_accuracy', 'is', null);

    if (error) throw error;

    const accuracies = data.map(d => d.prediction_accuracy);
    const avgAccuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;

    return {
      totalPredictions: data.length,
      averageAccuracy: avgAccuracy,
    };
  }
}

export const predictionService = new PredictionService();
```

Suite dans le prochain fichier avec les composants React et guide complet ! 🚀
