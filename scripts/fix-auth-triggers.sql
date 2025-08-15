-- Comprehensive fix for auth.users triggers causing "Database error creating new user"
-- This addresses the root cause: triggers without SECURITY DEFINER permissions

-- Step 1: Identify all triggers on auth.users table
SELECT 
  t.trigger_name,
  t.event_manipulation,
  t.action_statement,
  t.action_timing,
  p.proname as function_name,
  p.prosecdef as is_security_definer
FROM information_schema.triggers t
LEFT JOIN pg_proc p ON p.proname = REPLACE(REPLACE(t.action_statement, 'EXECUTE FUNCTION ', ''), '()', '')
WHERE t.event_object_table = 'users' 
  AND t.event_object_schema = 'auth';

-- Step 2: Check for functions that might be used by triggers
SELECT 
  routine_name,
  routine_type,
  security_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_schema IN ('public', 'auth')
  AND routine_type = 'FUNCTION'
  AND routine_name LIKE '%user%';

-- Step 3: Template fix for common trigger patterns
-- IMPORTANT: Replace 'your_trigger_name' and 'your_function_name' with actual names from Step 1

/*
-- Example fix for a typical user creation trigger:

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;

-- Recreate function with SECURITY DEFINER (this is the key fix)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER -- This allows the function to run with creator's privileges
SET search_path = public, auth -- Explicit search path for security
AS $$
BEGIN
  -- Example: Create corresponding record in public.users table
  INSERT INTO public.users (id, email, created_at)
  VALUES (NEW.id, NEW.email, NEW.created_at);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
*/

-- Step 4: Verify the fix worked
-- After running the fixes above, test user creation:
-- This should now work without "Database error creating new user"

-- Step 5: Check if triggers are now working properly
SELECT 
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
  AND event_object_schema = 'auth';

-- If you see triggers listed here, they should now work with SECURITY DEFINER
