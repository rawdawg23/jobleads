-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_tracking ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Dealers policies
CREATE POLICY "Dealers can view their own dealer profile" ON dealers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Dealers can update their own profile" ON dealers
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all dealers" ON dealers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Jobs policies
CREATE POLICY "Customers can view their own jobs" ON jobs
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Dealers can view jobs in their area" ON jobs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'dealer'
    )
  );

CREATE POLICY "Customers can create jobs" ON jobs
  FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can update their own jobs" ON jobs
  FOR UPDATE USING (customer_id = auth.uid());

-- Job applications policies
CREATE POLICY "Dealers can view applications for their jobs" ON job_applications
  FOR SELECT USING (dealer_id = auth.uid());

CREATE POLICY "Customers can view applications for their jobs" ON job_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs WHERE id = job_id AND customer_id = auth.uid()
    )
  );

CREATE POLICY "Dealers can create applications" ON job_applications
  FOR INSERT WITH CHECK (dealer_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can view their own messages" ON messages
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Payments policies
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Job tracking policies
CREATE POLICY "Dealers can create tracking updates" ON job_tracking
  FOR INSERT WITH CHECK (dealer_id = auth.uid());

CREATE POLICY "Users can view tracking for their jobs" ON job_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE id = job_id 
      AND (customer_id = auth.uid() OR dealer_id = auth.uid())
    )
  );
