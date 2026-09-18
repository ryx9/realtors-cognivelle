'use client';

import { useState, useEffect, useCallback } from 'react';
import { Agent, GeneratedSlot, TourType } from '@/types/database';
import { POPULAR_TIMEZONES, getBrowserTimezone, formatZoned } from '@/lib/timezone-utils';
import { Calendar, Clock, Globe, ShieldAlert, CheckCircle2, User, Mail, Phone, Video, MapPin, AlertCircle, RefreshCw } from 'lucide-react';

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
  // Default date: tomorrow
  const getTomorrowDateStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTomorrowDateStr());
  const [clientTimezone, setClientTimezone] = useState<string>('America/New_York');
  const [slots, setSlots] = useState<GeneratedSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<GeneratedSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [slotError, setSlotError] = useState<string | null>(null);

  // Form State
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [tourType, setTourType] = useState<TourType>('in_person');
  const [notes, setNotes] = useState('');

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  // Auto-detect client timezone on mount
  useEffect(() => {
    const detected = getBrowserTimezone();
    setClientTimezone(detected);
  }, []);

  // Fetch slots whenever agent, date, or client timezone changes
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
        throw new Error(data.error || 'Failed to retrieve available slots');
      }

      setSlots(data.slots || []);
    } catch (err: any) {
      setSlotError(err.message || 'Error fetching slots');
    } finally {
      setLoadingSlots(false);
    }
  }, [agent?.id, selectedDate, clientTimezone]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleBookSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setBookingError('Please choose an available appointment slot');
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
          // SLOT CONFLICT!
          setBookingError(
            `SLOT CONFLICT PREVENTED: This slot was just booked or overlaps with an existing showing for ${agent.name}. Please select a different time slot.`
          );
          // Refresh slots to show newly booked state
          fetchSlots();
          return;
        }
        throw new Error(data.error || 'Failed to complete booking');
      }

      setBookingSuccess(data);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setBookingError(err.message || 'Failed to book slot');
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
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-100">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-center text-white mb-2">Showing Confirmed!</h3>
        <p className="text-sm text-slate-400 text-center mb-6">
          Your appointment has been securely committed and locked against slot conflicts.
        </p>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 mb-6 text-xs">
          {listingTitle && (
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Property:</span>
              <span className="text-white font-medium text-right max-w-[200px] truncate">{listingTitle}</span>
            </div>
          )}
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Agent:</span>
            <span className="text-amber-400 font-medium">{agent.name} ({agent.timezone})</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Your Time ({clientTimezone}):</span>
            <span className="text-emerald-400 font-mono font-medium">
              {formatZoned(bookingSuccess.start_time, clientTimezone, 'EEE, MMM d, yyyy h:mm a')}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Agent Local Time:</span>
            <span className="text-white font-mono font-medium">
              {formatZoned(bookingSuccess.start_time, agent.timezone, 'EEE, MMM d, yyyy h:mm a')}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Type:</span>
            <span className="text-white capitalize font-medium">{bookingSuccess.tour_type.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Confirmation ID:</span>
            <span className="text-slate-400 font-mono text-[11px]">{bookingSuccess.id.slice(0, 8)}...</span>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-lg shadow-amber-500/20 text-sm"
        >
          Book Another Tour
        </button>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <span>Schedule a Tour</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            With <span className="text-amber-400 font-medium">{agent.name}</span>
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">Agent Base</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-amber-300 border border-slate-700">
            {agent.timezone.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Date & Client Timezone Picker Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Select Date</span>
          </label>
          <input
            type="date"
            min={todayStr}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        {/* Client Timezone */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>Your Timezone</span>
            </label>
            <button
              type="button"
              onClick={() => setClientTimezone(getBrowserTimezone())}
              className="text-[11px] text-amber-400 hover:text-amber-300 underline"
            >
              Auto-detect
            </button>
          </div>
          <select
            value={clientTimezone}
            onChange={(e) => setClientTimezone(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors truncate"
          >
            {POPULAR_TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value} className="bg-slate-950 text-white">
                {tz.label} ({tz.offset})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timezone synchronicity indicator */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 mb-6 flex items-start space-x-2.5 text-xs text-slate-400">
        <Globe className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-slate-300 font-medium">Cross-Timezone Synchronized</p>
          <p className="text-[11px] mt-0.5 leading-relaxed">
            Times below are calculated automatically from {agent.name}&apos;s local hours in{' '}
            <strong className="text-slate-200">{agent.timezone}</strong> and converted into your local timezone (
            <strong className="text-amber-400">{clientTimezone}</strong>).
          </p>
        </div>
      </div>

      {/* Available Slots Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Available Slots for Showing</span>
          </label>
          {loadingSlots && (
            <div className="flex items-center space-x-1.5 text-xs text-amber-400">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Calculating slots...</span>
            </div>
          )}
        </div>

        {slotError && (
          <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{slotError}</span>
          </div>
        )}

        {!loadingSlots && slots.length === 0 && (
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
            No scheduled showing hours found for this agent on the selected day. Please try another date (e.g. Monday - Friday).
          </div>
        )}

        {!loadingSlots && slots.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {slots.map((slot, index) => {
              const isSelected = selectedSlot?.startTimeUtc === slot.startTimeUtc;
              const isAvailable = slot.isAvailable;

              return (
                <button
                  key={index}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 font-bold scale-[1.02]'
                      : isAvailable
                      ? 'bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-200 hover:border-amber-400/50'
                      : 'bg-slate-950/30 border-slate-900/60 text-slate-600 cursor-not-allowed opacity-60 line-through'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-semibold">{slot.clientStartTimeFormatted}</span>
                    {!isAvailable && (
                      <span className="text-[9px] bg-red-950/80 text-red-400 px-1.5 py-0.5 rounded border border-red-800/50 uppercase">
                        Booked
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] mt-1 text-slate-400 opacity-90 truncate">
                    Agent: {slot.agentStartTimeFormatted}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Slot Summary */}
      {selectedSlot && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-6 flex items-center justify-between text-xs">
          <div>
            <span className="text-amber-400 font-semibold block">Selected Slot:</span>
            <span className="text-white font-mono">
              {selectedSlot.clientStartTimeFormatted} - {selectedSlot.clientEndTimeFormatted}
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 text-[11px] block">Agent Local:</span>
            <span className="text-slate-300 font-mono text-[11px]">
              {selectedSlot.agentStartTimeFormatted} - {selectedSlot.agentEndTimeFormatted}
            </span>
          </div>
        </div>
      )}

      {/* Booking Form */}
      <form onSubmit={handleBookSlot} className="space-y-4">
        {bookingError && (
          <div className="p-3.5 bg-red-950/60 border border-red-700/80 rounded-xl text-red-200 text-xs flex items-start space-x-2">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-300">Conflict / Booking Error</p>
              <p className="mt-0.5 leading-relaxed">{bookingError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. Eleanor Vance"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="eleanor@example.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="tel"
                required
                placeholder="+1 (555) 000-0000"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Showing Preference</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTourType('in_person')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 border transition-all ${
                  tourType === 'in_person'
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>In-Person</span>
              </button>
              <button
                type="button"
                onClick={() => setTourType('virtual_video')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 border transition-all ${
                  tourType === 'virtual_video'
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Live Video</span>
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Special Inquiries or Questions (Optional)</label>
          <textarea
            rows={2}
            placeholder="Tell the agent what features you'd like to inspect..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={!selectedSlot || submitting}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
        >
          {submitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Checking Concurrency & Locking Slot...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Lock Appointment</span>
            </>
          )}
        </button>

        <p className="text-[11px] text-slate-500 text-center flex items-center justify-center space-x-1">
          <span>Protected by PostgreSQL GiST exclusion lock against double-booking</span>
        </p>
      </form>
    </div>
  );
}
