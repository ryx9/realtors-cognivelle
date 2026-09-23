import { supabase, isSupabaseConfigured } from './supabase';
import { Agent, Listing, AgentAvailability, Booking, AdminStats, UserProfile, UserRole } from '@/types/database';
import { INITIAL_AGENTS, INITIAL_AVAILABILITY, INITIAL_LISTINGS, INITIAL_BOOKINGS } from './mock-data';
import { doIntervalsOverlap } from './timezone-utils';

// Global memory cache to retain mutations in development
declare global {
  // eslint-disable-next-line no-var
  var __mockDb: {
    agents: Agent[];
    listings: Listing[];
    availability: AgentAvailability[];
    bookings: Booking[];
    profiles: UserProfile[];
    conflictsPreventedCount: number;
  } | undefined;
}

if (!globalThis.__mockDb) {
  globalThis.__mockDb = {
    agents: [...INITIAL_AGENTS],
    listings: [...INITIAL_LISTINGS],
    availability: [...INITIAL_AVAILABILITY],
    bookings: [...INITIAL_BOOKINGS],
    profiles: [
      {
        id: 'usr-admin-demo',
        email: 'admin@cognivellerealtors.com',
        full_name: 'Administrator',
        role: 'admin',
        agent_id: null,
      },
    ],
    conflictsPreventedCount: 3, // starting metric for demonstration
  };
}

const db = globalThis.__mockDb;

// ============================================================================
// AGENTS
// ============================================================================
export async function getAgents(includeInactive: boolean = false): Promise<Agent[]> {
  if (isSupabaseConfigured && supabase) {
    let query = supabase.from('agents').select('*').order('name');
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }
    const { data, error } = await query;
    if (!error && data) return data as Agent[];
  }

  return includeInactive ? [...db.agents] : db.agents.filter((a) => a.is_active);
}

export async function getAgentById(id: string): Promise<Agent | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('agents').select('*').eq('id', id).single();
    if (!error && data) return data as Agent;
  }

  return db.agents.find((a) => a.id === id) || null;
}

export async function createAgent(agentData: Omit<Agent, 'id' | 'created_at' | 'updated_at'>): Promise<Agent> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('agents').insert(agentData).select().single();
    if (!error && data) {
      // Automatically initialize default Monday-Friday working availability in Supabase
      const defaultAvail = [1, 2, 3, 4, 5].map((dow) => ({
        agent_id: data.id,
        day_of_week: dow,
        start_time: '09:00:00',
        end_time: '17:00:00',
        slot_duration_minutes: 45,
        is_active: true,
      }));
      await supabase.from('agent_availability').insert(defaultAvail);
      return data as Agent;
    }
    if (error) throw new Error(error.message);
  }

  const newAgent: Agent = {
    ...agentData,
    id: `agent-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.agents.unshift(newAgent);

  // Initialize default availability (Mon-Fri 09:00 - 17:00)
  for (let dow = 1; dow <= 5; dow++) {
    db.availability.push({
      id: `avail-${newAgent.id}-${dow}`,
      agent_id: newAgent.id,
      day_of_week: dow,
      start_time: '09:00:00',
      end_time: '17:00:00',
      slot_duration_minutes: 45,
      is_active: true,
    });
  }

  return newAgent;
}

export async function updateAgent(id: string, updates: Partial<Agent>): Promise<Agent> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('agents').update(updates).eq('id', id).select().single();
    if (!error && data) return data as Agent;
    if (error) throw new Error(error.message);
  }

  const index = db.agents.findIndex((a) => a.id === id);
  if (index === -1) throw new Error('Agent not found');
  db.agents[index] = { ...db.agents[index], ...updates, updated_at: new Date().toISOString() };
  return db.agents[index];
}

// ============================================================================
// LISTINGS
// ============================================================================
export async function getListings(filters?: {
  agentId?: string;
  status?: string;
  featuredOnly?: boolean;
}): Promise<Listing[]> {
  if (isSupabaseConfigured && supabase) {
    let query = supabase.from('listings').select('*, agent:agents(*)').order('created_at', { ascending: false });
    if (filters?.agentId) query = query.eq('agent_id', filters.agentId);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.featuredOnly) query = query.eq('featured', true);

    const { data, error } = await query;
    if (!error && data) return data as Listing[];
  }

  let result = [...db.listings];
  if (filters?.agentId) {
    result = result.filter((l) => l.agent_id === filters.agentId);
  }
  if (filters?.status) {
    result = result.filter((l) => l.status === filters.status);
  }
  if (filters?.featuredOnly) {
    result = result.filter((l) => l.featured);
  }

  return result.map((l) => ({
    ...l,
    agent: db.agents.find((a) => a.id === l.agent_id),
  }));
}

export async function getListingById(id: string): Promise<Listing | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('listings')
      .select('*, agent:agents(*)')
      .eq('id', id)
      .single();
    if (!error && data) return data as Listing;
  }

  const listing = db.listings.find((l) => l.id === id);
  if (!listing) return null;
  return {
    ...listing,
    agent: db.agents.find((a) => a.id === listing.agent_id),
  };
}

export async function createListing(listingData: Omit<Listing, 'id' | 'created_at' | 'updated_at'>): Promise<Listing> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('listings').insert(listingData).select('*, agent:agents(*)').single();
    if (!error && data) return data as Listing;
    if (error) throw new Error(error.message);
  }

  const newListing: Listing = {
    ...listingData,
    id: `listing-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.listings.unshift(newListing);
  return {
    ...newListing,
    agent: db.agents.find((a) => a.id === newListing.agent_id),
  };
}

export async function updateListing(id: string, updates: Partial<Listing>): Promise<Listing> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('listings').update(updates).eq('id', id).select('*, agent:agents(*)').single();
    if (!error && data) return data as Listing;
    if (error) throw new Error(error.message);
  }

  const index = db.listings.findIndex((l) => l.id === id);
  if (index === -1) throw new Error('Listing not found');
  db.listings[index] = { ...db.listings[index], ...updates, updated_at: new Date().toISOString() };
  return {
    ...db.listings[index],
    agent: db.agents.find((a) => a.id === db.listings[index].agent_id),
  };
}

// ============================================================================
// AGENT AVAILABILITY
// ============================================================================
export async function getAgentAvailability(agentId: string): Promise<AgentAvailability[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('agent_availability')
      .select('*')
      .eq('agent_id', agentId)
      .order('day_of_week');

    if (!error && data && data.length > 0) {
      return data as AgentAvailability[];
    }

    // If agent exists in Supabase but has no availability records, auto-seed standard Mon-Fri hours
    if (!error && data && data.length === 0) {
      const defaultAvail = [0, 1, 2, 3, 4, 5, 6].map((dow) => ({
        agent_id: agentId,
        day_of_week: dow,
        start_time: '09:00:00',
        end_time: '17:00:00',
        slot_duration_minutes: 45,
        is_active: dow >= 1 && dow <= 5,
      }));
      const { data: inserted } = await supabase
        .from('agent_availability')
        .insert(defaultAvail)
        .select();
      if (inserted && inserted.length > 0) {
        return inserted as AgentAvailability[];
      }
    }
  }

  const existingInDb = db.availability.filter((a) => a.agent_id === agentId);
  if (existingInDb.length > 0) return existingInDb;

  // Fallback defaults for in-memory agent
  const fallbackAvail: AgentAvailability[] = [0, 1, 2, 3, 4, 5, 6].map((dow) => ({
    id: `avail-${agentId}-${dow}`,
    agent_id: agentId,
    day_of_week: dow,
    start_time: '09:00:00',
    end_time: '17:00:00',
    slot_duration_minutes: 45,
    is_active: dow >= 1 && dow <= 5,
  }));
  db.availability.push(...fallbackAvail);
  return fallbackAvail;
}

export async function saveAgentAvailability(
  agentId: string,
  schedules: Array<Omit<AgentAvailability, 'id' | 'agent_id'>>
): Promise<AgentAvailability[]> {
  if (isSupabaseConfigured && supabase) {
    // Delete existing and re-insert
    await supabase.from('agent_availability').delete().eq('agent_id', agentId);
    const rows = schedules.map((s) => ({ ...s, agent_id: agentId }));
    const { data, error } = await supabase.from('agent_availability').insert(rows).select();
    if (!error && data) return data as AgentAvailability[];
    if (error) throw new Error(error.message);
  }

  // Remove existing
  db.availability = db.availability.filter((a) => a.agent_id !== agentId);
  const newEntries: AgentAvailability[] = schedules.map((s, idx) => ({
    id: `avail-${agentId}-${s.day_of_week}-${idx}`,
    agent_id: agentId,
    ...s,
  }));
  db.availability.push(...newEntries);
  return newEntries;
}

// ============================================================================
// BOOKINGS & CONFLICT DETECTION
// ============================================================================
export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingBooking?: Booking;
  reason?: string;
}

export async function checkBookingConflict(
  agentId: string,
  startTimeUtc: string,
  endTimeUtc: string,
  excludeBookingId?: string
): Promise<ConflictCheckResult> {
  const reqStart = new Date(startTimeUtc);
  const reqEnd = new Date(endTimeUtc);

  if (reqEnd.getTime() <= reqStart.getTime()) {
    return {
      hasConflict: true,
      reason: 'End time must be strictly after start time',
    };
  }

  if (isSupabaseConfigured && supabase) {
    let query = supabase
      .from('bookings')
      .select('*, agent:agents(*), listing:listings(*)')
      .eq('agent_id', agentId)
      .neq('status', 'cancelled')
      .lt('start_time', endTimeUtc)
      .gt('end_time', startTimeUtc);

    if (excludeBookingId) {
      query = query.neq('id', excludeBookingId);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return {
        hasConflict: true,
        conflictingBooking: data[0] as Booking,
        reason: `Agent already has a scheduled showing between ${new Date(data[0].start_time).toUTCString()} and ${new Date(data[0].end_time).toUTCString()}`,
      };
    }
  }

  // Check against memory store
  const existingActive = db.bookings.filter(
    (b) => b.agent_id === agentId && b.status !== 'cancelled' && b.id !== excludeBookingId
  );

  for (const b of existingActive) {
    const bStart = new Date(b.start_time);
    const bEnd = new Date(b.end_time);

    if (doIntervalsOverlap(reqStart, reqEnd, bStart, bEnd)) {
      return {
        hasConflict: true,
        conflictingBooking: b,
        reason: `Agent is already booked from ${bStart.toLocaleTimeString()} to ${bEnd.toLocaleTimeString()} UTC for ${b.client_name}`,
      };
    }
  }

  return { hasConflict: false };
}

export async function getBookings(filters?: {
  agentId?: string;
  status?: string;
  clientEmail?: string;
}): Promise<Booking[]> {
  if (isSupabaseConfigured && supabase) {
    let query = supabase
      .from('bookings')
      .select('*, agent:agents(*), listing:listings(*)')
      .order('start_time', { ascending: true });

    if (filters?.agentId) query = query.eq('agent_id', filters.agentId);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.clientEmail) query = query.eq('client_email', filters.clientEmail);

    const { data, error } = await query;
    if (!error && data) return data as Booking[];
  }

  let result = [...db.bookings];
  if (filters?.agentId) {
    result = result.filter((b) => b.agent_id === filters.agentId);
  }
  if (filters?.status) {
    result = result.filter((b) => b.status === filters.status);
  }
  if (filters?.clientEmail) {
    result = result.filter((b) => b.client_email.toLowerCase() === filters.clientEmail?.toLowerCase());
  }

  return result.map((b) => ({
    ...b,
    agent: db.agents.find((a) => a.id === b.agent_id),
    listing: db.listings.find((l) => l.id === b.listing_id),
  }));
}

export async function createBooking(
  bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; booking?: Booking; error?: string }> {
  // 1. Conflict Check Guard
  const conflict = await checkBookingConflict(
    bookingData.agent_id,
    bookingData.start_time,
    bookingData.end_time
  );

  if (conflict.hasConflict) {
    db.conflictsPreventedCount++;
    return {
      success: false,
      error: `Conflict detected: ${conflict.reason}`,
    };
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select('*, agent:agents(*), listing:listings(*)')
      .single();

    if (error) {
      if (error.message.includes('no_overlapping_agent_bookings')) {
        db.conflictsPreventedCount++;
        return {
          success: false,
          error: 'Slot conflict prevented by database exclusion constraint: agent is already booked during this window.',
        };
      }
      return { success: false, error: error.message };
    }

    return { success: true, booking: data as Booking };
  }

  const newBooking: Booking = {
    ...bookingData,
    id: `booking-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.bookings.unshift(newBooking);
  return {
    success: true,
    booking: {
      ...newBooking,
      agent: db.agents.find((a) => a.id === newBooking.agent_id),
      listing: db.listings.find((l) => l.id === newBooking.listing_id),
    },
  };
}

export async function updateBookingStatus(
  id: string,
  status: Booking['status']
): Promise<Booking> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, agent:agents(*), listing:listings(*)')
      .single();
    if (!error && data) return data as Booking;
    if (error) throw new Error(error.message);
  }

  const index = db.bookings.findIndex((b) => b.id === id);
  if (index === -1) throw new Error('Booking not found');
  db.bookings[index] = { ...db.bookings[index], status, updated_at: new Date().toISOString() };
  return {
    ...db.bookings[index],
    agent: db.agents.find((a) => a.id === db.bookings[index].agent_id),
    listing: db.listings.find((l) => l.id === db.bookings[index].listing_id),
  };
}

export async function getAdminStats(): Promise<AdminStats> {
  const [agents, listings, bookings] = await Promise.all([
    getAgents(true),
    getListings(),
    getBookings(),
  ]);

  return {
    totalAgents: agents.length,
    totalListings: listings.length,
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter((b) => b.status === 'confirmed').length,
    conflictsPreventedCount: db.conflictsPreventedCount,
  };
}

export async function deleteListing(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (!error) return true;
    if (error) throw new Error(error.message);
  }

  const idx = db.listings.findIndex((l) => l.id === id);
  if (idx !== -1) {
    db.listings.splice(idx, 1);
    return true;
  }
  return false;
}

export async function deleteAgent(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('agents').delete().eq('id', id);
    if (!error) return true;
    if (error) throw new Error(error.message);
  }

  const idx = db.agents.findIndex((a) => a.id === id);
  if (idx !== -1) {
    db.agents.splice(idx, 1);
    return true;
  }
  return false;
}

export async function getAgentByEmail(email: string): Promise<Agent | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .ilike('email', email)
      .single();
    if (!error && data) return data as Agent;
  }

  return db.agents.find((a) => a.email.toLowerCase() === email.toLowerCase()) || null;
}

// ============================================================================
// USER PROFILES & RBAC
// ============================================================================
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) return data as UserProfile;
    } catch {
      // profiles table might not be migrated yet; fallback below
    }
  }

  return db.profiles.find((p) => p.id === userId) || null;
}

export async function upsertUserProfile(profile: Partial<UserProfile> & { id: string; email: string }): Promise<UserProfile> {
  const fullProfile: UserProfile = {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name || null,
    role: profile.role || 'client',
    agent_id: profile.agent_id || null,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(fullProfile)
        .select()
        .single();
      if (!error && data) return data as UserProfile;
    } catch {
      // profiles table might not exist yet; proceed to local store
    }
  }

  const existingIdx = db.profiles.findIndex((p) => p.id === profile.id);
  if (existingIdx !== -1) {
    db.profiles[existingIdx] = { ...db.profiles[existingIdx], ...fullProfile };
    return db.profiles[existingIdx];
  } else {
    fullProfile.created_at = new Date().toISOString();
    db.profiles.push(fullProfile);
    return fullProfile;
  }
}
