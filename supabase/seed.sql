-- SEED DATA FOR REALTORS COGNIVELLE

-- 1. SEED AGENTS (Spread across multiple timezones)
INSERT INTO agents (id, name, email, phone, title, bio, avatar_url, timezone, is_active)
VALUES 
(
    'a1111111-1111-1111-1111-111111111111',
    'Elena Rostova',
    'elena.rostova@cognivellerealtors.com',
    '+1 (212) 555-0142',
    'Principal Luxury Specialist - Manhattan & Tribeca',
    'Elena has over 12 years of experience handling premier penthouses and historical townhouses across New York.',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    'America/New_York',
    true
),
(
    'a2222222-2222-2222-2222-222222222222',
    'Marcus Sterling',
    'marcus.sterling@cognivellerealtors.com',
    '+1 (310) 555-0198',
    'West Coast Architectural Director - Beverly Hills & Malibu',
    'Marcus specializes in modernist coastal estates and private architectural architectural gems throughout Southern California.',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
    'America/Los_Angeles',
    true
),
(
    'a3333333-3333-3333-3333-333333333333',
    'Sophia Kensington',
    'sophia.kensington@cognivellerealtors.com',
    '+44 20 7946 0912',
    'European & UK Prime Residential Lead - Mayfair & Kensington',
    'Advising international ultra-high-net-worth clients on prestigious heritage properties across central London.',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
    'Europe/London',
    true
),
(
    'a4444444-4444-4444-4444-444444444444',
    'Kenji Takahashi',
    'kenji.takahashi@cognivellerealtors.com',
    '+81 3 5555 0177',
    'Asia-Pacific Modern Luxury Lead - Minato & Shibuya',
    'Kenji bridges Tokyo skyline high-rises and serene Kyoto heritage residences for global cross-border buyers.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    'Asia/Tokyo',
    true
)
ON CONFLICT (id) DO NOTHING;

-- 2. SEED AGENT AVAILABILITY (Monday to Friday, 9:00 AM - 5:00 PM local agent time, 45-min slots)
INSERT INTO agent_availability (agent_id, day_of_week, start_time, end_time, slot_duration_minutes, is_active)
SELECT 
    a.id,
    dow,
    '09:00:00'::TIME,
    '17:00:00'::TIME,
    45,
    true
FROM agents a
CROSS JOIN generate_series(1, 5) AS dow
ON CONFLICT (agent_id, day_of_week) DO NOTHING;

-- 3. SEED LISTINGS (Aligned with specific agents)
INSERT INTO listings (id, title, description, price, address, city, state, zip_code, property_type, bedrooms, bathrooms, sqft, images, featured, status, agent_id)
VALUES
(
    'l1111111-1111-1111-1111-111111111111',
    'The Skyview Glass Penthouse',
    'Breathtaking 360-degree views of the Manhattan skyline and Hudson River. Features private elevator access, 14-foot floor-to-ceiling glass windows, custom Poliform Italian kitchen, and a 1,200 sqft wraparound terrace.',
    12450000.00,
    '432 Park Avenue, Floor 78',
    'New York',
    'NY',
    '10022',
    'Penthouse',
    4,
    4.5,
    5200,
    ARRAY[
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200'
    ],
    true,
    'active',
    'a1111111-1111-1111-1111-111111111111'
),
(
    'l2222222-2222-2222-2222-222222222222',
    'Historic Greenwich Village Brownstone',
    'Fully restored 19th-century Greek Revival townhouse. Meticulously preserved period fireplaces, private landscaped Japanese courtyard garden, wine cellar, and integrated smart home automation.',
    8950000.00,
    '28 West 11th Street',
    'New York',
    'NY',
    '10011',
    'Townhouse',
    5,
    5.0,
    4800,
    ARRAY[
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=1200'
    ],
    false,
    'active',
    'a1111111-1111-1111-1111-111111111111'
),
(
    'l3333333-3333-3333-3333-333333333333',
    'Malibu Carbon Beach Modernist Sanctuary',
    'Commanding oceanfront modern architectural marvel situated on Carbon Beach with 60 feet of prime sandy frontage. Zero-edge saltwater infinity pool, teak decks, and seamless indoor-outdoor pocket doors.',
    18750000.00,
    '22108 Pacific Coast Highway',
    'Malibu',
    'CA',
    '90265',
    'Villa',
    5,
    6.0,
    6400,
    ARRAY[
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200'
    ],
    true,
    'active',
    'a2222222-2222-2222-2222-222222222222'
),
(
    'l4444444-4444-4444-4444-444444444444',
    'Mayfair Heritage Garden Residence',
    'Grade II listed Victorian residence situated moments from Grosvenor Square. Elegant double-height reception salons, bespoke Mark Wilkinson cabinetry, private mews garage, and 24-hour concierge.',
    14200000.00,
    '14 South Audley Street',
    'London',
    'Greater London',
    'W1K 2PF',
    'Townhouse',
    4,
    4.0,
    4100,
    ARRAY[
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&q=80&w=1200'
    ],
    true,
    'active',
    'a3333333-3333-3333-3333-333333333333'
),
(
    'l5555555-5555-5555-5555-555555555555',
    'Roppongi Hills Panorama Residence',
    'Ultra-luxurious corner tower residence in the heart of Roppongi with direct unobstructed views of Tokyo Tower and Mount Fuji. Features Hinoki wood spa bath, custom marble finishes, and private club amenities.',
    6900000.00,
    '6-10-1 Roppongi, Minato City',
    'Tokyo',
    'Tokyo',
    '106-0032',
    'Condo',
    3,
    3.0,
    2650,
    ARRAY[
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200'
    ],
    true,
    'active',
    'a4444444-4444-4444-4444-444444444444'
)
ON CONFLICT (id) DO NOTHING;
