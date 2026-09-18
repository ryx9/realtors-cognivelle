import Link from 'next/link';
import { Building2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 text-sm py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <Building2 className="w-4 h-4 text-stone-900" />
              </div>
              <span className="font-semibold tracking-wide text-white">COGNIVELLE</span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed max-w-xs">
              A premier global real estate brokerage dedicated to connecting discerning clients with exceptional properties and personalized advisory.
            </p>
          </div>

          <div>
            <h4 className="text-white font-medium text-xs uppercase tracking-widest mb-4">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/listings" className="hover:text-white transition-colors">Properties</Link></li>
              <li><Link href="/agents" className="hover:text-white transition-colors">Our Advisors</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium text-xs uppercase tracking-widest mb-4">Contact</h4>
            <ul className="space-y-2.5 text-sm">
              <li>hello@cognivelle.com</li>
              <li>+1 (212) 555-0198</li>
              <li>New York · London · Malibu · Tokyo</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Cognivelle Realtors. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Luxury Real Estate · Worldwide</p>
        </div>
      </div>
    </footer>
  );
}
