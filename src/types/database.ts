export type PropertyType = 'Single Family' | 'Condo' | 'Townhouse' | 'Penthouse' | 'Villa';
export type ListingStatus = 'active' | 'pending' | 'sold' | 'archived';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type TourType = 'in_person' | 'virtual_video';

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  title?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  timezone: string; // e.g. 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo'
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  address: string;
  city: string;
  state: string;
  zip_code?: string | null;
  property_type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  images: string[];
  featured: boolean;
  status: ListingStatus;
  agent_id: string;
  agent?: Agent;
  created_at?: string;
  updated_at?: string;
}

export interface AgentAvailability {
  id: string;
  agent_id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday ... 6 = Saturday
  start_time: string;  // '09:00:00'
  end_time: string;    // '17:00:00'
  slot_duration_minutes: number; // e.g. 45
  is_active: boolean;
  created_at?: string;
}

export interface Booking {
  id: string;
  agent_id: string;
  listing_id?: string | null;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_timezone: string;
  start_time: string; // ISO 8601 UTC string
  end_time: string;   // ISO 8601 UTC string
  status: BookingStatus;
  tour_type: TourType;
  notes?: string | null;
  agent?: Agent;
  listing?: Listing;
  created_at?: string;
  updated_at?: string;
}

export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
  region: string;
}

export interface GeneratedSlot {
  startTimeUtc: string;      // ISO 8601 UTC
  endTimeUtc: string;        // ISO 8601 UTC
  clientStartTimeFormatted: string; // e.g., '10:00 AM'
  clientEndTimeFormatted: string;   // e.g., '10:45 AM'
  agentStartTimeFormatted: string;  // e.g., '07:00 AM'
  agentEndTimeFormatted: string;    // e.g., '07:45 AM'
  isAvailable: boolean;
  conflictReason?: string;
}

export interface AdminStats {
  totalListings: number;
  totalAgents: number;
  totalBookings: number;
  confirmedBookings: number;
  conflictsPreventedCount: number;
}
