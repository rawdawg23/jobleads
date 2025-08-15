-- Create admin user directly in database
-- Password: EEbony2025 (hashed with bcrypt)

INSERT INTO users (
  id,
  email,
  first_name,
  last_name,
  role,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'ogstorage25@gmail.com',
  'Admin',
  'User', 
  'admin',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  updated_at = NOW();

-- Note: You'll need to create the auth user separately in Supabase Auth dashboard
-- or use the Supabase Auth admin panel to create user with email: ogstorage25@gmail.com
-- and password: EEbony2025
