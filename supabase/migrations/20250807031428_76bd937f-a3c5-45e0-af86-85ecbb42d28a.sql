-- Criar tabela de assinantes para controlar planos pagos
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela subscribers
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Políticas para subscribers
CREATE POLICY "select_own_subscription" ON public.subscribers
FOR SELECT
USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "update_own_subscription" ON public.subscribers
FOR UPDATE
USING (true);

CREATE POLICY "insert_subscription" ON public.subscribers
FOR INSERT
WITH CHECK (true);

-- Criar tabela para treinos personalizados
CREATE TABLE public.personal_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_email TEXT NOT NULL,
  student_name TEXT NOT NULL,
  workout_name TEXT NOT NULL,
  workout_plan JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela personal_workouts
ALTER TABLE public.personal_workouts ENABLE ROW LEVEL SECURITY;

-- Políticas para personal_workouts (apenas usuários premium podem criar/ver)
CREATE POLICY "trainers_can_manage_workouts" ON public.personal_workouts
FOR ALL
USING (
  trainer_id = auth.uid() AND 
  EXISTS (
    SELECT 1 FROM public.subscribers 
    WHERE user_id = auth.uid() AND subscribed = true
  )
);

-- Função para verificar se usuário tem assinatura ativa
CREATE OR REPLACE FUNCTION public.has_active_subscription()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscribers
    WHERE user_id = auth.uid()
      AND subscribed = true
      AND (subscription_end IS NULL OR subscription_end > now())
  )
$$;