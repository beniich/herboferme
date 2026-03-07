# 🤖 FootballHub+ - INTÉGRATION SUPABASE + LLM (Part 1)

## 🎯 Vue d'Ensemble

Intégration complète de Supabase avec support LLM pour FootballHub+ :
- ✅ Supabase PostgreSQL + pgvector
- ✅ Edge Functions pour appels LLM
- ✅ Système RAG (Retrieval-Augmented Generation)
- ✅ Chat IA pour fans de football
- ✅ Analyse prédictive matches
- ✅ Génération de contenu automatique

---

## 📊 PARTIE 1 : CONFIGURATION SUPABASE

### Installation

```bash
# Install Supabase CLI
npm install -g supabase

# Install client libraries
npm install @supabase/supabase-js @supabase/ssr
npm install openai anthropic @google/generative-ai

# Install vector utilities
npm install @supabase/vecs
```

### Variables d'Environnement

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# LLM APIs
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...

# Vector Search
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
```

---

## 🗄️ PARTIE 2 : SCHÉMA DATABASE SUPABASE

### SQL Migration Complète

```sql
-- ============================================================
-- ENABLE EXTENSIONS
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- PROFILES TABLE (Enhanced User)
-- ============================================================

CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    favorite_teams UUID[],
    favorite_players UUID[],
    
    -- Preferences
    preferences JSONB DEFAULT '{
        "notifications": {
            "breaking_news": true,
            "transfers": true,
            "match_alerts": true
        },
        "language": "fr",
        "theme": "dark"
    }'::jsonb,
    
    -- AI Usage Tracking
    ai_credits_remaining INTEGER DEFAULT 100,
    ai_usage_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- ============================================================
-- AI CONVERSATIONS TABLE
-- ============================================================

CREATE TABLE public.ai_conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Conversation data
    title TEXT,
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Metadata
    model TEXT NOT NULL, -- 'gpt-4', 'claude-3-sonnet', 'gemini-pro'
    context_type TEXT, -- 'match_analysis', 'player_stats', 'general_chat'
    
    -- Usage tracking
    tokens_used INTEGER DEFAULT 0,
    cost_usd DECIMAL(10, 6) DEFAULT 0,
    
    -- State
    is_archived BOOLEAN DEFAULT false,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_created_at ON public.ai_conversations(created_at DESC);

-- RLS
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
    ON public.ai_conversations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations"
    ON public.ai_conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
    ON public.ai_conversations FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================================
-- KNOWLEDGE BASE (RAG System)
-- ============================================================

CREATE TABLE public.knowledge_base (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Content
    content TEXT NOT NULL,
    title TEXT,
    source_type TEXT NOT NULL, -- 'news', 'match', 'player', 'team', 'manual'
    source_id UUID, -- Reference to original content
    
    -- Vector embedding
    embedding vector(1536), -- OpenAI ada-002 dimension
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- League/Team filtering
    league_id UUID,
    team_ids UUID[],
    player_ids UUID[],
    
    -- Dates for relevance
    published_at TIMESTAMPTZ,
    relevance_score FLOAT DEFAULT 1.0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector search index (IVFFlat for speed)
CREATE INDEX ON public.knowledge_base 
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Other indexes
CREATE INDEX idx_knowledge_base_source ON public.knowledge_base(source_type, source_id);
CREATE INDEX idx_knowledge_base_league ON public.knowledge_base(league_id);
CREATE INDEX idx_knowledge_base_published ON public.knowledge_base(published_at DESC);

-- Full-text search
CREATE INDEX idx_knowledge_base_content_fts ON public.knowledge_base 
    USING gin(to_tsvector('french', content));

-- RLS (Public read)
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Knowledge base is readable by all"
    ON public.knowledge_base FOR SELECT
    USING (true);

CREATE POLICY "Only service role can insert"
    ON public.knowledge_base FOR INSERT
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ============================================================
-- MATCH PREDICTIONS TABLE
-- ============================================================

CREATE TABLE public.ai_match_predictions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    match_id UUID NOT NULL,
    
    -- Prediction
    home_team_win_probability FLOAT,
    draw_probability FLOAT,
    away_team_win_probability FLOAT,
    predicted_score TEXT, -- e.g., "2-1"
    
    -- AI Model used
    model TEXT NOT NULL,
    confidence_score FLOAT,
    
    -- Analysis
    reasoning TEXT,
    key_factors JSONB, -- [{factor: 'form', impact: 0.8}, ...]
    
    -- Outcome (after match)
    actual_score TEXT,
    prediction_accuracy FLOAT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    match_date TIMESTAMPTZ NOT NULL
);

-- Indexes
CREATE INDEX idx_predictions_match ON public.ai_match_predictions(match_id);
CREATE INDEX idx_predictions_date ON public.ai_match_predictions(match_date DESC);

-- RLS
ALTER TABLE public.ai_match_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Predictions are publicly readable"
    ON public.ai_match_predictions FOR SELECT
    USING (true);

-- ============================================================
-- AI GENERATED CONTENT TABLE
-- ============================================================

CREATE TABLE public.ai_generated_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Content
    content_type TEXT NOT NULL, -- 'match_summary', 'player_bio', 'news_summary'
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    
    -- Source reference
    source_type TEXT,
    source_id UUID,
    
    -- Generation metadata
    model TEXT NOT NULL,
    prompt_used TEXT,
    tokens_used INTEGER,
    
    -- Review status
    status TEXT DEFAULT 'draft', -- 'draft', 'reviewed', 'published'
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    
    -- Publishing
    published_at TIMESTAMPTZ,
    views INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ai_content_type ON public.ai_generated_content(content_type, status);
CREATE INDEX idx_ai_content_published ON public.ai_generated_content(published_at DESC);

-- RLS
ALTER TABLE public.ai_generated_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published content is publicly readable"
    ON public.ai_generated_content FOR SELECT
    USING (status = 'published');

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON public.ai_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_base_updated_at
    BEFORE UPDATE ON public.knowledge_base
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Vector similarity search
CREATE OR REPLACE FUNCTION match_knowledge(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 5,
    filter_league_id uuid DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    content text,
    title text,
    similarity float,
    metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        kb.id,
        kb.content,
        kb.title,
        1 - (kb.embedding <=> query_embedding) AS similarity,
        kb.metadata
    FROM public.knowledge_base kb
    WHERE 
        (filter_league_id IS NULL OR kb.league_id = filter_league_id)
        AND 1 - (kb.embedding <=> query_embedding) > match_threshold
    ORDER BY kb.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Function: Increment AI usage
CREATE OR REPLACE FUNCTION increment_ai_usage(
    user_uuid uuid,
    credits_used int DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.profiles
    SET 
        ai_credits_remaining = GREATEST(0, ai_credits_remaining - credits_used),
        ai_usage_count = ai_usage_count + 1
    WHERE id = user_uuid;
END;
$$;

-- ============================================================
-- INITIAL DATA
-- ============================================================

-- Sample knowledge base entry
INSERT INTO public.knowledge_base (content, title, source_type, metadata)
VALUES (
    'Le Raja Casablanca est l''un des clubs les plus titrés du Maroc avec 13 titres de champion.',
    'Histoire du Raja Casablanca',
    'manual',
    '{"category": "club_info", "verified": true}'::jsonb
);
```

---

## 🔧 PARTIE 3 : SUPABASE CLIENT SETUP

### Client Configuration

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Singleton instance
export const supabase = createClient();
```

### Server Client (for API routes)

```typescript
// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export const createClient = () => {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Server Component
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Server Component
          }
        },
      },
    }
  );
};
```

### Service Role Client (admin operations)

```typescript
// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
```

Suite dans le prochain fichier avec Edge Functions et services LLM ! 🚀
