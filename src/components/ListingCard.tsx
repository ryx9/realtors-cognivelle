import Link from 'next/link';
import { Listing } from '@/types/database';
import { Bed, Bath, Maximize2, MapPin, Calendar, Clock } from 'lucide-react';

export default function ListingCard({ listing }: { listing: Listing }) {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(listing.price);

  const primaryImage = listing.images && listing.images.length > 0
    ? listing.images[0]
    : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200';

  return (
    <div className="group bg-slate-900 border border-slate-800 hover:border-amber-400/50 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1">
      {/* Property Image & Status Badges */}
      <div className="relative h-60 w-full overflow-hidden bg-slate-950">
        <img
          src={primaryImage}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex space-x-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-950/80 backdrop-blur-md text-amber-400 border border-amber-400/30">
            {listing.property_type}
          </span>
          {listing.featured && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500 text-slate-950 shadow-md">
              Featured
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
            listing.status === 'active'
              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
              : 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
          }`}>
            {listing.status}
          </span>
        </div>

        {/* Price Tag */}
        <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between">
          <span className="text-2xl font-black text-white drop-shadow-md">
            {formattedPrice}
          </span>
        </div>
      </div>

      {/* Details Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
            {listing.title}
          </h3>
          <p className="text-xs text-slate-400 flex items-center space-x-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{listing.address}, {listing.city}, {listing.state}</span>
          </p>

          {/* Specs */}
          <div className="grid grid-cols-3 gap-2 mt-4 py-2.5 border-y border-slate-800 text-slate-300 text-xs">
            <div className="flex items-center space-x-1.5">
              <Bed className="w-4 h-4 text-slate-400" />
              <span>{listing.bedrooms} Beds</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Bath className="w-4 h-4 text-slate-400" />
              <span>{listing.bathrooms} Baths</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Maximize2 className="w-4 h-4 text-slate-400" />
              <span>{listing.sqft.toLocaleString()} sqft</span>
            </div>
          </div>
        </div>

        {/* Assigned Agent & CTA */}
        <div className="space-y-3 pt-2">
          {listing.agent && (
            <div className="flex items-center justify-between bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
              <div className="flex items-center space-x-2">
                <img
                  src={listing.agent.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                  alt={listing.agent.name}
                  className="w-7 h-7 rounded-full object-cover border border-amber-400/40"
                />
                <div className="text-left">
                  <span className="text-xs font-semibold text-white block">{listing.agent.name}</span>
                  <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                    <Clock className="w-2.5 h-2.5 text-amber-400" />
                    <span>{listing.agent.timezone}</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          <Link
            href={`/listings/${listing.id}`}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white font-semibold text-xs transition-all flex items-center justify-center space-x-1.5 border border-slate-700 hover:border-amber-400"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>View & Book Showing</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
