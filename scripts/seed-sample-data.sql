-- Added sample data for testing the new features

-- Insert sample ECU brands and models
INSERT INTO ecu_brands (name) VALUES 
('Bosch'), ('Continental'), ('Delphi'), ('Siemens'), ('Magneti Marelli');

-- Insert sample car meet locations
INSERT INTO car_meet_locations (
    title, description, location_name, latitude, longitude, address, 
    event_date, event_time, max_attendees, current_attendees, entry_fee, 
    created_by, tags
) VALUES 
(
    'London ECU Tuning Meet',
    'Monthly gathering for ECU enthusiasts. Bring your tuned cars and share experiences!',
    'Hyde Park Corner',
    51.5028, -0.1547,
    'Hyde Park Corner, London W1J 7NT',
    '2024-02-15 19:00:00+00',
    '19:00:00',
    50, 23, 0.00,
    (SELECT id FROM users WHERE role = 'customer' LIMIT 1),
    ARRAY['ECU', 'Tuning', 'Performance']
),
(
    'Birmingham Dyno Day',
    'Professional dyno testing available. Book your slot and see your car''s true potential!',
    'Birmingham Automotive Centre',
    52.4862, -1.8904,
    '123 Industrial Estate, Birmingham B12 0AA',
    '2024-02-18 10:00:00+00',
    '10:00:00',
    30, 18, 25.00,
    (SELECT id FROM users WHERE role = 'dealer' LIMIT 1),
    ARRAY['Dyno', 'Testing', 'Performance']
),
(
    'Manchester Stage 2+ Showcase',
    'Show off your Stage 2+ builds. Prizes for best power gains and most creative mods!',
    'Manchester Car Park',
    53.4808, -2.2426,
    'Trafford Centre, Manchester M17 8AA',
    '2024-02-20 18:30:00+00',
    '18:30:00',
    75, 42, 10.00,
    (SELECT id FROM users WHERE role = 'customer' LIMIT 1),
    ARRAY['Stage2', 'Showcase', 'Competition']
);

-- Insert sample user subscriptions
INSERT INTO user_subscriptions (
    user_id, subscription_type, status, expires_at
) VALUES 
(
    (SELECT id FROM users WHERE role = 'customer' LIMIT 1),
    'premium',
    'active',
    NOW() + INTERVAL '1 month'
),
(
    (SELECT id FROM users WHERE role = 'dealer' LIMIT 1),
    'professional',
    'active',
    NOW() + INTERVAL '1 month'
);

-- Insert sample payments for subscriptions
INSERT INTO payments (
    user_id, amount, currency, payment_type, status, stripe_payment_intent_id
) VALUES 
(
    (SELECT id FROM users WHERE role = 'customer' LIMIT 1),
    10.00, 'GBP', 'platform_access', 'completed', 'pi_sample_premium_123'
),
(
    (SELECT id FROM users WHERE role = 'dealer' LIMIT 1),
    25.00, 'GBP', 'premium_features', 'completed', 'pi_sample_professional_456'
);
