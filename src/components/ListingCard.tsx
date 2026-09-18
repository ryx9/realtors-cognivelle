import Link from 'next/link';
import { Listing } from '@/types/database';
import { Bed, Bath, Maximize2, MapPin, Calendar } from 'lucide-react';

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
    <div className="group bg-white border border-stone-200 hover:border-stone-300 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 flex flex-col hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-60 w-full overflow-hidden bg-stone-100">
        <img
          src={primaryImage}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent" />

        <div className="absolute top-3 left-3 flex space-x-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/95 text-stone-700 shadow-sm">
            {listing.property_type}
          </span>
          {listing.featured && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-stone-900 text-white shadow-sm">
              Featured
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <span className="text-2xl font-semibold text-white drop-shadow-md">
            {formattedPrice}
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-base font-semibold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-1">
            {listing.title}
          </h3>
          <p className="text-xs text-stone-500 flex items-center space-x-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="truncate">{listing.address}, {listing.city}, {listing.state}</span>
          </p>

          <div className="grid grid-cols-3 gap-2 mt-4 py-2.5 border-y border-stone-100 text-stone-600 text-xs">
            <div className="flex items-center space-x-1.5">
              <Bed className="w-4 h-4 text-stone-400" />
              <span>{listing.bedrooms} Beds</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Bath className="w-4 h-4 text-stone-400" />
              <span>{listing.bathrooms} Baths</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Maximize2 className="w-4 h-4 text-stone-400" />
              <span>{listing.sqft.toLocaleString()} sqft</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {listing.agent && (
            <div className="flex items-center space-x-2.5">
              <img
                src={listing.agent.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                alt={listing.agent.name}
                className="w-7 h-7 rounded-full object-cover border border-stone-200"
              />
              <div className="text-left">
                <span className="text-xs font-medium text-stone-700 block">{listing.agent.name}</span>
                <span className="text-[10px] text-stone-400">{listing.agent.title}</span>
              </div>
            </div>
          )}

          <Link
            href={`/listings/${listing.id}`}
            className="w-full py-2.5 px-4 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs transition-all flex items-center justify-center space-x-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>View Property</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
