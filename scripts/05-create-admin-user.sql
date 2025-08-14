-- Create admin user with confirmed email
-- This script creates an admin user with email ogstorage25@gmail.com

-- First, we need to insert into auth.users (Supabase's auth table)
-- Note: In a real environment, you would do this through Supabase dashboard or API
-- This is a template for the admin user setup

-- Insert admin user profile into our users table
INSERT INTO users (
  id,
  email,
  first_name,
  last_name,
  role,
  phone,
  address,
  postcode,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'ogstorage25@gmail.com',
  'System',
  'Administrator',
  'admin',
  '+44 1234 567890',
  'Admin Office',
  'SW1A 1AA',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  first_name = 'System',
  last_name = 'Administrator',
  updated_at = NOW();

-- Grant admin permissions
UPDATE users 
SET role = 'admin' 
WHERE email = 'ogstorage25@gmail.com';
