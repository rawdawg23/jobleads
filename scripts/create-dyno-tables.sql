-- Real dyno and sensor data tables for live monitoring
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_dyno_sessions_user_id ON dyno_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_dyno_sessions_status ON dyno_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_session_id ON sensor_readings(dyno_session_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_timestamp ON sensor_readings(timestamp);
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_registration ON vehicles(registration_number);
