-- Created utility functions for the new features

-- Function to get nearby car meets
CREATE OR REPLACE FUNCTION get_nearby_car_meets(
    user_lat DECIMAL(10, 8),
    user_lng DECIMAL(11, 8),
    radius_km INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    description TEXT,
    location_name VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    event_date TIMESTAMP WITH TIME ZONE,
    event_time TIME,
    max_attendees INTEGER,
    current_attendees INTEGER,
    entry_fee DECIMAL(10, 2),
    distance_km DECIMAL(10, 2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cml.id,
        cml.title,
        cml.description,
        cml.location_name,
        cml.latitude,
        cml.longitude,
        cml.address,
        cml.event_date,
        cml.event_time,
        cml.max_attendees,
        cml.current_attendees,
        cml.entry_fee,
        ROUND(
            ST_Distance(
                ST_Point(user_lng, user_lat)::geography,
                ST_Point(cml.longitude, cml.latitude)::geography
            ) / 1000, 2
        ) as distance_km
    FROM car_meet_locations cml
    WHERE 
        cml.status = 'active'
        AND cml.event_date >= NOW()
        AND ST_DWithin(
            ST_Point(user_lng, user_lat)::geography,
            ST_Point(cml.longitude, cml.latitude)::geography,
            radius_km * 1000
        )
    ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to check user subscription status
CREATE OR REPLACE FUNCTION check_user_subscription(user_uuid UUID)
RETURNS TABLE (
    has_active_subscription BOOLEAN,
    subscription_type subscription_type,
    expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE WHEN us.id IS NOT NULL THEN TRUE ELSE FALSE END as has_active_subscription,
        COALESCE(us.subscription_type, 'basic'::subscription_type) as subscription_type,
        us.expires_at
    FROM users u
    LEFT JOIN user_subscriptions us ON u.id = us.user_id 
        AND us.status = 'active' 
        AND us.expires_at > NOW()
    WHERE u.id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to update car meet attendance
CREATE OR REPLACE FUNCTION update_car_meet_attendance(
    meet_id UUID,
    increment_by INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    max_count INTEGER;
BEGIN
    SELECT current_attendees, max_attendees 
    INTO current_count, max_count
    FROM car_meet_locations 
    WHERE id = meet_id AND status = 'active';
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    IF current_count + increment_by > max_count THEN
        RETURN FALSE;
    END IF;
    
    UPDATE car_meet_locations 
    SET 
        current_attendees = current_attendees + increment_by,
        updated_at = NOW()
    WHERE id = meet_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
