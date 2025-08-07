-- Primeiro vamos criar um perfil para o admin caso não exista
-- Este será criado e depois o usuário poderá fazer login com esta conta
DO $$
DECLARE
  admin_user_id uuid := 'b20fff70-239c-4b3b-9fb3-02e5ab78dad9'; -- ID fixo para o admin
BEGIN
  -- Inserir perfil do admin
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (admin_user_id, 'admin@pulserun.app', 'Administrador')
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
    
  -- Garantir que tem papel de admin
  INSERT INTO public.user_roles (user_id, role)
  VALUES (admin_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;