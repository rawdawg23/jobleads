-- Create messages table for real-time messaging between dealers and customers
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations table to group messages
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant_1_id, participant_2_id, job_id),
  UNIQUE(participant_1_id, participant_2_id, booking_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_job_id ON messages(job_id);
CREATE INDEX IF NOT EXISTS idx_messages_booking_id ON messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_job_id ON conversations(job_id);
CREATE INDEX IF NOT EXISTS idx_conversations_booking_id ON conversations(booking_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at);

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Insert sample conversations and messages
INSERT INTO conversations (participant_1_id, participant_2_id, job_id) 
SELECT 
  u1.id,
  u2.id,
  j.id
FROM users u1
CROSS JOIN users u2
CROSS JOIN jobs j
WHERE u1.role = 'customer' 
  AND u2.role = 'dealer'
  AND u1.id != u2.id
LIMIT 5
ON CONFLICT DO NOTHING;

-- Insert sample messages
INSERT INTO messages (sender_id, recipient_id, job_id, content, message_type)
SELECT 
  c.participant_1_id,
  c.participant_2_id,
  c.job_id,
  'Hi, I''m interested in your ECU remapping services. Could you provide more details about the process?',
  'text'
FROM conversations c
LIMIT 3
ON CONFLICT DO NOTHING;

INSERT INTO messages (sender_id, recipient_id, job_id, content, message_type)
SELECT 
  c.participant_2_id,
  c.participant_1_id,
  c.job_id,
  'Hello! I''d be happy to help. Our ECU remapping service includes performance optimization, fuel efficiency improvements, and diagnostic checks. What type of vehicle do you have?',
  'text'
FROM conversations c
LIMIT 3
ON CONFLICT DO NOTHING;
