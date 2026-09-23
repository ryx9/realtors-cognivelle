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
 * Get deterministic day of week (0 = Sunday, 1 = Monday ... 6 = Saturday)
 * Immune to server environment timezone.
 */
export function getDayOfWeekFromDateStr(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0)).getUTCDay();
}

/**
 * Add or subtract calendar days from a 'YYYY-MM-DD' date string safely
 */
export function addDaysToDateStr(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0));
  return d.toISOString().split('T')[0];
}

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
 * Get current date string 'YYYY-MM-DD' in specified timezone
 */
export function getLocalTodayStr(timeZone?: string): string {
  const tz = timeZone || getBrowserTimezone();
  try {
    return formatInTimeZone(new Date(), tz, 'yyyy-MM-dd');
  } catch {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}

/**
 * Get tomorrow's date string 'YYYY-MM-DD' in specified timezone
 */
export function getLocalTomorrowStr(timeZone?: string): string {
  const today = getLocalTodayStr(timeZone);
  return addDaysToDateStr(today, 1);
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
 * Generates slot options for an agent on a specific client calendar date (YYYY-MM-DD).
 * Accounts for cross-timezone boundaries: an agent working in New York or Tokyo
 * can have working windows that span into adjacent client dates.
 * Filters slots precisely for the client's chosen date in the client's timezone.
 */
export function generateAgentSlotsForDate({
  agentTimezone,
  clientTimezone,
  dateStr, // 'YYYY-MM-DD' in client's perspective
  availability,
  existingBookings,
}: {
  agentTimezone: string;
  clientTimezone: string;
  dateStr: string;
  availability: AgentAvailability[];
  existingBookings: Booking[];
}): GeneratedSlot[] {
  if (!availability || availability.length === 0) {
    return [];
  }

  // To catch any agent working window that overlaps with client's requested date,
  // we evaluate the day before, the selected date, and the day after in agent time.
  const candidateAgentDates = [
    addDaysToDateStr(dateStr, -1),
    dateStr,
    addDaysToDateStr(dateStr, 1),
  ];

  const now = new Date();
  const activeBookings = (existingBookings || []).filter(
    (b) => b.status !== 'cancelled'
  );

  const slots: GeneratedSlot[] = [];
  const seenSlotKeys = new Set<string>();

  for (const agentDate of candidateAgentDates) {
    const dow = getDayOfWeekFromDateStr(agentDate);
    const rule = availability.find((a) => a.day_of_week === dow && a.is_active);

    if (!rule) continue;

    const [startHourStr, startMinStr] = (rule.start_time || '09:00:00').split(':');
    const [endHourStr, endMinStr] = (rule.end_time || '17:00:00').split(':');

    const startHour = parseInt(startHourStr, 10);
    const startMin = parseInt(startMinStr, 10);
    const endHour = parseInt(endHourStr, 10);
    const endMin = parseInt(endMinStr, 10);

    const slotDurationMinutes = rule.slot_duration_minutes || 45;
    const endWindowMinutes = endHour * 60 + endMin;

    let currentMinutes = startHour * 60 + startMin;

    while (currentMinutes + slotDurationMinutes <= endWindowMinutes) {
      const slotStartH = Math.floor(currentMinutes / 60);
      const slotStartM = currentMinutes % 60;

      const slotEndMinutes = currentMinutes + slotDurationMinutes;
      const slotEndH = Math.floor(slotEndMinutes / 60);
      const slotEndM = slotEndMinutes % 60;

      const startFormatted = `${String(slotStartH).padStart(2, '0')}:${String(slotStartM).padStart(2, '0')}:00`;
      const endFormatted = `${String(slotEndH).padStart(2, '0')}:${String(slotEndM).padStart(2, '0')}:00`;

      // Convert agent's local date & time into absolute UTC Date
      const startUtcDate = fromZonedTime(`${agentDate} ${startFormatted}`, agentTimezone);
      const endUtcDate = fromZonedTime(`${agentDate} ${endFormatted}`, agentTimezone);

      // Verify that in the CLIENT'S timezone, this slot actually falls on the requested date!
      const clientSlotDate = formatInTimeZone(startUtcDate, clientTimezone, 'yyyy-MM-dd');

      if (clientSlotDate === dateStr) {
        const slotKey = startUtcDate.toISOString();
        if (!seenSlotKeys.has(slotKey)) {
          seenSlotKeys.add(slotKey);

          let isAvailable = true;
          let conflictReason: string | undefined = undefined;

          // 1. Is slot in the past? (With a 15-minute grace window for preparation)
          if (startUtcDate.getTime() <= now.getTime() + 15 * 60 * 1000) {
            isAvailable = false;
            conflictReason = 'Time slot has passed';
          }

          // 2. Conflict with an existing confirmed/pending booking?
          if (isAvailable) {
            for (const booking of activeBookings) {
              const bStart = new Date(booking.start_time);
              const bEnd = new Date(booking.end_time);

              if (doIntervalsOverlap(startUtcDate, endUtcDate, bStart, bEnd)) {
                isAvailable = false;
                conflictReason = `Slot booked (${booking.tour_type === 'virtual_video' ? 'Virtual Tour' : 'Showing'})`;
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
        }
      }

      currentMinutes += slotDurationMinutes;
    }
  }

  // Sort slots chronologically
  slots.sort(
    (a, b) => new Date(a.startTimeUtc).getTime() - new Date(b.startTimeUtc).getTime()
  );

  return slots;
}
