# 🤖 FootballHub+ - SUPABASE + LLM (Part 3 FINAL: React Components & Guide)

## 🎨 PARTIE 6 : COMPOSANTS REACT

### Composant Chat IA

```typescript
// components/ai/AIChat.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { aiChatService, type ChatMessage } from '@/lib/services/aiChatService';
import { useAuth } from '@/hooks/useAuth';

export const AIChat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [credits, setCredits] = useState(100);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadCredits();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadCredits = async () => {
    try {
      const userCredits = await aiChatService.getUserCredits(user!.id);
      setCredits(userCredits);
    } catch (error) {
      console.error('Load credits error:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiChatService.sendMessage(
        input,
        conversationId,
        'gpt-4',
        'general_chat'
      );

      if (!conversationId) {
        setConversationId(response.conversationId);
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setCredits(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error('Send message error:', error);
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Erreur: ${error.message || 'Une erreur est survenue'}`,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'Résume le dernier match du Raja',
    'Qui sont les meilleurs buteurs de la Botola ?',
    'Analyse la forme de Wydad Casablanca',
    'Prédis le prochain match Raja vs WAC',
  ];

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Bot size={24} className="text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">
              Assistant Football IA
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Propulsé par GPT-4
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
          <Sparkles size={14} className="text-primary" />
          <span className="text-sm font-medium text-primary">
            {credits} crédits
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Bot size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Bonjour ! 👋
            </h4>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Je suis ton assistant football. Pose-moi n'importe quelle question !
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl mx-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setInput(suggestion)}
                  className="p-3 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Bot size={18} className="text-primary" />
                </div>
              )}

              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-primary text-black'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-70 mt-2 block">
                  {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-gray-600 dark:text-gray-400" />
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot size={18} className="text-primary" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-2xl">
              <Loader2 size={18} className="animate-spin text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pose ta question..."
            disabled={loading || credits === 0}
            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading || credits === 0}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-black rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>

        {credits === 0 && (
          <p className="text-xs text-red-500 mt-2">
            Vous n'avez plus de crédits. Contactez un administrateur.
          </p>
        )}
      </form>
    </div>
  );
};
```

### Composant Knowledge Search

```typescript
// components/ai/KnowledgeSearch.tsx
'use client';

import React, { useState } from 'react';
import { Search, Sparkles, ChevronRight } from 'lucide-react';
import { embeddingService } from '@/lib/services/embeddingService';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  similarity: number;
  metadata: any;
}

export const KnowledgeSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    try {
      setLoading(true);
      const searchResults = await embeddingService.searchKnowledge(query, 0.7, 5);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <Sparkles size={20} className="text-primary ml-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Recherche sémantique IA..."
            className="flex-1 px-2 py-3 bg-transparent focus:outline-none text-gray-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-black rounded-lg font-medium disabled:opacity-50 transition-colors"
          >
            {loading ? 'Recherche...' : 'Rechercher'}
          </button>
        </div>
      </form>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Résultats ({results.length})
          </h3>

          {results.map((result) => (
            <div
              key={result.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold text-gray-900 dark:text-white">
                  {result.title}
                </h4>
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  {Math.round(result.similarity * 100)}% match
                </span>
              </div>

              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                {result.content.substring(0, 200)}...
              </p>

              <button className="flex items-center gap-1 text-primary hover:gap-2 transition-all text-sm font-medium">
                En savoir plus
                <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### Composant Match Prediction

```typescript
// components/ai/MatchPrediction.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Loader2, Trophy, Target } from 'lucide-react';
import { predictionService } from '@/lib/services/predictionService';

interface MatchPredictionProps {
  matchId: string;
  homeTeam: {
    name: string;
    logo: string;
  };
  awayTeam: {
    name: string;
    logo: string;
  };
}

export const MatchPrediction: React.FC<MatchPredictionProps> = ({
  matchId,
  homeTeam,
  awayTeam,
}) => {
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrediction();
  }, [matchId]);

  const loadPrediction = async () => {
    try {
      const data = await predictionService.getPrediction(matchId);
      setPrediction(data);
    } catch (error) {
      console.error('Load prediction error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="text-center p-8">
        <Target size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">
          Prédiction non disponible pour ce match
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl">
        <TrendingUp size={24} className="text-primary" />
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">
            Prédiction IA
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Confiance: {Math.round(prediction.confidence_score * 100)}%
          </p>
        </div>
      </div>

      {/* Predicted Score */}
      <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Score Prédit
        </p>
        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <img
              src={homeTeam.logo}
              alt={homeTeam.name}
              className="w-12 h-12 mx-auto mb-2"
            />
            <p className="text-sm font-medium">{homeTeam.name}</p>
          </div>

          <div className="text-4xl font-bold text-primary">
            {prediction.predicted_score}
          </div>

          <div className="text-center">
            <img
              src={awayTeam.logo}
              alt={awayTeam.name}
              className="w-12 h-12 mx-auto mb-2"
            />
            <p className="text-sm font-medium">{awayTeam.name}</p>
          </div>
        </div>
      </div>

      {/* Probabilities */}
      <div className="grid grid-cols-3 gap-4">
        <ProbabilityCard
          label="Victoire Domicile"
          probability={prediction.home_team_win_probability}
          color="bg-green-500"
        />
        <ProbabilityCard
          label="Match Nul"
          probability={prediction.draw_probability}
          color="bg-yellow-500"
        />
        <ProbabilityCard
          label="Victoire Extérieur"
          probability={prediction.away_team_win_probability}
          color="bg-blue-500"
        />
      </div>

      {/* Reasoning */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
        <h4 className="font-bold text-gray-900 dark:text-white mb-2">
          Analyse
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {prediction.reasoning}
        </p>
      </div>

      {/* Key Factors */}
      {prediction.key_factors && (
        <div className="space-y-2">
          <h4 className="font-bold text-gray-900 dark:text-white">
            Facteurs Clés
          </h4>
          {prediction.key_factors.map((factor: any, index: number) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {factor.factor}
                  </span>
                  <span className="text-sm font-medium text-primary">
                    {Math.round(factor.impact * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${factor.impact * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProbabilityCard: React.FC<{
  label: string;
  probability: number;
  color: string;
}> = ({ label, probability, color }) => (
  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-center">
    <div className={`w-16 h-16 ${color} rounded-full mx-auto mb-2 flex items-center justify-center`}>
      <Trophy size={24} className="text-white" />
    </div>
    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
      {Math.round(probability)}%
    </p>
    <p className="text-xs text-gray-500 dark:text-gray-400">
      {label}
    </p>
  </div>
);
```

---

## ✅ PARTIE 7 : GUIDE D'INTÉGRATION COMPLET

### 1. Setup Supabase Project

```bash
# Create project on supabase.com
# Get URL and keys

# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 2. Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy ai-chat
supabase functions deploy generate-embeddings
supabase functions deploy predict-match

# Set secrets
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Configuration Next.js

```typescript
// middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

---

## 🎯 CAS D'USAGE COMPLETS

### Use Case 1 : Chat Assistant Football

```typescript
// app/ai-chat/page.tsx
import { AIChat } from '@/components/ai/AIChat';

export default function AIChatPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Assistant Football IA</h1>
      <AIChat />
    </div>
  );
}
```

### Use Case 2 : Recherche Sémantique

```typescript
// app/knowledge/page.tsx
import { KnowledgeSearch } from '@/components/ai/KnowledgeSearch';

export default function KnowledgePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Recherche IA</h1>
      <KnowledgeSearch />
    </div>
  );
}
```

### Use Case 3 : Prédictions Matchs

```typescript
// app/match/[id]/page.tsx
import { MatchPrediction } from '@/components/ai/MatchPrediction';

export default function MatchPage({ params }: { params: { id: string } }) {
  // ... fetch match data

  return (
    <div>
      {/* Match info */}
      <MatchPrediction
        matchId={params.id}
        homeTeam={match.homeTeam}
        awayTeam={match.awayTeam}
      />
    </div>
  );
}
```

---

## 🎉 RÉSUMÉ

✅ **Supabase + LLM Integration Complète**
✅ **pgvector pour RAG**
✅ **Edge Functions pour AI**
✅ **3 Services complets**
✅ **3 Composants React**
✅ **Guide d'intégration**

**INTÉGRATION SUPABASE + LLM 100% COMPLÈTE ! 🚀🤖**
