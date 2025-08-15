-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create enum types
CREATE TYPE user_role AS ENUM ('customer', 'dealer', 'admin');
CREATE TYPE job_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE dealer_status AS ENUM ('pending', 'active', 'suspended', 'cancelled');
CREATE TYPE car_meet_status AS ENUM ('active', 'cancelled', 'completed');
CREATE TYPE subscription_type AS ENUM ('basic', 'premium', 'professional');
CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'cancelled');

-- Users table (profiles for Supabase auth users)
CREATE TABLE users (
    id UUID PRIMARY KEY, -- This will match auth.users.id from Supabase
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    postcode VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dealers table (additional dealer-specific information)
CREATE TABLE dealers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    business_address TEXT NOT NULL,
    business_postcode VARCHAR(10) NOT NULL,
    business_latitude DECIMAL(10, 8),
    business_longitude DECIMAL(11, 8),
    vat_number VARCHAR(50),
    insurance_details TEXT,
    certifications TEXT[],
    status dealer_status DEFAULT 'pending',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    radius_miles INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supported ECU brands and models
CREATE TABLE ecu_brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ecu_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES ecu_brands(id) ON DELETE CASCADE,
    model VARCHAR(100) NOT NULL,
    year_from INTEGER,
    year_to INTEGER,
    engine_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supported tools
CREATE TABLE tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dealer tools (what tools each dealer has)
CREATE TABLE dealer_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
    tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(dealer_id, tool_id)
);

-- Jobs table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    dealer_id UUID REFERENCES dealers(id) ON DELETE SET NULL,
    
    -- Car details
    registration VARCHAR(20) NOT NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    engine_size VARCHAR(20),
    fuel_type VARCHAR(50),
    
    -- ECU details
    ecu_brand_id UUID REFERENCES ecu_brands(id),
    ecu_model_id UUID REFERENCES ecu_models(id),
    current_software_version VARCHAR(100),
    
    -- Job details
    service_type VARCHAR(100) NOT NULL, -- 'remap', 'dpf_delete', 'egr_delete', etc.
    description TEXT,
    required_tools UUID[], -- Array of tool IDs
    
    -- Location
    customer_postcode VARCHAR(10) NOT NULL,
    customer_latitude DECIMAL(10, 8),
    customer_longitude DECIMAL(11, 8),
    
    -- Pricing and status
    customer_price DECIMAL(10, 2) DEFAULT 5.00, -- £5 job posting fee
    dealer_quote DECIMAL(10, 2),
    status job_status DEFAULT 'pending',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job applications (dealers applying for jobs)
CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
    quote DECIMAL(10, 2) NOT NULL,
    estimated_duration INTEGER, -- in minutes
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, dealer_id)
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',
    payment_type VARCHAR(50) NOT NULL, -- 'job_posting', 'dealer_subscription', 'platform_access', 'premium_features', 'event_entry'
    reference_id UUID, -- job_id or dealer_id
    status payment_status DEFAULT 'pending',
    bank_transfer_reference VARCHAR(100),
    admin_notes TEXT,
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table (customer-dealer communication)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dealer tracking updates
CREATE TABLE tracking_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL, -- 'setting_off', 'in_traffic', 'arrived', 'working', 'completed'
    message TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Car meet locations table for the new car meet system
CREATE TABLE car_meet_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    status car_meet_status DEFAULT 'active',
    tags TEXT[] DEFAULT '{}',
    image_url TEXT,
    contact_info JSONB DEFAULT '{}',
    requirements TEXT[] DEFAULT '{}'
);

-- User subscriptions table for premium access management
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_type subscription_type NOT NULL DEFAULT 'basic',
    status subscription_status NOT NULL DEFAULT 'active',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    payment_id UUID REFERENCES payments(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_dealers_status ON dealers(status);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX idx_jobs_dealer_id ON jobs(dealer_id);
CREATE INDEX idx_messages_job_id ON messages(job_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_payment_intent ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_payment_type ON payments(payment_type);
CREATE INDEX idx_car_meet_locations_coordinates ON car_meet_locations USING GIST(ST_Point(longitude, latitude));
CREATE INDEX idx_car_meet_locations_event_date ON car_meet_locations(event_date);
CREATE INDEX idx_car_meet_locations_status ON car_meet_locations(status);
CREATE INDEX idx_car_meet_locations_created_by ON car_meet_locations(created_by);
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_expires_at ON user_subscriptions(expires_at);

-- Create spatial indexes for location-based queries
CREATE INDEX idx_users_location ON users USING GIST(ST_Point(longitude, latitude));
CREATE INDEX idx_dealers_location ON dealers USING GIST(ST_Point(business_longitude, business_latitude));
CREATE INDEX idx_jobs_location ON jobs USING GIST(ST_Point(customer_longitude, customer_latitude));

-- Added unique constraint to prevent duplicate active subscriptions
CREATE UNIQUE INDEX idx_user_subscriptions_unique_active 
ON user_subscriptions(user_id) 
WHERE status = 'active';

-- Additional updates can be added here if necessary
