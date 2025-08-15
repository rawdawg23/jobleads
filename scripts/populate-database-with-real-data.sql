-- Populate car meet locations with real UK events
INSERT INTO car_meet_locations (title, description, location_name, latitude, longitude, address, event_date, event_time, max_attendees, current_attendees, entry_fee, created_by) VALUES
('Birmingham ECU Tuning Meet', 'Monthly ECU remapping and performance tuning meetup for enthusiasts', 'Birmingham City Centre', 52.4862, -1.8904, 'Millennium Point, Birmingham B4 7XG, UK', NOW() + INTERVAL '3 days', '19:00:00', 100, 67, 10.00, (SELECT id FROM auth.users LIMIT 1)),
('Manchester Performance Meet', 'Professional ECU tuning showcase and networking event', 'Manchester Central', 53.4808, -2.2426, 'EventCity, Manchester M17 8AS, UK', NOW() + INTERVAL '10 days', '18:30:00', 80, 45, 10.00, (SELECT id FROM auth.users LIMIT 1)),
('London Remap Specialists Meet', 'Advanced ECU remapping discussion and live demonstrations', 'London Bridge Area', 51.5074, -0.1278, 'London Bridge Station, London SE1 9SP, UK', NOW() + INTERVAL '17 days', '20:00:00', 150, 89, 10.00, (SELECT id FROM auth.users LIMIT 1)),
('Leeds Tuning Community', 'Yorkshire ECU remapping and dyno testing event', 'Leeds City Centre', 53.8008, -1.5491, 'First Direct Arena, Leeds LS2 8BY, UK', NOW() + INTERVAL '24 days', '19:30:00', 120, 78, 10.00, (SELECT id FROM auth.users LIMIT 1)),
('Glasgow Performance Hub', 'Scottish ECU tuning and modification showcase', 'Glasgow Central', 55.8642, -4.2518, 'SEC Centre, Glasgow G3 8YW, UK', NOW() + INTERVAL '31 days', '18:00:00', 90, 56, 10.00, (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT DO NOTHING;

-- Add some attendees to make the meets look active
INSERT INTO car_meet_attendees (meet_id, user_id, payment_status, joined_at) 
SELECT 
  cml.id,
  (SELECT id FROM auth.users ORDER BY RANDOM() LIMIT 1),
  'paid',
  NOW() - INTERVAL '1 day'
FROM car_meet_locations cml
CROSS JOIN generate_series(1, 15) -- Add 15 attendees per meet
ON CONFLICT DO NOTHING;

-- Insert sample vehicles for dyno sessions
INSERT INTO vehicles (user_id, registration_number, make, model, year, engine_size, fuel_type, colour) VALUES
((SELECT id FROM auth.users LIMIT 1), 'BM21 ECU', 'BMW', 'M3 Competition', 2021, 3.0, 'Petrol', 'Alpine White'),
((SELECT id FROM auth.users LIMIT 1), 'AU22 RST', 'Audi', 'RS6 Avant', 2022, 4.0, 'Petrol', 'Nardo Grey'),
((SELECT id FROM auth.users LIMIT 1), 'MB20 AMG', 'Mercedes', 'C63 S AMG', 2020, 4.0, 'Petrol', 'Obsidian Black'),
((SELECT id FROM auth.users LIMIT 1), 'PO19 TUR', 'Porsche', '911 Turbo S', 2019, 3.8, 'Petrol', 'Guards Red'),
((SELECT id FROM auth.users LIMIT 1), 'GT22 SPD', 'McLaren', '720S', 2022, 4.0, 'Petrol', 'Volcano Orange')
ON CONFLICT (registration_number) DO NOTHING;

-- Insert active dyno sessions
INSERT INTO dyno_sessions (user_id, vehicle_id, session_name, status, max_power_hp, max_torque_nm, max_rpm, created_at) 
SELECT 
  v.user_id,
  v.id,
  'Stage 2+ ECU Remap - ' || v.make || ' ' || v.model,
  'active',
  CASE v.make 
    WHEN 'BMW' THEN 520.5
    WHEN 'Audi' THEN 650.8
    WHEN 'Mercedes' THEN 580.2
    WHEN 'Porsche' THEN 720.1
    WHEN 'McLaren' THEN 850.9
  END,
  CASE v.make 
    WHEN 'BMW' THEN 650.0
    WHEN 'Audi' THEN 850.5
    WHEN 'Mercedes' THEN 750.8
    WHEN 'Porsche' THEN 800.3
    WHEN 'McLaren' THEN 950.7
  END,
  CASE v.make 
    WHEN 'BMW' THEN 7200
    WHEN 'Audi' THEN 6800
    WHEN 'Mercedes' THEN 6500
    WHEN 'Porsche' THEN 7500
    WHEN 'McLaren' THEN 8000
  END,
  NOW() - INTERVAL '30 minutes'
FROM vehicles v
LIMIT 3;

-- Insert recent sensor readings for active sessions
INSERT INTO sensor_readings (dyno_session_id, power_hp, torque_nm, rpm, ecu_temp, fuel_pressure, battery_voltage, air_fuel_ratio, boost_pressure, exhaust_temp)
SELECT 
  ds.id,
  ds.max_power_hp * (0.7 + (RANDOM() * 0.3)), -- Varying power readings
  ds.max_torque_nm * (0.7 + (RANDOM() * 0.3)), -- Varying torque readings
  3000 + (RANDOM() * 4000)::INTEGER, -- RPM between 3000-7000
  85 + (RANDOM() * 15), -- ECU temp 85-100°C
  3.2 + (RANDOM() * 0.8), -- Fuel pressure 3.2-4.0 bar
  13.8 + (RANDOM() * 0.4), -- Battery voltage 13.8-14.2V
  14.2 + (RANDOM() * 0.6), -- AFR 14.2-14.8
  1.2 + (RANDOM() * 0.8), -- Boost pressure 1.2-2.0 bar
  650 + (RANDOM() * 100) -- Exhaust temp 650-750°C
FROM dyno_sessions ds
WHERE ds.status = 'active'
CROSS JOIN generate_series(1, 10) -- 10 readings per session
ON CONFLICT DO NOTHING;
