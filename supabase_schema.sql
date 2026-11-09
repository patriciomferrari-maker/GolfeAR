-- ====================================================================
-- GOLF TRACKER - ESQUEMA DE BASE DE DATOS (SUPABASE)
-- Copiá y pegá este código en el "SQL Editor" de tu panel de Supabase
-- y hacé clic en "RUN".
-- ====================================================================

-- 1. CREAR TABLA DE CANCHAS (golf_courses)
CREATE TABLE IF NOT EXISTS public.golf_courses (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    par INTEGER NOT NULL,
    course_rating NUMERIC NOT NULL,
    slope_rating INTEGER NOT NULL,
    holes_par INTEGER[] NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar Row Level Security (RLS) para Canchas
ALTER TABLE public.golf_courses ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad RLS para Canchas:
-- Cualquiera puede leer canchas públicas (user_id IS NULL) o sus propias canchas
CREATE POLICY "Allow select for user's own or public courses" ON public.golf_courses
    FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

-- Solo el usuario creador puede insertar
CREATE POLICY "Allow insert for users on their own courses" ON public.golf_courses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Solo el usuario creador puede actualizar
CREATE POLICY "Allow update for users on their own courses" ON public.golf_courses
    FOR UPDATE USING (auth.uid() = user_id);

-- Solo el usuario creador puede borrar
CREATE POLICY "Allow delete for users on their own courses" ON public.golf_courses
    FOR DELETE USING (auth.uid() = user_id);


-- 2. CREAR TABLA DE SALIDAS (golf_rounds)
CREATE TABLE IF NOT EXISTS public.golf_rounds (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid() NOT NULL,
    course_id TEXT REFERENCES public.golf_courses(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    strokes INTEGER[] NOT NULL,
    putts INTEGER[] NOT NULL,
    penalties INTEGER[] NOT NULL,
    total_strokes INTEGER NOT NULL,
    played_par INTEGER NOT NULL,
    score_differential NUMERIC NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar Row Level Security (RLS) para Salidas
ALTER TABLE public.golf_rounds ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad RLS para Salidas (Privacidad Absoluta: cada uno ve solo lo suyo):
-- Solo ver mis propias rondas
CREATE POLICY "Allow select for user's own rounds" ON public.golf_rounds
    FOR SELECT USING (auth.uid() = user_id);

-- Solo insertar mis propias rondas
CREATE POLICY "Allow insert for user's own rounds" ON public.golf_rounds
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Solo actualizar mis propias rondas
CREATE POLICY "Allow update for user's own rounds" ON public.golf_rounds
    FOR UPDATE USING (auth.uid() = user_id);

-- Solo borrar mis propias rondas
CREATE POLICY "Allow delete for user's own rounds" ON public.golf_rounds
    FOR DELETE USING (auth.uid() = user_id);


-- 3. CREAR TABLA DE PARTIDAS EN VIVO / LOBBIES (golf_live_lobbies)
CREATE TABLE IF NOT EXISTS public.golf_live_lobbies (
    id TEXT PRIMARY KEY,
    course_id TEXT REFERENCES public.golf_courses(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    creator_name TEXT NOT NULL,
    status TEXT DEFAULT 'active' NOT NULL,
    players JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS para Lobbies
ALTER TABLE public.golf_live_lobbies ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad RLS para Lobbies (acceso libre para lectura/escritura mediante el ID de la partida)
CREATE POLICY "Allow public select on active lobbies" ON public.golf_live_lobbies FOR SELECT USING (true);
CREATE POLICY "Allow public insert on lobbies" ON public.golf_live_lobbies FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on lobbies" ON public.golf_live_lobbies FOR UPDATE USING (true);
