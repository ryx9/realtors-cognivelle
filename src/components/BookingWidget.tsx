'use client';

import { useState, useEffect, useCallback } from 'react';
import { Agent, GeneratedSlot, TourType } from '@/types/database';
import { POPULAR_TIMEZONES, getBrowserTimezone, formatZoned } from '@/lib/timezone-utils';
import { Calendar, Clock, Globe, CheckCircle2, User, Mail, Phone, Video, MapPin, AlertCircle, RefreshCw } from 'lucide-react';

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

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [tourType, setTourType] = useState<TourType>('in_person');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  useEffect(() => {
    setClientTimezone(getBrowserTimezone());
  }, []);

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
    fetchSlots();
  }, [fetchSlots]);

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
          setBookingError(
            `This time is no longer available. Please choose a different slot.`
          );
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
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-semibold text-center text-stone-900 mb-2">Appointment Confirmed</h3>
        <p className="text-sm text-stone-500 text-center mb-6">
          Your showing has been scheduled. A confirmation will be sent to your email shortly.
        </p>

        <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 space-y-3 mb-6 text-sm">
          {listingTitle && (
            <div className="flex justify-between border-b border-stone-200 pb-2">
              <span className="text-stone-500">Property</span>
              <span className="text-stone-900 font-medium text-right max-w-[200px] truncate">{listingTitle}</span>
            </div>
          )}
          <div className="flex justify-between border-b border-stone-200 pb-2">
            <span className="text-stone-500">Advisor</span>
            <span className="text-stone-900 font-medium">{agent.name}</span>
          </div>
          <div className="flex justify-between border-b border-stone-200 pb-2">
            <span className="text-stone-500">Date & Time</span>
            <span className="text-stone-900 font-medium">
              {formatZoned(bookingSuccess.start_time, clientTimezone, 'EEE, MMM d, yyyy h:mm a')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Type</span>
            <span className="text-stone-900 capitalize font-medium">{bookingSuccess.tour_type.replace('_', ' ')}</span>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="w-full py-3 px-4 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-medium transition-all text-sm"
        >
          Schedule Another Visit
        </button>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-7 shadow-sm">
      <div className="border-b border-stone-100 pb-4 mb-6">
        <h3 className="text-lg font-semibold text-stone-900 flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-amber-800" />
          <span>Schedule a Private Showing</span>
        </h3>
        <p className="text-sm text-stone-500 mt-1">
          With {agent.name}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1.5 flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <span>Preferred Date</span>
          </label>
          <input
            type="date"
            min={todayStr}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-stone-400 transition-colors"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-stone-600 flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-stone-400" />
              <span>Your Timezone</span>
            </label>
            <button
              type="button"
              onClick={() => setClientTimezone(getBrowserTimezone())}
              className="text-[11px] text-amber-800 hover:text-amber-900 underline"
            >
              Auto-detect
            </button>
          </div>
          <select
            value={clientTimezone}
            onChange={(e) => setClientTimezone(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-stone-400 transition-colors truncate"
          >
            {POPULAR_TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label} ({tz.offset})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-stone-600 flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>Available Times</span>
          </label>
          {loadingSlots && (
            <div className="flex items-center space-x-1.5 text-xs text-stone-500">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Loading...</span>
            </div>
          )}
        </div>

        {slotError && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{slotError}</span>
          </div>
        )}

        {!loadingSlots && slots.length === 0 && (
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 text-center text-xs text-stone-500">
            No availability on this date. Please try another day.
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
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-stone-900 text-white border-stone-900 font-medium'
                      : isAvailable
                      ? 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700 hover:border-stone-300'
                      : 'bg-stone-50/50 border-stone-100 text-stone-300 cursor-not-allowed line-through'
                  }`}
                >
                  <span className="text-xs font-medium">{slot.clientStartTimeFormatted}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedSlot && (
        <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl mb-6 text-xs text-stone-700">
          <span className="font-medium text-amber-900">Selected: </span>
          {selectedSlot.clientStartTimeFormatted} – {selectedSlot.clientEndTimeFormatted}
        </div>
      )}

      <form onSubmit={handleBookSlot} className="space-y-4">
        {bookingError && (
          <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs">
            {bookingError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="Your name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="you@email.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Phone</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="tel"
                required
                placeholder="+1 (555) 000-0000"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Showing Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTourType('in_person')}
                className={`py-2 px-2 rounded-xl text-xs font-medium flex items-center justify-center space-x-1 border transition-all ${
                  tourType === 'in_person'
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-50 text-stone-500 border-stone-200 hover:text-stone-700'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>In-Person</span>
              </button>
              <button
                type="button"
                onClick={() => setTourType('virtual_video')}
                className={`py-2 px-2 rounded-xl text-xs font-medium flex items-center justify-center space-x-1 border transition-all ${
                  tourType === 'virtual_video'
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-50 text-stone-500 border-stone-200 hover:text-stone-700'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Virtual Tour</span>
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Notes (Optional)</label>
          <textarea
            rows={2}
            placeholder="Any questions or special requests..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={!selectedSlot || submitting}
          className="w-full py-3 px-4 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
        >
          {submitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Confirming...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Appointment</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
