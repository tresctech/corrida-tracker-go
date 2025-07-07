-- Atualizar a função para reconhecer o usuário danoptus@gmail.com como admin
CREATE OR REPLACE FUNCTION public.handle_admin_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o email for danoptus@gmail.com, atribuir papel de admin
  IF NEW.email = 'danoptus@gmail.com' THEN
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

-- Inserir o papel de admin para o usuário danoptus já existente
INSERT INTO public.user_roles (user_id, role)
VALUES ('9b196117-6748-478e-8ee0-b1a943fd7619', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;