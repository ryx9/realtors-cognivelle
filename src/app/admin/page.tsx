import { getAdminStats, getBookings } from '@/lib/data-service';
import { isSupabaseConfigured } from '@/lib/supabase';
import { formatZoned } from '@/lib/timezone-utils';
import Link from 'next/link';
import {
  Users,
  Building2,
  CalendarCheck,
  ShieldCheck,
  ArrowRight,
  Database,
  PlusCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [stats, bookings] = await Promise.all([
    getAdminStats(),
    getBookings(),
  ]);

  const recentBookings = bookings.slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Operations & Scheduling Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage agents, property alignments, cross-timezone booking slots, and conflict prevention.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Database:</span>
            <span className={`font-semibold ${isSupabaseConfigured ? 'text-emerald-400' : 'text-blue-400'}`}>
              {isSupabaseConfigured ? 'Supabase Connected' : 'In-Memory / Dev Mode'}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>GiST Conflict Guard Active</span>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Agents</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-white">{stats.totalAgents}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">In 4 Global Timezones</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Listings</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-white">{stats.totalListings}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Aligned to Agents</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Bookings</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-white">{stats.totalBookings}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">All tour requests</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirmed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-emerald-400">{stats.confirmedBookings}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Locked showings</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5 shadow-lg bg-gradient-to-br from-slate-900 to-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Conflicts Stopped</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-amber-400">{stats.conflictsPreventedCount}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Double-bookings blocked</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/agents"
          className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-400/50 rounded-2xl p-5 transition-all flex items-center justify-between shadow-md"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 text-blue-400 flex items-center justify-center transition-colors">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                Add Real Estate Agent
              </h3>
              <p className="text-xs text-slate-400">Configure timezone and working hours</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
        </Link>

        <Link
          href="/admin/listings"
          className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-400/50 rounded-2xl p-5 transition-all flex items-center justify-between shadow-md"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-400 flex items-center justify-center transition-colors">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                Add Property Listing
              </h3>
              <p className="text-xs text-slate-400">Align listing directly with an agent</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
        </Link>

        <Link
          href="/admin/bookings"
          className="group bg-slate-900/80 hover:bg-slate-900 border border-amber-500/30 hover:border-amber-400 rounded-2xl p-5 transition-all flex items-center justify-between shadow-md bg-gradient-to-r from-slate-900 to-amber-950/10"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-300">
                Slot Conflict Simulator
              </h3>
              <p className="text-xs text-slate-400">Test overlapping bookings & GiST safety</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Recent Bookings Table with Multi-Timezone Display */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <CalendarCheck className="w-4 h-4 text-amber-400" />
              <span>Recent Tour Appointments</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Showing cross-timezone synchronization between client requested times and agent local times.
            </p>
          </div>
          <Link
            href="/admin/bookings"
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
          >
            <span>View All Bookings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Assigned Agent</th>
                <th className="px-5 py-3">Property</th>
                <th className="px-5 py-3">Client Local Time</th>
                <th className="px-5 py-3">Agent Local Time</th>
                <th className="px-5 py-3">Mode</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-white">
                    <div>{b.client_name}</div>
                    <div className="text-[11px] text-slate-500">{b.client_email}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-amber-300 font-medium">{b.agent?.name || 'Agent'}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{b.agent?.timezone}</div>
                  </td>
                  <td className="px-5 py-3.5 max-w-[200px] truncate text-slate-400">
                    {b.listing?.title || 'Direct Consultation'}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-emerald-400">
                    {formatZoned(b.start_time, b.client_timezone, 'MMM d, h:mm a')}
                    <span className="block text-[10px] text-slate-500 font-sans">{b.client_timezone}</span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-300">
                    {formatZoned(b.start_time, b.agent?.timezone || 'America/New_York', 'MMM d, h:mm a')}
                    <span className="block text-[10px] text-slate-500 font-sans">
                      {b.agent?.timezone || 'UTC'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="capitalize px-2 py-0.5 rounded-full text-[11px] bg-slate-950 border border-slate-800">
                      {b.tour_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                      b.status === 'confirmed'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                        : b.status === 'cancelled'
                        ? 'bg-red-950 text-red-400 border border-red-800/60'
                        : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
