'use client';

import { useState, useEffect, useCallback } from 'react';
import { Booking, Agent } from '@/types/database';
import { POPULAR_TIMEZONES, formatZoned, getBrowserTimezone } from '@/lib/timezone-utils';
import { fromZonedTime } from 'date-fns-tz';
import {
  CalendarCheck,
  ShieldAlert,
  Globe,
  Filter,
  RefreshCw,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  // Timezone view switcher for admin
  const [viewTimezone, setViewTimezone] = useState<string>('America/New_York');

  // Filters
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('');

  // Conflict Simulator State
  const [simAgentId, setSimAgentId] = useState<string>('');
  const [simDate, setSimDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [simStartTime, setSimStartTime] = useState<string>('10:00');
  const [simDuration, setSimDuration] = useState<number>(45);
  const [simTesting, setSimTesting] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<{ conflict: boolean; message: string } | null>(null);

  useEffect(() => {
    setViewTimezone(getBrowserTimezone());
  }, []);

  const fetchBookingsAndAgents = useCallback(async () => {
    try {
      setLoading(true);
      const [bookingsRes, agentsRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/agents?includeInactive=true'),
      ]);

      const [bData, aData] = await Promise.all([
        bookingsRes.json(),
        agentsRes.json(),
      ]);

      setBookings(bData);
      setAgents(aData);
      if (aData.length > 0 && !simAgentId) {
        setSimAgentId(aData[0].id);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [simAgentId]);

  useEffect(() => {
    fetchBookingsAndAgents();
  }, [fetchBookingsAndAgents]);

  const handleUpdateStatus = async (id: string, status: Booking['status']) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Run the conflict simulation check
  const handleTestConflict = async () => {
    if (!simAgentId) return;
    setSimTesting(true);
    setSimResult(null);

    try {
      const agent = agents.find((a) => a.id === simAgentId);
      const agentTz = agent?.timezone || 'America/New_York';

      // Accurately convert the requested slot from Agent's local timezone into UTC
      const startUtcDate = fromZonedTime(`${simDate} ${simStartTime}:00`, agentTz);
      const endUtcDate = new Date(startUtcDate.getTime() + simDuration * 60 * 1000);
      const startUtc = startUtcDate.toISOString();
      const endUtc = endUtcDate.toISOString();

      // Submit test attempt
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: simAgentId,
          client_name: 'Conflict Test Client',
          client_email: 'test@conflict-simulator.local',
          client_phone: '+1 555-000-TEST',
          client_timezone: viewTimezone,
          start_time: startUtc,
          end_time: endUtc,
          tour_type: 'in_person',
          notes: 'Automated simulation test',
        }),
      });

      const data = await res.json();

      if (res.status === 409 || data.conflict) {
        setSimResult({
          conflict: true,
          message: data.error || 'Database GiST / Algorithm prevented booking collision: Slot overlaps an existing appointment!',
        });
      } else if (res.ok) {
        setSimResult({
          conflict: false,
          message: `Slot was vacant and has now been booked successfully (ID: ${data.id?.slice(0, 8)}...). The next booking during this time will now trigger a conflict!`,
        });
        fetchBookingsAndAgents();
      } else {
        setSimResult({
          conflict: true,
          message: data.error || 'Check failed',
        });
      }
    } catch (err: any) {
      setSimResult({
        conflict: true,
        message: err.message || 'Error running conflict test',
      });
    } finally {
      setSimTesting(false);
    }
  };

  // Pre-fill simulator with an existing booking's time to intentionally trigger a conflict demonstration
  const handleLoadConflictPreset = (b: Booking) => {
    setSimAgentId(b.agent_id);
    const dt = new Date(b.start_time);
    setSimDate(dt.toISOString().split('T')[0]);
    setSimStartTime(dt.toISOString().split('T')[1].slice(0, 5));
    setSimResult(null);
  };

  const filteredBookings = bookings.filter((b) => {
    if (selectedAgentFilter && b.agent_id !== selectedAgentFilter) return false;
    if (selectedStatusFilter && b.status !== selectedStatusFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs uppercase tracking-wider text-amber-400 font-semibold mb-1">
            <CalendarCheck className="w-4 h-4" />
            <span>Tour Showing & Concurrency Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Bookings & Slot Conflict Monitor
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Inspect showings, convert between timezones in real time, and verify PostgreSQL GiST exclusion locks.
          </p>
        </div>

        {/* Global Admin Timezone View Switcher */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center space-x-2.5">
          <Globe className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="text-xs">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Admin Viewer Timezone:</span>
            <select
              value={viewTimezone}
              onChange={(e) => setViewTimezone(e.target.value)}
              className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
            >
              {POPULAR_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value} className="bg-slate-950 text-white">
                  {tz.label} ({tz.offset})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Conflict Simulator Card */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Interactive Slot Conflict & Double-Booking Tester</h2>
              <p className="text-[11px] text-slate-400">
                Test the concurrency engine by attempting to insert an overlapping booking for an agent.
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
            GiST Kernel Guard
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Target Agent</label>
            <select
              value={simAgentId}
              onChange={(e) => setSimAgentId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.timezone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Date</label>
            <input
              type="date"
              value={simDate}
              onChange={(e) => setSimDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Time (Agent Local)</label>
            <input
              type="time"
              value={simStartTime}
              onChange={(e) => setSimStartTime(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Slot Duration</label>
            <select
              value={simDuration}
              onChange={(e) => setSimDuration(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>60 min</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleTestConflict}
              disabled={simTesting}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              {simTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking Collision...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Test Overlap Conflict</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Simulator Output */}
        {simResult && (
          <div
            className={`p-4 rounded-xl text-xs border flex items-start space-x-2.5 transition-all ${
              simResult.conflict
                ? 'bg-red-950/70 border-red-700 text-red-200'
                : 'bg-emerald-950/70 border-emerald-700 text-emerald-200'
            }`}
          >
            {simResult.conflict ? (
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">
                {simResult.conflict ? 'CONFLICT DETECTED & PREVENTED (HTTP 409)' : 'VACANT SLOT COMMITTED'}
              </p>
              <p className="mt-0.5 text-xs opacity-90 leading-relaxed">{simResult.message}</p>
            </div>
          </div>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-semibold">Filter Agent:</span>
            <select
              value={selectedAgentFilter}
              onChange={(e) => setSelectedAgentFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
            >
              <option value="">All Agents</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-semibold">Status:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white capitalize"
            >
              <option value="">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <button
          onClick={fetchBookingsAndAgents}
          className="text-xs text-slate-400 hover:text-white flex items-center space-x-1.5 self-end sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Bookings</span>
        </button>
      </div>

      {/* Bookings Table with Multi-Timezone Columns */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            <span>Loading appointments...</span>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No bookings found matching the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Client & Contact</th>
                  <th className="px-5 py-3.5">Agent & Local Time</th>
                  <th className="px-5 py-3.5">Admin Selected View Time</th>
                  <th className="px-5 py-3.5">Property / Tour Type</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions / Simulator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Client */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-white text-sm">{b.client_name}</div>
                      <div className="text-[11px] text-slate-400">{b.client_email}</div>
                      <div className="text-[10px] text-slate-500">{b.client_phone}</div>
                      <span className="inline-block text-[10px] font-mono text-amber-400/80 mt-1">
                        Client Tz: {b.client_timezone}
                      </span>
                    </td>

                    {/* Agent & Agent's Local Time */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-amber-300">{b.agent?.name || 'Assigned Agent'}</div>
                      <div className="font-mono text-slate-300 text-xs mt-0.5">
                        {formatZoned(b.start_time, b.agent?.timezone || 'America/New_York', 'MMM d, h:mm a')}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Agent Tz: {b.agent?.timezone || 'UTC'}
                      </div>
                    </td>

                    {/* Admin Timezone Column */}
                    <td className="px-5 py-4 font-mono">
                      <div className="text-emerald-400 font-bold">
                        {formatZoned(b.start_time, viewTimezone, 'EEE, MMM d')}
                      </div>
                      <div className="text-slate-300 text-xs">
                        {formatZoned(b.start_time, viewTimezone, 'h:mm a')} - {formatZoned(b.end_time, viewTimezone, 'h:mm a')}
                      </div>
                      <span className="text-[10px] text-slate-500 font-sans">{viewTimezone}</span>
                    </td>

                    {/* Property / Tour */}
                    <td className="px-5 py-4">
                      <div className="text-white font-medium max-w-[180px] truncate">
                        {b.listing?.title || 'Private 1-on-1 Consultation'}
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-slate-950 border border-slate-800 mt-1 capitalize text-slate-400">
                        {b.tour_type.replace('_', ' ')}
                      </span>
                      {b.notes && (
                        <p className="text-[10px] text-slate-500 mt-1 max-w-[180px] truncate" title={b.notes}>
                          Note: {b.notes}
                        </p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : b.status === 'cancelled'
                            ? 'bg-red-950 text-red-400 border border-red-800/60'
                            : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right space-y-1.5">
                      <div className="flex items-center justify-end space-x-1.5">
                        {b.status !== 'confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                            className="px-2 py-1 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-[10px] font-semibold"
                          >
                            Confirm
                          </button>
                        )}
                        {b.status !== 'cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                            className="px-2 py-1 rounded bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 text-[10px] font-semibold"
                          >
                            Cancel
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => handleLoadConflictPreset(b)}
                        className="text-[10px] text-amber-400 hover:text-amber-300 underline block ml-auto"
                        title="Load this exact slot into simulator to test GiST conflict detection"
                      >
                        ⚡ Test Overlap In Simulator
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
