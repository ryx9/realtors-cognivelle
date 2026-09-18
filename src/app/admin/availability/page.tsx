'use client';

import { useState, useEffect } from 'react';
import { Agent, AgentAvailability } from '@/types/database';
import { Clock, Users, Save, CheckCircle, AlertCircle, RefreshCw, Globe } from 'lucide-react';

const DAYS_OF_WEEK = [
  { index: 1, label: 'Monday' },
  { index: 2, label: 'Tuesday' },
  { index: 3, label: 'Wednesday' },
  { index: 4, label: 'Thursday' },
  { index: 5, label: 'Friday' },
  { index: 6, label: 'Saturday' },
  { index: 0, label: 'Sunday' },
];

export default function AdminAvailabilityPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Schedules state keyed by day_of_week
  const [schedules, setSchedules] = useState<{
    [dow: number]: {
      start_time: string;
      end_time: string;
      slot_duration_minutes: number;
      is_active: boolean;
    };
  }>({});

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch('/api/agents?includeInactive=true');
        const data = await res.json();
        setAgents(data);
        if (data.length > 0) {
          setSelectedAgentId(data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  useEffect(() => {
    if (!selectedAgentId) return;

    const fetchAvailability = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/availability?agentId=${selectedAgentId}`);
        const data: AgentAvailability[] = await res.json();

        const map: typeof schedules = {};
        DAYS_OF_WEEK.forEach((d) => {
          const existing = data.find((item) => item.day_of_week === d.index);
          if (existing) {
            map[d.index] = {
              start_time: existing.start_time.slice(0, 5),
              end_time: existing.end_time.slice(0, 5),
              slot_duration_minutes: existing.slot_duration_minutes,
              is_active: existing.is_active,
            };
          } else {
            // default inactive or active for weekdays
            map[d.index] = {
              start_time: '09:00',
              end_time: '17:00',
              slot_duration_minutes: 45,
              is_active: d.index >= 1 && d.index <= 5,
            };
          }
        });

        setSchedules(map);
      } catch (err: any) {
        setNotification({ type: 'error', message: 'Failed to load availability' });
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedAgentId]);

  const handleSave = async () => {
    if (!selectedAgentId) return;
    setSaving(true);
    setNotification(null);

    try {
      const payload = Object.entries(schedules).map(([dow, val]) => ({
        day_of_week: parseInt(dow, 10),
        start_time: `${val.start_time}:00`,
        end_time: `${val.end_time}:00`,
        slot_duration_minutes: Number(val.slot_duration_minutes),
        is_active: val.is_active,
      }));

      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgentId,
          schedules: payload,
        }),
      });

      if (!res.ok) throw new Error('Failed to save schedules');

      setNotification({
        type: 'success',
        message: 'Agent weekly working hours updated successfully!',
      });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center space-x-2 text-xs uppercase tracking-wider text-amber-400 font-semibold mb-1">
          <Clock className="w-4 h-4" />
          <span>Agent Schedule Configuration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Agent Weekly Working Hours & Slot Duration
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Working hours are interpreted strictly in the agent&apos;s local timezone and dynamically localized for world clients.
        </p>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            notification.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-red-950/60 border-red-800 text-red-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Select Agent Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Agent to Configure</label>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.timezone})
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedAgent && (
          <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <Globe className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Timezone Context:</span>
            <span className="text-amber-400 font-mono font-semibold">{selectedAgent.timezone}</span>
          </div>
        )}
      </div>

      {/* Schedules Form Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Daily Operational Windows</h2>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center space-x-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Working Hours</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            <span>Loading agent schedule...</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {DAYS_OF_WEEK.map((d) => {
              const current = schedules[d.index] || {
                start_time: '09:00',
                end_time: '17:00',
                slot_duration_minutes: 45,
                is_active: false,
              };

              return (
                <div
                  key={d.index}
                  className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    current.is_active ? 'bg-slate-900' : 'bg-slate-950/40 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-3 w-40">
                    <input
                      type="checkbox"
                      id={`day-${d.index}`}
                      checked={current.is_active}
                      onChange={(e) =>
                        setSchedules((prev) => ({
                          ...prev,
                          [d.index]: { ...current, is_active: e.target.checked },
                        }))
                      }
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                    <label htmlFor={`day-${d.index}`} className="text-sm font-bold text-white cursor-pointer">
                      {d.label}
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400">Start:</span>
                      <input
                        type="time"
                        value={current.start_time}
                        disabled={!current.is_active}
                        onChange={(e) =>
                          setSchedules((prev) => ({
                            ...prev,
                            [d.index]: { ...current, start_time: e.target.value },
                          }))
                        }
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white disabled:opacity-40"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400">End:</span>
                      <input
                        type="time"
                        value={current.end_time}
                        disabled={!current.is_active}
                        onChange={(e) =>
                          setSchedules((prev) => ({
                            ...prev,
                            [d.index]: { ...current, end_time: e.target.value },
                          }))
                        }
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white disabled:opacity-40"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400">Slot Duration:</span>
                      <select
                        value={current.slot_duration_minutes}
                        disabled={!current.is_active}
                        onChange={(e) =>
                          setSchedules((prev) => ({
                            ...prev,
                            [d.index]: {
                              ...current,
                              slot_duration_minutes: parseInt(e.target.value, 10),
                            },
                          }))
                        }
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white disabled:opacity-40"
                      >
                        <option value={30}>30 Minutes</option>
                        <option value={45}>45 Minutes</option>
                        <option value={60}>60 Minutes</option>
                        <option value={90}>90 Minutes</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        current.is_active
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {current.is_active ? 'Available' : 'Day Off'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
