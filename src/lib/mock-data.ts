import { Agent, Listing, AgentAvailability, Booking } from '@/types/database';

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    name: 'Elena Rostova',
    email: 'elena.rostova@cognivellerealtors.com',
    phone: '+1 (212) 555-0142',
    title: 'Principal Luxury Specialist - Manhattan & Tribeca',
    bio: 'Elena has over 12 years of experience handling premier penthouses and historical townhouses across New York.',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    timezone: 'America/New_York',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    name: 'Marcus Sterling',
    email: 'marcus.sterling@cognivellerealtors.com',
    phone: '+1 (310) 555-0198',
    title: 'West Coast Architectural Director - Beverly Hills & Malibu',
    bio: 'Marcus specializes in modernist coastal estates and private architectural gems throughout Southern California.',
    avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
    timezone: 'America/Los_Angeles',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'a3333333-3333-3333-3333-333333333333',
    name: 'Sophia Kensington',
    email: 'sophia.kensington@cognivellerealtors.com',
    phone: '+44 20 7946 0912',
    title: 'European & UK Prime Residential Lead - Mayfair & Kensington',
    bio: 'Advising international ultra-high-net-worth clients on prestigious heritage properties across central London.',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
    timezone: 'Europe/London',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'a4444444-4444-4444-4444-444444444444',
    name: 'Kenji Takahashi',
    email: 'kenji.takahashi@cognivellerealtors.com',
    phone: '+81 3 5555 0177',
    title: 'Asia-Pacific Modern Luxury Lead - Minato & Shibuya',
    bio: 'Kenji bridges Tokyo skyline high-rises and serene Kyoto heritage residences for global cross-border buyers.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    timezone: 'Asia/Tokyo',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_AVAILABILITY: AgentAvailability[] = [
  // Elena Rostova (Mon-Fri 09:00 - 17:00 NY time)
  ...[1, 2, 3, 4, 5].map((dow) => ({
    id: `avail-elena-${dow}`,
    agent_id: 'a1111111-1111-1111-1111-111111111111',
    day_of_week: dow,
    start_time: '09:00:00',
    end_time: '17:00:00',
    slot_duration_minutes: 45,
    is_active: true,
  })),
  // Marcus Sterling (Mon-Fri 09:00 - 17:00 LA time)
  ...[1, 2, 3, 4, 5].map((dow) => ({
    id: `avail-marcus-${dow}`,
    agent_id: 'a2222222-2222-2222-2222-222222222222',
    day_of_week: dow,
    start_time: '09:00:00',
    end_time: '17:00:00',
    slot_duration_minutes: 45,
    is_active: true,
  })),
  // Sophia Kensington (Mon-Fri 09:00 - 17:00 London time)
  ...[1, 2, 3, 4, 5].map((dow) => ({
    id: `avail-sophia-${dow}`,
    agent_id: 'a3333333-3333-3333-3333-333333333333',
    day_of_week: dow,
    start_time: '09:00:00',
    end_time: '17:00:00',
    slot_duration_minutes: 45,
    is_active: true,
  })),
  // Kenji Takahashi (Mon-Fri 09:00 - 17:00 Tokyo time)
  ...[1, 2, 3, 4, 5].map((dow) => ({
    id: `avail-kenji-${dow}`,
    agent_id: 'a4444444-4444-4444-4444-444444444444',
    day_of_week: dow,
    start_time: '09:00:00',
    end_time: '17:00:00',
    slot_duration_minutes: 45,
    is_active: true,
  })),
];

export const INITIAL_LISTINGS: Listing[] = [
  {
    id: 'l1111111-1111-1111-1111-111111111111',
    title: 'The Skyview Glass Penthouse',
    description: 'Breathtaking 360-degree views of the Manhattan skyline and Hudson River. Features private elevator access, 14-foot floor-to-ceiling glass windows, custom Poliform Italian kitchen, and a 1,200 sqft wraparound terrace.',
    price: 12450000,
    address: '432 Park Avenue, Floor 78',
    city: 'New York',
    state: 'NY',
    zip_code: '10022',
    property_type: 'Penthouse',
    bedrooms: 4,
    bathrooms: 4.5,
    sqft: 5200,
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200'
    ],
    featured: true,
    status: 'active',
    agent_id: 'a1111111-1111-1111-1111-111111111111',
    created_at: new Date().toISOString(),
  },
  {
    id: 'l2222222-2222-2222-2222-222222222222',
    title: 'Historic Greenwich Village Brownstone',
    description: 'Fully restored 19th-century Greek Revival townhouse. Meticulously preserved period fireplaces, private landscaped Japanese courtyard garden, wine cellar, and integrated smart home automation.',
    price: 8950000,
    address: '28 West 11th Street',
    city: 'New York',
    state: 'NY',
    zip_code: '10011',
    property_type: 'Townhouse',
    bedrooms: 5,
    bathrooms: 5.0,
    sqft: 4800,
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=1200'
    ],
    featured: false,
    status: 'active',
    agent_id: 'a1111111-1111-1111-1111-111111111111',
    created_at: new Date().toISOString(),
  },
  {
    id: 'l3333333-3333-3333-3333-333333333333',
    title: 'Malibu Carbon Beach Modernist Sanctuary',
    description: 'Commanding oceanfront modern architectural marvel situated on Carbon Beach with 60 feet of prime sandy frontage. Zero-edge saltwater infinity pool, teak decks, and seamless indoor-outdoor pocket doors.',
    price: 18750000,
    address: '22108 Pacific Coast Highway',
    city: 'Malibu',
    state: 'CA',
    zip_code: '90265',
    property_type: 'Villa',
    bedrooms: 5,
    bathrooms: 6.0,
    sqft: 6400,
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200'
    ],
    featured: true,
    status: 'active',
    agent_id: 'a2222222-2222-2222-2222-222222222222',
    created_at: new Date().toISOString(),
  },
  {
    id: 'l4444444-4444-4444-4444-444444444444',
    title: 'Mayfair Heritage Garden Residence',
    description: 'Grade II listed Victorian residence situated moments from Grosvenor Square. Elegant double-height reception salons, bespoke Mark Wilkinson cabinetry, private mews garage, and 24-hour concierge.',
    price: 14200000,
    address: '14 South Audley Street',
    city: 'London',
    state: 'Greater London',
    zip_code: 'W1K 2PF',
    property_type: 'Townhouse',
    bedrooms: 4,
    bathrooms: 4.0,
    sqft: 4100,
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&q=80&w=1200'
    ],
    featured: true,
    status: 'active',
    agent_id: 'a3333333-3333-3333-3333-333333333333',
    created_at: new Date().toISOString(),
  },
  {
    id: 'l5555555-5555-5555-5555-555555555555',
    title: 'Roppongi Hills Panorama Residence',
    description: 'Ultra-luxurious corner tower residence in the heart of Roppongi with direct unobstructed views of Tokyo Tower and Mount Fuji. Features Hinoki wood spa bath, custom marble finishes, and private club amenities.',
    price: 6900000,
    address: '6-10-1 Roppongi, Minato City',
    city: 'Tokyo',
    state: 'Tokyo',
    zip_code: '106-0032',
    property_type: 'Condo',
    bedrooms: 3,
    bathrooms: 3.0,
    sqft: 2650,
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200'
    ],
    featured: true,
    status: 'active',
    agent_id: 'a4444444-4444-4444-4444-444444444444',
    created_at: new Date().toISOString(),
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b1111111-1111-1111-1111-111111111111',
    agent_id: 'a1111111-1111-1111-1111-111111111111',
    listing_id: 'l1111111-1111-1111-1111-111111111111',
    client_name: 'Alexander Sterling',
    client_email: 'alex.sterling@example.com',
    client_phone: '+1 (415) 890-1234',
    client_timezone: 'America/Los_Angeles',
    // Scheduled in future date:
    start_time: '2026-09-21T14:00:00.000Z', // 10:00 AM EDT
    end_time: '2026-09-21T14:45:00.000Z',   // 10:45 AM EDT
    status: 'confirmed',
    tour_type: 'in_person',
    notes: 'Interested in private penthouse terrace views and parking spaces.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    agent_id: 'a2222222-2222-2222-2222-222222222222',
    listing_id: 'l3333333-3333-3333-3333-333333333333',
    client_name: 'Fariha Al-Mansoor',
    client_email: 'fariha.almansoor@example.com',
    client_phone: '+971 50 123 4567',
    client_timezone: 'Asia/Dubai',
    start_time: '2026-09-22T17:00:00.000Z', // 10:00 AM PDT / 9:00 PM GST
    end_time: '2026-09-22T17:45:00.000Z',
    status: 'confirmed',
    tour_type: 'virtual_video',
    notes: 'Virtual live stream tour from Dubai. Focusing on beachfront access and security features.',
    created_at: new Date().toISOString(),
  }
];
