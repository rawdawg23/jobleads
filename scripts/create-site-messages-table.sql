-- Create site_messages table for admin messaging system
CREATE TABLE IF NOT EXISTS site_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_active BOOLEAN DEFAULT true,
  dismissible BOOLEAN DEFAULT true,
  target_audience VARCHAR(20) DEFAULT 'all' CHECK (target_audience IN ('all', 'customers', 'dealers')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_site_messages_active ON site_messages(is_active);
CREATE INDEX IF NOT EXISTS idx_site_messages_target ON site_messages(target_audience);
CREATE INDEX IF NOT EXISTS idx_site_messages_created_at ON site_messages(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE site_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for site_messages
CREATE POLICY "Admins can manage all site messages" ON site_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'Admin'
    )
  );

-- Allow all authenticated users to read active messages
CREATE POLICY "Users can read active site messages" ON site_messages
  FOR SELECT USING (is_active = true);
