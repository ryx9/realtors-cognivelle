import Link from 'next/link';
import { ArrowRight, Mail, ShieldCheck, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-foreground text-background/70 text-sm mt-auto border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 mb-10 sm:mb-12">
          {/* Brand & Mission */}
          <div className="md:col-span-4 lg:col-span-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-display italic text-base font-bold text-accent px-1.5 py-0.5 border border-accent/40">
                CVR
              </span>
              <span className="font-sans font-black tracking-[0.15em] text-base text-background uppercase">
                Cognivelle
              </span>
            </div>
            <p className="text-[10px] tracking-widest uppercase text-background/40 mb-4 font-bold">
              Private Real Estate Brokerage · Est. 2018
            </p>
            <p className="text-xs leading-relaxed text-background/60 max-w-sm mb-6">
              A private brokerage representing discerning global buyers and sellers in the acquisition of premier residences across New York, Los Angeles, London, and Tokyo.
            </p>

            <div className="flex items-center gap-2 text-xs text-background/50">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span>Licensed &amp; Bound by Global Fiduciary Standards</span>
            </div>
          </div>

          {/* Direct Navigation */}
          <div className="md:col-span-2 lg:col-span-2">
            <h4 className="text-background text-[11px] tracking-widest uppercase font-bold mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-accent" />
              Portals
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/" className="hover:text-background transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link href="/listings" className="hover:text-background transition-colors">
                  All Properties
                </Link>
              </li>
              <li>
                <Link href="/agents" className="hover:text-background transition-colors">
                  Lead Advisors
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-background text-background/40 transition-colors">
                  Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Hubs / Contact */}
          <div className="md:col-span-3 lg:col-span-2">
            <h4 className="text-background text-[11px] tracking-widest uppercase font-bold mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-accent" />
              Offices
            </h4>
            <ul className="space-y-2.5 text-xs text-background/60">
              <li className="hover:text-background transition-colors">432 Park Ave, New York</li>
              <li className="hover:text-background transition-colors">Pacific Coast Hwy, Malibu</li>
              <li className="hover:text-background transition-colors">South Audley St, London</li>
              <li className="hover:text-background transition-colors">Roppongi Hills, Tokyo</li>
            </ul>
          </div>

          {/* Private Briefing Newsletter */}
          <div className="md:col-span-3 lg:col-span-3">
            <h4 className="text-background text-[11px] tracking-widest uppercase font-bold mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-accent" />
              Private Dispatch
            </h4>
            <p className="text-xs text-background/60 leading-relaxed mb-3">
              Receive confidential monthly market dossiers and off-market announcements.
            </p>
            <div className="flex gap-1.5">
              <input
                type="email"
                placeholder="advisor@firm.com"
                className="w-full bg-background/10 border border-background/20 px-3 py-2 text-xs text-background placeholder:text-background/40 focus:outline-none focus:border-accent"
              />
              <button
                type="button"
                className="px-3 py-2 bg-accent text-background font-bold text-xs uppercase hover:bg-accent/80 transition-colors flex items-center justify-center shrink-0"
                aria-label="Subscribe"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Hairline Bottom Bar */}
        <div className="border-t border-background/10 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-background/40">
          <p>© {new Date().getFullYear()} Cognivelle Realtors Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-background/60 transition-colors cursor-pointer">Privacy &amp; Terms</span>
            <span>·</span>
            <span className="hover:text-background/60 transition-colors cursor-pointer">Equal Housing Opportunity</span>
            <span>·</span>
            <span className="text-accent font-semibold">Global Fiduciary</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

