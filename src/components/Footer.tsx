import Link from 'next/link';
import { Building2, ShieldCheck, Database, CalendarCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-sm py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-slate-950" />
              </div>
              <span className="font-bold tracking-wider text-white">COGNIVELLE</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Coupling premier global real estate with high-precision multi-timezone tour scheduling and PostgreSQL GiST conflict prevention.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">System Features</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Double-Booking (GiST exclusion)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CalendarCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Multi-Timezone Agent Engine</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                <span>Supabase PostgreSQL Schema</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/listings" className="hover:text-amber-400 transition-colors">Browse Properties</Link></li>
              <li><Link href="/agents" className="hover:text-amber-400 transition-colors">Our Global Agents</Link></li>
              <li><Link href="/admin" className="hover:text-amber-400 transition-colors">Admin Dashboard</Link></li>
              <li><Link href="/admin/bookings" className="hover:text-amber-400 transition-colors">Booking Conflict Monitor</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Database & Schema</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Supabase SQL scripts and relational schema documented in README with ER diagram.
            </p>
            <div className="inline-flex items-center px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-amber-400 font-mono">
              supabase/schema.sql ready
            </div>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Cognivelle Realtors. Coupled with Supabase & Next.js App Router.</p>
          <p className="mt-2 sm:mt-0 font-mono text-[11px]">UTC Timestamps • Atomic Concurrency Safe</p>
        </div>
      </div>
    </footer>
  );
}
