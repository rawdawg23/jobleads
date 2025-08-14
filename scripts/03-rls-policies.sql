-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_updates ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Dealers can see their own dealer info
CREATE POLICY "Dealers can view own info" ON dealers
    FOR ALL USING (user_id = auth.uid());

-- Jobs visibility policies
CREATE POLICY "Customers can view own jobs" ON jobs
    FOR ALL USING (customer_id = auth.uid());

CREATE POLICY "Dealers can view jobs in their area" ON jobs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM dealers d 
            WHERE d.user_id = auth.uid() 
            AND d.status = 'active'
            AND ST_DWithin(
                ST_Point(jobs.customer_longitude, jobs.customer_latitude)::geography,
                ST_Point(d.business_longitude, d.business_latitude)::geography,
                d.radius_miles * 1609.34
            )
        )
    );

-- Job applications policies
CREATE POLICY "Dealers can manage own applications" ON job_applications
    FOR ALL USING (
        dealer_id IN (SELECT id FROM dealers WHERE user_id = auth.uid())
    );

-- Messages policies
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Admin policies (admins can see everything)
CREATE POLICY "Admins can view all users" ON users
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can view all dealers" ON dealers
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can view all jobs" ON jobs
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can view all payments" ON payments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );
