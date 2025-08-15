-- Updated admin user credentials to match diagnostic system
-- Create admin user with email admin@ctek.com and password admin123
-- This script will insert the admin user into the users table

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
  'admin@ctek.com',
  'Admin',
  'User',
  'admin',
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  updated_at = now();

-- Note: Password will be handled by the authentication system
-- The password 'admin123' will need to be set through the auth system
