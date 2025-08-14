-- This script should be run after the admin user is created in Supabase Auth
-- The admin user should be created manually in Supabase dashboard or via API

-- Update the admin user profile after Supabase auth user is created
-- Replace 'ADMIN_USER_ID' with the actual UUID from Supabase auth.users table

-- Example admin user setup (run this after creating the auth user):
-- INSERT INTO user_profiles (id, first_name, last_name, role, phone, address, postcode, created_at, updated_at)
-- VALUES (
--   'ADMIN_USER_ID', -- Replace with actual Supabase auth user ID
--   'System',
--   'Administrator', 
--   'admin',
--   '+44 1234 567890',
--   'Admin Office',
--   'SW1A 1AA',
--   NOW(),
--   NOW()
-- );

-- Grant admin permissions
-- UPDATE user_profiles SET role = 'admin' WHERE id = 'ADMIN_USER_ID';
