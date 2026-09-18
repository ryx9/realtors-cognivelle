import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import { AgentAvailability, Booking, GeneratedSlot, TimezoneOption } from '@/types/database';

export const POPULAR_TIMEZONES: TimezoneOption[] = [
  { value: 'America/New_York', label: 'New York (EDT/EST)', offset: 'UTC-4 / -5', region: 'Americas' },
  { value: 'America/Chicago', label: 'Chicago (CDT/CST)', offset: 'UTC-5 / -6', region: 'Americas' },
  { value: 'America/Denver', label: 'Denver (MDT/MST)', offset: 'UTC-6 / -7', region: 'Americas' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PDT/PST)', offset: 'UTC-7 / -8', region: 'Americas' },
  { value: 'America/Toronto', label: 'Toronto (EDT/EST)', offset: 'UTC-4 / -5', region: 'Americas' },
  { value: 'Europe/London', label: 'London (BST/GMT)', offset: 'UTC+1 / +0', region: 'Europe' },
  { value: 'Europe/Paris', label: 'Paris / Berlin (CEST/CET)', offset: 'UTC+2 / +1', region: 'Europe' },
  { value: 'Europe/Zurich', label: 'Zurich (CEST/CET)', offset: 'UTC+2 / +1', region: 'Europe' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: 'UTC+4', region: 'Middle East' },
  { value: 'Asia/Karachi', label: 'Karachi (PKT)', offset: 'UTC+5', region: 'Asia' },
  { value: 'Asia/Kolkata', label: 'Mumbai / Delhi (IST)', offset: 'UTC+5:30', region: 'Asia' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', offset: 'UTC+8', region: 'Asia' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 'UTC+9', region: 'Asia' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)', offset: 'UTC+10 / +11', region: 'Australia' },
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: 'UTC+0', region: 'Global' },
];

/**
 * Detect client browser timezone safely with fallback
 */
export function getBrowserTimezone(): string {
  if (typeof window !== 'undefined' && Intl && Intl.DateTimeFormat) {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) return detected;
    } catch {
      // ignore
    }
  }
  return 'America/New_York';
}

/**
 * Format an ISO UTC date string into specified timezone with friendly format
 */
export function formatZoned(
  isoDateStr: string,
  timeZone: string,
  formatPattern: string = 'MMM dd, yyyy h:mm a (zzz)'
): string {
  try {
    const date = new Date(isoDateStr);
    return formatInTimeZone(date, timeZone, formatPattern);
  } catch {
    return isoDateStr;
  }
}

/**
 * Check if two time intervals overlap: [startA, endA) and [startB, endB)
 */
export function doIntervalsOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean {
  return startA.getTime() < endB.getTime() && endA.getTime() > startB.getTime();
}

/**
 * Generates slot options for an agent on a specific calendar date (YYYY-MM-DD)
 * Takes into account agent weekly availability, existing bookings, and formats into both
 * the client's timezone and the agent's timezone.
 */
export function generateAgentSlotsForDate({
  agentTimezone,
  clientTimezone,
  dateStr, // 'YYYY-MM-DD'
  availability,
  existingBookings,
}: {
  agentTimezone: string;
  clientTimezone: string;
  dateStr: string;
  availability: AgentAvailability[];
  existingBookings: Booking[];
}): GeneratedSlot[] {
  // Determine day of week in agent's timezone for the selected date
  // e.g. 2026-09-20T12:00:00 in agent timezone
  const midDayZoned = fromZonedTime(`${dateStr} 12:00:00`, agentTimezone);
  const dayOfWeek = midDayZoned.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday

  // Find availability rule for this day of week
  const rule = availability.find((a) => a.day_of_week === dayOfWeek && a.is_active);

  if (!rule) {
    return [];
  }

  const [startHourStr, startMinStr] = rule.start_time.split(':');
  const [endHourStr, endMinStr] = rule.end_time.split(':');

  const startHour = parseInt(startHourStr, 10);
  const startMin = parseInt(startMinStr, 10);
  const endHour = parseInt(endHourStr, 10);
  const endMin = parseInt(endMinStr, 10);

  const slotDurationMinutes = rule.slot_duration_minutes || 45;
  const totalWindowMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);

  if (totalWindowMinutes <= 0) return [];

  const slots: GeneratedSlot[] = [];
  const now = new Date();

  // Active (non-cancelled) bookings to check against
  const activeBookings = existingBookings.filter(
    (b) => b.status !== 'cancelled'
  );

  let currentMinutes = startHour * 60 + startMin;
  const endWindowMinutes = endHour * 60 + endMin;

  while (currentMinutes + slotDurationMinutes <= endWindowMinutes) {
    const slotStartH = Math.floor(currentMinutes / 60);
    const slotStartM = currentMinutes % 60;

    const slotEndMinutes = currentMinutes + slotDurationMinutes;
    const slotEndH = Math.floor(slotEndMinutes / 60);
    const slotEndM = slotEndMinutes % 60;

    const startFormatted = `${String(slotStartH).padStart(2, '0')}:${String(slotStartM).padStart(2, '0')}:00`;
    const endFormatted = `${String(slotEndH).padStart(2, '0')}:${String(slotEndM).padStart(2, '0')}:00`;

    // Convert agent's local date/time to UTC Date
    const startUtcDate = fromZonedTime(`${dateStr} ${startFormatted}`, agentTimezone);
    const endUtcDate = fromZonedTime(`${dateStr} ${endFormatted}`, agentTimezone);

    // Check conflict with existing bookings
    let isAvailable = true;
    let conflictReason: string | undefined = undefined;

    // 1. Is it in the past?
    if (startUtcDate.getTime() < now.getTime()) {
      isAvailable = false;
      conflictReason = 'Past time slot';
    }

    // 2. Overlap with an existing confirmed/pending booking?
    if (isAvailable) {
      for (const booking of activeBookings) {
        const bStart = new Date(booking.start_time);
        const bEnd = new Date(booking.end_time);

        if (doIntervalsOverlap(startUtcDate, endUtcDate, bStart, bEnd)) {
          isAvailable = false;
          conflictReason = `Slot already booked (${booking.tour_type === 'virtual_video' ? 'Virtual Tour' : 'Showing'})`;
          break;
        }
      }
    }

    slots.push({
      startTimeUtc: startUtcDate.toISOString(),
      endTimeUtc: endUtcDate.toISOString(),
      clientStartTimeFormatted: formatInTimeZone(startUtcDate, clientTimezone, 'h:mm a'),
      clientEndTimeFormatted: formatInTimeZone(endUtcDate, clientTimezone, 'h:mm a (zzz)'),
      agentStartTimeFormatted: formatInTimeZone(startUtcDate, agentTimezone, 'h:mm a'),
      agentEndTimeFormatted: formatInTimeZone(endUtcDate, agentTimezone, 'h:mm a (zzz)'),
      isAvailable,
      conflictReason,
    });

    currentMinutes += slotDurationMinutes;
  }

  return slots;
}
