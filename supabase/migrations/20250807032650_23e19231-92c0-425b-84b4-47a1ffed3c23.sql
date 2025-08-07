-- Liberar acesso premium para danoptus@gmail.com
INSERT INTO public.subscribers (
  user_id,
  email,
  stripe_customer_id,
  subscribed,
  subscription_tier,
  subscription_end,
  updated_at,
  created_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'danoptus@gmail.com'),
  'danoptus@gmail.com',
  'admin_access',
  true,
  'Premium',
  '2025-12-31T23:59:59.000Z',
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  subscribed = true,
  subscription_tier = 'Premium',
  subscription_end = '2025-12-31T23:59:59.000Z',
  updated_at = now();