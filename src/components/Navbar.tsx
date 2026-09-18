'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2 } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/listings', label: 'Properties' },
    { href: '/agents', label: 'Our Advisors' },
  ];

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 rounded-full bg-stone-900 flex items-center justify-center group-hover:bg-amber-900 transition-colors">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-semibold tracking-wide text-base text-stone-900">COGNIVELLE</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 block font-medium -mt-0.5">Realtors</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-stone-900 bg-stone-100'
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/listings"
          className="hidden sm:flex items-center px-5 py-2 rounded-full text-sm font-medium bg-stone-900 text-white hover:bg-stone-800 transition-colors"
        >
          View Properties
        </Link>
      </div>
    </header>
  );
}
