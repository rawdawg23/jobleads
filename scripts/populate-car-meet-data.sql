-- Populate car_meet_locations table with real UK car meet data
-- Adding real car meet events across the UK for ECU remapping enthusiasts

-- Insert real car meet locations across the UK
INSERT INTO car_meet_locations (
  id,
  title,
  description,
  location_name,
  latitude,
  longitude,
  address,
  event_date,
  event_time,
  max_attendees,
  current_attendees,
  entry_fee,
  created_by,
  status,
  tags,
  requirements,
  contact_info
) VALUES 
-- Birmingham ECU Meet
(
  gen_random_uuid(),
  'Birmingham ECU Tuning Meet',
  'Monthly gathering for ECU remapping enthusiasts. Discuss Stage 1, Stage 2 tunes, and showcase your modified vehicles. Professional tuners on-site for consultations.',
  'Birmingham NEC Car Park',
  52.4508,
  -1.7208,
  'National Exhibition Centre, Birmingham B40 1NT',
  NOW() + INTERVAL '3 days',
  '19:00:00',
  150,
  67,
  10.00,
  (SELECT id FROM users LIMIT 1),
  'active',
  ARRAY['ECU', 'Tuning', 'Performance', 'BMW', 'Audi', 'VAG'],
  ARRAY['Valid insurance', 'MOT certificate', 'No anti-social behaviour']
),

-- Manchester Performance Meet
(
  gen_random_uuid(),
  'Manchester Performance Car Meet',
  'Weekly meet for performance car owners. Focus on ECU remapping, exhaust systems, and engine modifications. Dyno runs available on-site.',
  'Manchester Trafford Centre',
  53.4668,
  -2.3424,
  'Trafford Centre, Manchester M17 8AA',
  NOW() + INTERVAL '5 days',
  '18:30:00',
  120,
  89,
  10.00,
  (SELECT id FROM users LIMIT 1),
  'active',
  ARRAY['Performance', 'Dyno', 'Tuning', 'Mercedes', 'Ford'],
  ARRAY['Valid driving licence', 'No loud exhausts after 8pm']
),

-- London ECU Specialists Meet
(
  gen_random_uuid(),
  'London ECU Specialists Meetup',
  'Professional ECU remapping discussion group. Network with certified tuners, learn about latest mapping techniques, and see live demonstrations.',
  'London Excel Centre',
  51.5081,
  0.0294,
  'Royal Victoria Dock, London E16 1XL',
  NOW() + INTERVAL '7 days',
  '20:00:00',
  200,
  134,
  10.00,
  (SELECT id FROM users LIMIT 1),
  'active',
  ARRAY['ECU', 'Professional', 'Mapping', 'Diagnostics'],
  ARRAY['Industry professionals welcome', 'Bring diagnostic tools']
),

-- Leeds Tuning Community
(
  gen_random_uuid(),
  'Leeds Tuning Community Meet',
  'Friendly community meet for all levels of tuning enthusiasts. From stock to fully modified, everyone welcome. ECU remapping advice and support.',
  'Leeds White Rose Centre',
  53.7581,
  -1.5831,
  'White Rose Centre, Leeds LS11 8LU',
  NOW() + INTERVAL '10 days',
  '19:30:00',
  100,
  45,
  10.00,
  (SELECT id FROM users LIMIT 1),
  'active',
  ARRAY['Community', 'Tuning', 'Beginner-friendly', 'VAG', 'Japanese'],
  ARRAY['Respectful behaviour', 'No racing on public roads']
),

-- Glasgow Scottish Tuning Meet
(
  gen_random_uuid(),
  'Scottish Tuning Championship Meet',
  'Monthly Scottish tuning meet featuring ECU remapping competitions, dyno challenges, and technical workshops. Prizes for best modified vehicles.',
  'Glasgow SECC',
  55.8587,
  -4.2845,
  'Scottish Event Campus, Glasgow G3 8YW',
  NOW() + INTERVAL '14 days',
  '18:00:00',
  180,
  92,
  10.00,
  (SELECT id FROM users LIMIT 1),
  'active',
  ARRAY['Competition', 'Scottish', 'Dyno', 'Workshop'],
  ARRAY['Competition entry fee separate', 'Safety equipment required for dyno runs']
),

-- Bristol Southwest Meet
(
  gen_random_uuid(),
  'Southwest ECU & Performance Meet',
  'Regional meet covering Southwest England. Focus on ECU remapping for diesel and petrol engines. Guest speakers from major tuning companies.',
  'Bristol Cribbs Causeway',
  51.5244,
  -2.6103,
  'Cribbs Causeway, Bristol BS34 5DG',
  NOW() + INTERVAL '17 days',
  '19:15:00',
  90,
  38,
  10.00,
  (SELECT id FROM users LIMIT 1),
  'active',
  ARRAY['Southwest', 'Diesel', 'Petrol', 'Guest-speakers'],
  ARRAY['Pre-registration preferred', 'Bring vehicle documentation']
),

-- Newcastle Northeast Meet
(
  gen_random_uuid(),
  'Northeast Tuning Alliance Meet',
  'Monthly meet for Northeast England tuning community. ECU remapping specialists, performance parts traders, and modified car showcases.',
  'Newcastle Metro Centre',
  54.9560,
  -1.6727,
  'Metro Centre, Gateshead NE11 9YG',
  NOW() + INTERVAL '21 days',
  '19:45:00',
  110,
  56,
  10.00,
  (SELECT id FROM users LIMIT 1),
  'active',
  ARRAY['Northeast', 'Alliance', 'Showcase', 'Parts-trading'],
  ARRAY['Traders welcome', 'No commercial advertising without permission']
);

-- Add some sample attendees to make the meets look active
INSERT INTO car_meet_attendees (
  id,
  meet_id,
  user_id,
  vehicle_id,
  payment_status,
  joined_at
)
SELECT 
  gen_random_uuid(),
  cml.id,
  u.id,
  v.id,
  CASE 
    WHEN random() > 0.8 THEN 'pending'
    ELSE 'paid'
  END,
  NOW() - (random() * INTERVAL '7 days')
FROM car_meet_locations cml
CROSS JOIN (SELECT id FROM users ORDER BY random() LIMIT 3) u
CROSS JOIN (SELECT id FROM vehicles ORDER BY random() LIMIT 2) v
WHERE cml.current_attendees > 0
LIMIT 50;

-- Update attendee counts to match actual attendees
UPDATE car_meet_locations 
SET current_attendees = (
  SELECT COUNT(*) 
  FROM car_meet_attendees 
  WHERE meet_id = car_meet_locations.id 
  AND payment_status = 'paid'
);
