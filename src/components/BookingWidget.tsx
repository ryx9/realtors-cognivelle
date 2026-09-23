'use client';

import { useState, useEffect, useCallback } from 'react';
import { Agent, GeneratedSlot, TourType } from '@/types/database';
import {
  POPULAR_TIMEZONES,
  getBrowserTimezone,
  formatZoned,
  getLocalTodayStr,
  getLocalTomorrowStr,
} from '@/lib/timezone-utils';
import { RefreshCw, Clock, Check, Calendar, Globe, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface BookingWidgetProps {
  agent: Agent;
  listingId?: string;
  listingTitle?: string;
  onSuccess?: () => void;
}

export default function BookingWidget({
  agent,
  listingId,
  listingTitle,
  onSuccess,
}: BookingWidgetProps) {
  const { user, profile } = useAuth();

  const [clientTimezone, setClientTimezone] = useState<string>('America/New_York');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [slots, setSlots] = useState<GeneratedSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<GeneratedSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [slotError, setSlotError] = useState<string | null>(null);

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [tourType, setTourType] = useState<TourType>('in_person');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  // Initialize browser timezone and current date
  useEffect(() => {
    const detectedTz = getBrowserTimezone();
    setClientTimezone(detectedTz);
    setSelectedDate(getLocalTodayStr(detectedTz));
  }, []);

  // Pre-fill user profile details if logged in
  useEffect(() => {
    if (user && !clientEmail) {
      setClientEmail(user.email || '');
    }
    if (profile?.full_name && !clientName) {
      setClientName(profile.full_name);
    }
  }, [user, profile, clientEmail, clientName]);

  const fetchSlots = useCallback(async () => {
    if (!agent?.id || !selectedDate) return;
    setLoadingSlots(true);
    setSlotError(null);
    setSelectedSlot(null);

    try {
      const res = await fetch(
        `/api/slots?agentId=${agent.id}&date=${selectedDate}&clientTz=${encodeURIComponent(clientTimezone)}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to retrieve available times');
      }

      setSlots(data.slots || []);
    } catch (err: any) {
      setSlotError(err.message || 'Unable to load available times');
    } finally {
      setLoadingSlots(false);
    }
  }, [agent?.id, selectedDate, clientTimezone]);

  useEffect(() => {
    if (selectedDate) {
      fetchSlots();
    }
  }, [fetchSlots, selectedDate]);

  const handleBookSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setBookingError('Please select an available time');
      return;
    }

    setSubmitting(true);
    setBookingError(null);

    try {
      const payload = {
        agent_id: agent.id,
        listing_id: listingId || null,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        client_timezone: clientTimezone,
        start_time: selectedSlot.startTimeUtc,
        end_time: selectedSlot.endTimeUtc,
        tour_type: tourType,
        notes: notes || null,
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setBookingError('This time is no longer available. Please choose a different slot.');
          fetchSlots();
          return;
        }
        throw new Error(data.error || 'Unable to complete your request');
      }

      setBookingSuccess(data);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setBookingError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setBookingSuccess(null);
    setSelectedSlot(null);
    setClientName('');
    setClientEmail('');
    setClientPhone('');
    setNotes('');
    fetchSlots();
  };

  if (bookingSuccess) {
    return (
      <div className="border border-border p-6 sm:p-8">
        <div className="mb-6 pb-6 border-b border-border">
          <p className="text-[10px] uppercase tracking-widest text-accent font-medium mb-1">Confirmed</p>
          <h3 className="font-display text-2xl text-foreground">Appointment Scheduled</h3>
          <p className="text-xs text-muted mt-1">
            A confirmation will be sent to your email shortly.
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {listingTitle && (
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-xs text-muted">Property</span>
              <span className="text-xs text-foreground font-medium text-right max-w-[200px] truncate">{listingTitle}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-xs text-muted">Advisor</span>
            <span className="text-xs text-foreground font-medium">{agent.name}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-xs text-muted">Date & Time</span>
            <span className="text-xs text-foreground font-medium">
              {formatZoned(bookingSuccess.start_time, clientTimezone, 'EEE, MMM d, yyyy h:mm a')}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-xs text-muted">Type</span>
            <span className="text-xs text-foreground capitalize font-medium">{bookingSuccess.tour_type.replace('_', ' ')}</span>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="w-full py-3 px-4 bg-foreground text-background font-medium text-xs tracking-wider uppercase hover:bg-accent transition-colors"
        >
          Schedule Another Visit
        </button>
      </div>
    );
  }

  const todayStr = getLocalTodayStr(clientTimezone);

  const inputClass = "w-full bg-background border border-border px-3 py-2 text-xs font-medium text-foreground placeholder-muted focus:outline-none focus:border-foreground transition-colors";
  const labelClass = "block text-[10px] font-bold tracking-widest uppercase text-muted mb-1";

  const availableCount = slots.filter((s) => s.isAvailable).length;

  return (
    <div className="border border-border p-5 sm:p-6 bg-card shadow-sm">
      <div className="border-b border-border pb-3 mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-accent font-bold mb-0.5">
            Private Appointment
          </p>
          <h3 className="font-display font-black uppercase text-lg text-foreground tracking-tight">
            Schedule with {agent.name.split(' ')[0]}
          </h3>
        </div>
        <div className="text-right">
          <span className="text-[9px] uppercase tracking-wider text-muted block font-semibold">Advisor TZ</span>
          <span className="text-[10px] font-bold text-foreground block">{agent.timezone.split('/')[1]?.replace('_', ' ') || agent.timezone}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className={labelClass}>Preferred Date</label>
          <input
            type="date"
            min={todayStr}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={labelClass.replace(' mb-1', '')}>Your Timezone</label>
            <button
              type="button"
              onClick={() => {
                const tz = getBrowserTimezone();
                setClientTimezone(tz);
              }}
              className="text-[9px] text-accent hover:underline tracking-wider uppercase font-bold"
            >
              Auto-detect
            </button>
          </div>
          <select
            value={clientTimezone}
            onChange={(e) => setClientTimezone(e.target.value)}
            className={inputClass}
          >
            {POPULAR_TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label} ({tz.offset})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <label className={labelClass.replace(' mb-1', '')}>Available Times</label>
            {!loadingSlots && slots.length > 0 && (
              <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                ({availableCount} of {slots.length} open)
              </span>
            )}
          </div>
          {loadingSlots && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted">
              <RefreshCw className="w-3 h-3 animate-spin text-accent" />
              <span>Checking live slots…</span>
            </div>
          )}
        </div>

        {slotError && (
          <div className="p-2.5 border border-red-200 bg-red-50 text-red-700 text-xs">
            {slotError}
          </div>
        )}

        {!loadingSlots && slots.length === 0 && !slotError && (
          <div className="p-3 border border-border text-center text-xs text-muted bg-background">
            No availability on this date for {agent.name.split(' ')[0]}. Please select another day (Monday – Friday).
          </div>
        )}

        {!loadingSlots && slots.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
            {slots.map((slot, index) => {
              const isSelected = selectedSlot?.startTimeUtc === slot.startTimeUtc;
              const isAvailable = slot.isAvailable;

              return (
                <button
                  key={index}
                  type="button"
                  disabled={!isAvailable}
                  title={
                    isAvailable
                      ? `${slot.clientStartTimeFormatted} client time (${slot.agentStartTimeFormatted} in advisor local time)`
                      : slot.conflictReason || 'Slot unavailable'
                  }
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2 px-2 border text-center text-xs font-semibold transition-all relative group ${
                    isSelected
                      ? 'bg-foreground text-background border-foreground shadow-sm'
                      : isAvailable
                        ? 'bg-background hover:border-foreground border-border text-foreground hover:bg-muted/10'
                        : 'bg-card border-border/50 text-muted/30 cursor-not-allowed line-through'
                  }`}
                >
                  <span>{slot.clientStartTimeFormatted}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedSlot && (
        <div className="p-3 border border-accent/40 bg-accent/10 mb-4 text-xs text-foreground space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold uppercase tracking-wider text-[10px] text-accent flex items-center gap-1">
              <Check className="w-3 h-3 text-accent" /> Selected Window:
            </span>
            <span className="font-bold text-foreground">
              {selectedSlot.clientStartTimeFormatted} – {selectedSlot.clientEndTimeFormatted}
            </span>
          </div>
          <p className="text-[11px] text-muted">
            Advisor Local Time: <span className="font-semibold text-foreground/90">{selectedSlot.agentStartTimeFormatted} – {selectedSlot.agentEndTimeFormatted}</span> ({agent.timezone.replace('_', ' ')})
          </p>
        </div>
      )}

      <form onSubmit={handleBookSlot} className="space-y-3">
        {bookingError && (
          <div className="p-2.5 border border-red-200 bg-red-50 text-red-700 text-xs">
            {bookingError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              type="text"
              required
              placeholder="Your name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              required
              placeholder="you@email.com"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className={labelClass}>Phone</label>
            <input
              type="tel"
              required
              placeholder="+1 (555) 000-0000"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Showing Type</label>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setTourType('in_person')}
                className={`py-2 px-1 text-[10px] font-bold tracking-wider uppercase border transition-all ${
                  tourType === 'in_person'
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-muted border-border hover:text-foreground hover:border-foreground'
                }`}
              >
                In-Person
              </button>
              <button
                type="button"
                onClick={() => setTourType('virtual_video')}
                className={`py-2 px-1 text-[10px] font-bold tracking-wider uppercase border transition-all ${
                  tourType === 'virtual_video'
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-muted border-border hover:text-foreground hover:border-foreground'
                }`}
              >
                Virtual
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass}>Notes (Optional)</label>
          <textarea
            rows={2}
            placeholder="Special requests, specific questions…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </div>

        <button
          type="submit"
          disabled={!selectedSlot || submitting}
          className="group/btn relative w-full py-3 px-4 bg-foreground text-background font-bold text-xs tracking-widest uppercase overflow-hidden hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {submitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Securing Slot…
              </>
            ) : (
              'Confirm Showing Appointment'
            )}
          </span>
          <div className="absolute inset-0 bg-accent scale-x-0 group-hover/btn:scale-x-100 origin-center transition-transform duration-400 ease-out z-0" />
        </button>
      </form>
    </div>
  );
}
