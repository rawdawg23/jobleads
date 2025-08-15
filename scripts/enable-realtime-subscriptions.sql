-- Enable real-time subscriptions for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE companies;
ALTER PUBLICATION supabase_realtime ADD TABLE applications;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE vehicles;
ALTER PUBLICATION supabase_realtime ADD TABLE dyno_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE sensor_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE car_meet_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE car_meet_attendees;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
ALTER PUBLICATION supabase_realtime ADD TABLE remapping_services;
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE dealer_certifications;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Create function to automatically create notifications for important events
CREATE OR REPLACE FUNCTION create_notification(
  user_id UUID,
  title TEXT,
  message TEXT,
  notification_type TEXT DEFAULT 'info',
  action_url TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, title, message, type, action_url)
  VALUES (user_id, title, message, notification_type, action_url)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic notifications
CREATE OR REPLACE FUNCTION notify_new_job_application() RETURNS TRIGGER AS $$
BEGIN
  -- Notify job poster about new application
  PERFORM create_notification(
    (SELECT u.id FROM users u JOIN jobs j ON j.company_id = (SELECT c.id FROM companies c WHERE c.created_by = u.id) WHERE j.id = NEW.job_id),
    'New Job Application',
    'Someone applied for your job posting',
    'application',
    '/customer/dashboard?tab=jobs'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_notify_new_job_application
  AFTER INSERT ON applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_job_application();

-- Trigger for new booking notifications
CREATE OR REPLACE FUNCTION notify_new_booking() RETURNS TRIGGER AS $$
BEGIN
  -- Notify dealer about new booking
  PERFORM create_notification(
    NEW.dealer_id,
    'New Service Booking',
    'You have a new ECU remapping booking',
    'booking',
    '/dealer/dashboard?tab=bookings'
  );
  
  -- Notify customer about booking confirmation
  PERFORM create_notification(
    NEW.customer_id,
    'Booking Confirmed',
    'Your ECU remapping service has been booked',
    'booking',
    '/customer/dashboard?tab=bookings'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_notify_new_booking
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_booking();

-- Trigger for dyno session completion
CREATE OR REPLACE FUNCTION notify_dyno_completion() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    PERFORM create_notification(
      NEW.user_id,
      'Dyno Session Complete',
      'Your ECU remapping dyno session has been completed',
      'dyno',
      '/customer/dashboard'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_notify_dyno_completion
  AFTER UPDATE ON dyno_sessions
  FOR EACH ROW
  EXECUTE FUNCTION notify_dyno_completion();

-- Insert sample notifications for testing
INSERT INTO notifications (user_id, title, message, type, action_url)
SELECT 
  u.id,
  'Welcome to CTEK ECU Platform',
  'Your account has been successfully created. Start exploring ECU remapping services.',
  'welcome',
  '/dashboard'
FROM users u
WHERE u.role = 'customer'
LIMIT 5
ON CONFLICT DO NOTHING;

INSERT INTO notifications (user_id, title, message, type, action_url)
SELECT 
  u.id,
  'Dealer Application Approved',
  'Congratulations! Your dealer application has been approved. You can now offer ECU remapping services.',
  'approval',
  '/dealer/dashboard'
FROM users u
WHERE u.role = 'dealer'
LIMIT 3
ON CONFLICT DO NOTHING;
