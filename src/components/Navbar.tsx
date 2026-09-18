'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Building2, ShieldCheck, Globe } from 'lucide-react';
import { getBrowserTimezone } from '@/lib/timezone-utils';

export default function Navbar() {
  const pathname = usePathname();
  const [clientTz, setClientTz] = useState('Detecting...');

  useEffect(() => {
    setClientTz(getBrowserTimezone());
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/listings', label: 'Properties' },
    { href: '/agents', label: 'Our Agents' },
  ];

  const isAdmin = pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-lg text-white">COGNIVELLE</span>
              <span className="text-xs uppercase tracking-widest text-amber-400 block font-semibold -mt-1">Realtors</span>
            </div>
          </Link>
        </div>

        {/* Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-amber-400 bg-slate-900 border border-amber-400/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions & Timezone Pill */}
        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs text-slate-400">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>Local:</span>
            <span className="text-slate-200 font-mono font-medium truncate max-w-[140px]">{clientTz}</span>
          </div>

          <Link
            href="/admin"
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-sm ${
              isAdmin
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/20'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Portal</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
