-- Criar enum para papéis de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Criar tabela de papéis de usuário
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função de segurança para verificar papéis (evita recursão no RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função para verificar se o usuário atual é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Políticas para user_roles - apenas admins podem gerenciar
CREATE POLICY "Admins podem ver todos os papéis" 
  ON public.user_roles 
  FOR SELECT 
  USING (public.is_admin());

CREATE POLICY "Admins podem criar papéis" 
  ON public.user_roles 
  FOR INSERT 
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins podem atualizar papéis" 
  ON public.user_roles 
  FOR UPDATE 
  USING (public.is_admin());

CREATE POLICY "Admins podem deletar papéis" 
  ON public.user_roles 
  FOR DELETE 
  USING (public.is_admin());

-- Atualizar políticas das tabelas existentes para incluir admins

-- Políticas para profiles - admins veem todos
CREATE POLICY "Admins podem ver todos os perfis" 
  ON public.profiles 
  FOR SELECT 
  USING (public.is_admin() OR auth.uid() = id);

CREATE POLICY "Admins podem atualizar todos os perfis" 
  ON public.profiles 
  FOR UPDATE 
  USING (public.is_admin() OR auth.uid() = id);

-- Políticas para races - admins veem todas
CREATE POLICY "Admins podem ver todas as corridas" 
  ON public.races 
  FOR SELECT 
  USING (public.is_admin() OR auth.uid() = user_id);

CREATE POLICY "Admins podem criar corridas para qualquer usuário" 
  ON public.races 
  FOR INSERT 
  WITH CHECK (public.is_admin() OR auth.uid() = user_id);

CREATE POLICY "Admins podem atualizar todas as corridas" 
  ON public.races 
  FOR UPDATE 
  USING (public.is_admin() OR auth.uid() = user_id);

CREATE POLICY "Admins podem deletar todas as corridas" 
  ON public.races 
  FOR DELETE 
  USING (public.is_admin() OR auth.uid() = user_id);

-- Remover políticas antigas que serão substituídas
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias corridas" ON public.races;
DROP POLICY IF EXISTS "Usuários podem criar suas próprias corridas" ON public.races;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias corridas" ON public.races;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias corridas" ON public.races;

-- Criar o usuário danielperes como admin (será executado quando ele se cadastrar)
-- Esta função será chamada pelo trigger quando um usuário específico se registrar
CREATE OR REPLACE FUNCTION public.handle_admin_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o email for danielperes, atribuir papel de admin
  IF NEW.email = 'danielperes@admin.com' OR NEW.email ILIKE '%danielperes%' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    -- Usuários normais recebem papel de user
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar o trigger existente para incluir atribuição de papéis
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_roles_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_admin_user();