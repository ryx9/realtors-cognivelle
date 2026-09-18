-- Enable UUID and GiST extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ============================================================================
-- 1. AGENTS TABLE
-- Represents real estate agents with their local operational timezone
-- ============================================================================
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    title TEXT DEFAULT 'Licensed Real Estate Specialist',
    bio TEXT,
    avatar_url TEXT,
    timezone TEXT NOT NULL DEFAULT 'America/New_York', -- e.g. America/New_York, Europe/London, Asia/Tokyo
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes on email and active status
CREATE INDEX IF NOT EXISTS idx_agents_email ON agents(email);
CREATE INDEX IF NOT EXISTS idx_agents_is_active ON agents(is_active);

-- ============================================================================
-- 2. LISTINGS TABLE
-- Properties aligned to a specific listing agent
-- ============================================================================
CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(14, 2) NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT,
    property_type TEXT NOT NULL DEFAULT 'Single Family', -- Single Family, Condo, Townhouse, Penthouse, Villa
    bedrooms INTEGER NOT NULL DEFAULT 1,
    bathrooms NUMERIC(3, 1) NOT NULL DEFAULT 1.0,
    sqft INTEGER NOT NULL DEFAULT 1000,
    images TEXT[] NOT NULL DEFAULT '{}',
    featured BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold', 'archived')),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes on listings
CREATE INDEX IF NOT EXISTS idx_listings_agent_id ON listings(agent_id);
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_featured ON listings(featured);

-- ============================================================================
-- 3. AGENT AVAILABILITY SCHEDULES
-- Defines weekly working windows per agent in the agent's local timezone
-- ============================================================================
CREATE TABLE IF NOT EXISTS agent_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 1 = Monday ... 6 = Saturday
    start_time TIME NOT NULL DEFAULT '09:00:00',
    end_time TIME NOT NULL DEFAULT '17:00:00',
    slot_duration_minutes INTEGER NOT NULL DEFAULT 45 CHECK (slot_duration_minutes > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_agent_day_window UNIQUE (agent_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_agent_availability_agent_id ON agent_availability(agent_id);

-- ============================================================================
-- 4. BOOKINGS TABLE (WITH ATOMIC SLOT CONFLICT EXCLUSION CONSTRAINT)
-- Stores client bookings in standard UTC TIMESTAMPTZ
-- PostgreSQL GiST constraint prevents overlapping bookings for the same agent!
-- ============================================================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_timezone TEXT NOT NULL DEFAULT 'UTC',
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    tour_type TEXT NOT NULL DEFAULT 'in_person' CHECK (tour_type IN ('in_person', 'virtual_video')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT check_booking_time_validity CHECK (end_time > start_time)
);

-- Indexes on bookings
CREATE INDEX IF NOT EXISTS idx_bookings_agent_id ON bookings(agent_id);
CREATE INDEX IF NOT EXISTS idx_bookings_listing_id ON bookings(listing_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_time_range ON bookings(start_time, end_time);

-- ATOMIC CONFLICT PREVENTION:
-- GiST exclusion constraint blocks any two non-cancelled bookings from overlapping for the same agent!
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'no_overlapping_agent_bookings'
    ) THEN
        ALTER TABLE bookings
        ADD CONSTRAINT no_overlapping_agent_bookings
        EXCLUDE USING gist (
            agent_id WITH =,
            tstzrange(start_time, end_time) WITH &&
        ) WHERE (status != 'cancelled');
    END IF;
END $$;

-- ============================================================================
-- 5. AUTOMATIC updated_at TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS tr_agents_updated_at ON agents;
CREATE TRIGGER tr_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_listings_updated_at ON listings;
CREATE TRIGGER tr_listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_bookings_updated_at ON bookings;
CREATE TRIGGER tr_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Public read access for active agents & listings
CREATE POLICY "Public agents viewable" ON agents FOR SELECT USING (true);
CREATE POLICY "Public listings viewable" ON listings FOR SELECT USING (true);
CREATE POLICY "Public agent availability viewable" ON agent_availability FOR SELECT USING (true);
CREATE POLICY "Public bookings viewable" ON bookings FOR SELECT USING (true);

-- Insert policies (anyone can book a tour or admin can insert)
CREATE POLICY "Public create booking" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update booking" ON bookings FOR UPDATE USING (true);

-- Admin full access policies
CREATE POLICY "Full access agents" ON agents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access listings" ON listings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access availability" ON agent_availability FOR ALL USING (true) WITH CHECK (true);
