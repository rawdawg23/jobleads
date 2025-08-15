-- Manual Admin User Creation Script
-- Run this directly in the Supabase SQL Editor

-- First, create the auth user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@ctek.com',
  crypt('admin123', gen_salt('bf')), -- Password: admin123
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Then create the public user record
INSERT INTO public.users (
  id,
  email,
  first_name,
  last_name,
  role,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@ctek.com'),
  'admin@ctek.com',
  'Admin',
  'User',
  'admin',
  NOW(),
  NOW()
);

-- Verify the user was created
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  pu.role,
  pu.first_name,
  pu.last_name
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE au.email = 'admin@ctek.com';
