-- Create ECU remapping platform tables
-- This script creates all necessary tables for the ECU remapping platform

-- Vehicles table for storing car information
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  registration_number TEXT UNIQUE NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  engine_size DECIMAL(4,1),
  fuel_type TEXT,
  colour TEXT,
  dvla_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dyno sessions table for performance testing
CREATE TABLE IF NOT EXISTS dyno_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  session_name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  max_power_hp DECIMAL(8,2),
  max_torque_nm DECIMAL(8,2),
  max_rpm INTEGER,
  session_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Sensor readings for live dyno data
CREATE TABLE IF NOT EXISTS sensor_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dyno_session_id UUID REFERENCES dyno_sessions(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  power_hp DECIMAL(8,2),
  torque_nm DECIMAL(8,2),
  rpm INTEGER,
  ecu_temp DECIMAL(5,2),
  fuel_pressure DECIMAL(5,2),
  battery_voltage DECIMAL(4,2),
  air_fuel_ratio DECIMAL(4,2),
  boost_pressure DECIMAL(5,2),
  exhaust_temp DECIMAL(6,2)
);

-- Car meet locations table
CREATE TABLE IF NOT EXISTS car_meet_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location_name VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  event_time TIME NOT NULL,
  max_attendees INTEGER DEFAULT 50,
  current_attendees INTEGER DEFAULT 0,
  entry_fee DECIMAL(10, 2) DEFAULT 10.00,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  contact_info JSONB DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}'
);

-- Car meet attendees table
CREATE TABLE IF NOT EXISTS car_meet_attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meet_id UUID REFERENCES car_meet_locations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  UNIQUE(meet_id, user_id)
);

-- Payments table for car meet subscriptions
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'GBP',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  stripe_payment_intent_id TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_registration ON vehicles(registration_number);
CREATE INDEX IF NOT EXISTS idx_dyno_sessions_user_id ON dyno_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_dyno_sessions_status ON dyno_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_session_id ON sensor_readings(dyno_session_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_timestamp ON sensor_readings(timestamp);
CREATE INDEX IF NOT EXISTS idx_car_meet_locations_event_date ON car_meet_locations(event_date);
CREATE INDEX IF NOT EXISTS idx_car_meet_locations_status ON car_meet_locations(status);
CREATE INDEX IF NOT EXISTS idx_car_meet_locations_created_by ON car_meet_locations(created_by);
CREATE INDEX IF NOT EXISTS idx_car_meet_attendees_meet_id ON car_meet_attendees(meet_id);
CREATE INDEX IF NOT EXISTS idx_car_meet_attendees_user_id ON car_meet_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Insert sample data for testing
-- Insert sample vehicles
INSERT INTO vehicles (user_id, registration_number, make, model, year, engine_size, fuel_type, colour) VALUES
((SELECT id FROM users LIMIT 1), 'AB12 CDE', 'BMW', 'M3', 2020, 3.0, 'Petrol', 'Black'),
((SELECT id FROM users LIMIT 1), 'FG34 HIJ', 'Audi', 'RS4', 2021, 2.9, 'Petrol', 'White'),
((SELECT id FROM users LIMIT 1), 'KL56 MNO', 'Mercedes', 'C63 AMG', 2019, 4.0, 'Petrol', 'Silver')
ON CONFLICT (registration_number) DO NOTHING;

-- Insert sample dyno sessions
INSERT INTO dyno_sessions (user_id, vehicle_id, session_name, status, max_power_hp, max_torque_nm, max_rpm) 
SELECT 
  (SELECT id FROM users LIMIT 1),
  v.id,
  'Stage 2 Tune - ' || v.make || ' ' || v.model,
  'completed',
  CASE v.make 
    WHEN 'BMW' THEN 450.5
    WHEN 'Audi' THEN 420.8
    WHEN 'Mercedes' THEN 510.2
  END,
  CASE v.make 
    WHEN 'BMW' THEN 550.0
    WHEN 'Audi' THEN 580.5
    WHEN 'Mercedes' THEN 650.8
  END,
  CASE v.make 
    WHEN 'BMW' THEN 7200
    WHEN 'Audi' THEN 6800
    WHEN 'Mercedes' THEN 6500
  END
FROM vehicles v
LIMIT 3;

-- Insert sample car meet locations
INSERT INTO car_meet_locations (title, description, location_name, latitude, longitude, address, event_date, event_time, max_attendees, current_attendees, entry_fee, created_by) VALUES
('Birmingham Car Meet', 'Monthly ECU tuning enthusiasts meetup with secure access', 'Birmingham City Centre', 52.4862, -1.8904, 'Birmingham, UK', NOW() + INTERVAL '7 days', '19:00:00', 100, 45, 10.00, (SELECT id FROM users LIMIT 1)),
('Manchester Tuning Meet', 'Performance car showcase and networking event', 'Manchester Central', 53.4808, -2.2426, 'Manchester, UK', NOW() + INTERVAL '14 days', '18:30:00', 80, 32, 10.00, (SELECT id FROM users LIMIT 1)),
('London ECU Meet', 'Professional tuning discussion and live demos', 'London Bridge Area', 51.5074, -0.1278, 'London, UK', NOW() + INTERVAL '21 days', '20:00:00', 150, 78, 10.00, (SELECT id FROM users LIMIT 1));

-- Insert sample sensor readings for live dyno data
INSERT INTO sensor_readings (dyno_session_id, power_hp, torque_nm, rpm, ecu_temp, fuel_pressure, battery_voltage, air_fuel_ratio, boost_pressure, exhaust_temp)
SELECT 
  ds.id,
  RANDOM() * 500 + 200, -- Power between 200-700 HP
  RANDOM() * 600 + 300, -- Torque between 300-900 Nm
  (RANDOM() * 3000 + 3000)::INTEGER, -- RPM between 3000-6000
  RANDOM() * 50 + 80, -- ECU temp between 80-130°C
  RANDOM() * 2 + 3, -- Fuel pressure between 3-5 bar
  RANDOM() * 2 + 12, -- Battery voltage between 12-14V
  RANDOM() * 3 + 12, -- Air/fuel ratio between 12-15
  RANDOM() * 1.5 + 0.5, -- Boost pressure between 0.5-2 bar
  RANDOM() * 200 + 400 -- Exhaust temp between 400-600°C
FROM dyno_sessions ds
CROSS JOIN generate_series(1, 10); -- 10 readings per session
