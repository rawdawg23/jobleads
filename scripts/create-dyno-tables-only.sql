-- Create dyno-related tables for ECU remapping platform
-- This script creates the core dyno functionality tables

-- Create vehicles table first (referenced by dyno_sessions)
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

-- Create dyno_sessions table
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

-- Create sensor_readings table for real-time data
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_registration ON vehicles(registration_number);
CREATE INDEX IF NOT EXISTS idx_dyno_sessions_user_id ON dyno_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_dyno_sessions_vehicle_id ON dyno_sessions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_dyno_sessions_status ON dyno_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_session_id ON sensor_readings(dyno_session_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_timestamp ON sensor_readings(timestamp);

-- Insert sample vehicles for testing
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
WHERE NOT EXISTS (SELECT 1 FROM dyno_sessions WHERE vehicle_id = v.id);

-- Insert sample sensor readings for the most recent dyno session
INSERT INTO sensor_readings (dyno_session_id, power_hp, torque_nm, rpm, ecu_temp, fuel_pressure, battery_voltage, air_fuel_ratio, boost_pressure, exhaust_temp)
SELECT 
  ds.id,
  350.0 + (RANDOM() * 100),
  450.0 + (RANDOM() * 150),
  3000 + (RANDOM() * 4000)::INTEGER,
  85.0 + (RANDOM() * 15),
  3.2 + (RANDOM() * 0.8),
  13.8 + (RANDOM() * 0.4),
  14.2 + (RANDOM() * 0.6),
  1.2 + (RANDOM() * 0.8),
  650.0 + (RANDOM() * 100)
FROM dyno_sessions ds
WHERE ds.status = 'completed'
LIMIT 10;
