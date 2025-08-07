-- Remover o trigger duplicado que está causando o erro
DROP TRIGGER IF EXISTS on_auth_user_roles_created ON auth.users;

-- Também vamos atualizar a função handle_admin_user para incluir admin@pulserun.app
CREATE OR REPLACE FUNCTION public.handle_admin_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Se o email for danoptus@gmail.com ou admin@pulserun.app, atribuir papel de admin
  IF NEW.email = 'danoptus@gmail.com' OR NEW.email = 'admin@pulserun.app' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- Usuários normais recebem papel de user
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;