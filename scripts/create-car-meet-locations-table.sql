-- Create car meet locations table for the new location system
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
  entry_fee DECIMAL(10, 2) DEFAULT 0.00,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  contact_info JSONB DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}'
);

-- Create index for location-based queries
CREATE INDEX IF NOT EXISTS idx_car_meet_locations_coordinates ON car_meet_locations USING GIST (
  ll_to_earth(latitude, longitude)
);

-- Create index for date-based queries
CREATE INDEX IF NOT EXISTS idx_car_meet_locations_event_date ON car_meet_locations(event_date);

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_car_meet_locations_status ON car_meet_locations(status);

-- Create index for created_by queries
CREATE INDEX IF NOT EXISTS idx_car_meet_locations_created_by ON car_meet_locations(created_by);
