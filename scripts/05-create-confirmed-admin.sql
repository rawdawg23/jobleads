-- Create admin user with confirmed email
-- This bypasses Supabase's email confirmation requirement for admin setup

-- First, insert into auth.users (Supabase's auth table) with confirmed email
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  'ogstorage25@gmail.com',
  crypt('admin123', gen_salt('bf')), -- Password: admin123
  NOW(), -- Email confirmed immediately
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO UPDATE SET
  email_confirmed_at = NOW(),
  updated_at = NOW();

-- Then insert into our users table
INSERT INTO users (
  id,
  email,
  full_name,
  role,
  phone,
  address,
  postcode,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'ogstorage25@gmail.com'),
  'ogstorage25@gmail.com',
  'Admin User',
  'admin',
  '+44 7000 000000',
  'Admin Office',
  'SW1A 1AA',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  updated_at = NOW();
