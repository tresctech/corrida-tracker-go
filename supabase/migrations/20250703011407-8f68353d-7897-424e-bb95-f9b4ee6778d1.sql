
-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Criar tabela de corridas vinculada aos usuários
CREATE TABLE public.races (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'completed', 'interest')),
  race_date DATE NOT NULL,
  start_time TIME NOT NULL,
  distance DECIMAL(6,2) NOT NULL,
  kit_pickup_address TEXT NOT NULL,
  kit_pickup_dates JSONB,
  registration_proof JSONB,
  observations TEXT,
  race_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Habilitar Row Level Security nas tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.races ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela profiles
CREATE POLICY "Usuários podem ver seu próprio perfil" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Políticas para a tabela races
CREATE POLICY "Usuários podem ver suas próprias corridas" 
  ON public.races 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias corridas" 
  ON public.races 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias corridas" 
  ON public.races 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias corridas" 
  ON public.races 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
