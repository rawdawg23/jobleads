-- Manual Admin Upgrade Script
-- Upgrades joshuahodson64@gmail.com to admin role with all rights

-- Update user role to admin
UPDATE users 
SET 
  role = 'admin',
  updated_at = NOW()
WHERE email = 'joshuahodson64@gmail.com';

-- Verify the update
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  created_at,
  updated_at
FROM users 
WHERE email = 'joshuahodson64@gmail.com';

-- If no rows were updated, the user might not exist yet
-- In that case, create the admin user directly
INSERT INTO users (
  id,
  email,
  first_name,
  last_name,
  role,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  'joshuahodson64@gmail.com',
  'Joshua',
  'Hodson',
  'admin',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'joshuahodson64@gmail.com'
);

-- Final verification
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  created_at,
  updated_at
FROM users 
WHERE email = 'joshuahodson64@gmail.com';
