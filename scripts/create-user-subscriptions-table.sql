-- Create user subscriptions table for access control
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_type VARCHAR(50) NOT NULL CHECK (subscription_type IN ('basic', 'premium', 'professional')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'expired', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  payment_id UUID REFERENCES payments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires_at ON user_subscriptions(expires_at);

-- Create unique constraint to prevent duplicate active subscriptions
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_unique_active 
ON user_subscriptions(user_id) 
WHERE status = 'active';
