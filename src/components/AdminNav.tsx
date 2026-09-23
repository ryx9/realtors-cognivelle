'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  Clock,
  ArrowLeft,
  LogOut,
  User,
  Shield,
  Briefcase,
} from 'lucide-react';

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, profile, signOut, signInAsDemoRole } = useAuth();

  const isAgent = role === 'agent';

  const links = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    ...(isAgent ? [] : [{ href: '/admin/agents', label: 'Manage Advisors', icon: Users }]),
    { href: '/admin/listings', label: isAgent ? 'My Listings' : 'Manage Listings', icon: Building2 },
    { href: '/admin/bookings', label: isAgent ? 'My Appointments' : 'Bookings & Conflicts', icon: CalendarCheck },
    { href: '/admin/availability', label: isAgent ? 'My Schedule' : 'Working Schedules', icon: Clock },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/admin/login');
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-slate-800/80 gap-3">
          <div className="flex items-center space-x-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs border ${
                isAgent
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                  : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
              }`}
            >
              {isAgent ? <Briefcase className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  {isAgent ? 'Advisor Operations Portal' : 'Realtor Administration Portal'}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                    isAgent
                      ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}
                >
                  {role?.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isAgent
                  ? 'Personal Listings • Calendar Alignments • Local Availability'
                  : 'Multi-Agent Alignment • Timezones • GiST Concurrency Engine'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* User identification badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-medium text-slate-300 truncate max-w-[160px]">
                {profile?.full_name || user?.email}
              </span>
            </div>

            {/* Switch Role Quick Buttons */}
            <div className="hidden lg:flex items-center gap-1 text-[10px] bg-slate-950/80 border border-slate-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => signInAsDemoRole('admin')}
                className={`px-2 py-1 rounded font-bold uppercase tracking-wider transition-colors ${
                  role === 'admin'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch view to Administrator"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => signInAsDemoRole('agent')}
                className={`px-2 py-1 rounded font-bold uppercase tracking-wider transition-colors ${
                  role === 'agent'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch view to Licensed Advisor"
              >
                Advisor
              </button>
            </div>

            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </Link>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-red-900/50 bg-red-950/30 text-xs text-red-300 hover:bg-red-950/60 hover:text-red-200 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 py-2 overflow-x-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? isAgent
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                      : 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

