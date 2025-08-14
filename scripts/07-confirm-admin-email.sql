-- Confirm email for admin user ogstorage25@gmail.com
-- This bypasses email verification for the admin account

-- Update the auth.users table to mark email as confirmed
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  email_confirmed = true,
  updated_at = NOW()
WHERE email = 'ogstorage25@gmail.com';

-- Also ensure the user has admin role in our users table
INSERT INTO users (id, email, role, full_name, phone, address, postcode, created_at, updated_at)
SELECT 
  id,
  email,
  'admin' as role,
  'Admin User' as full_name,
  '+44 1234 567890' as phone,
  'Admin Address' as address,
  'SW1A 1AA' as postcode,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users 
WHERE email = 'ogstorage25@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  updated_at = NOW();

-- Verify the changes
SELECT 
  u.email,
  u.email_confirmed,
  u.email_confirmed_at,
  p.role
FROM auth.users u
LEFT JOIN users p ON u.id = p.id
WHERE u.email = 'ogstorage25@gmail.com';
