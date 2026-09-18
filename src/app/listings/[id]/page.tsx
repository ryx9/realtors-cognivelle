import { getListingById } from '@/lib/data-service';
import BookingWidget from '@/components/BookingWidget';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Bed, Bath, Maximize2, MapPin, ArrowLeft, Clock, Mail, Phone } from 'lucide-react';

export const revalidate = 0;

export default async function ListingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const listing = await getListingById(params.id);

  if (!listing) {
    notFound();
  }

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(listing.price);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Back Link */}
        <div className="mb-6">
          <Link
            href="/listings"
            className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to all properties</span>
          </Link>
        </div>

        {/* Title & Price Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                {listing.property_type}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-slate-900 text-emerald-400 border border-emerald-500/30">
                {listing.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              {listing.title}
            </h1>
            <p className="flex items-center space-x-1 text-sm text-slate-400 mt-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{listing.address}, {listing.city}, {listing.state} {listing.zip_code}</span>
            </p>
          </div>

          <div className="lg:text-right">
            <span className="text-xs uppercase tracking-widest text-slate-400 block font-semibold">Listing Price</span>
            <span className="text-3xl sm:text-4xl font-black text-amber-400">
              {formattedPrice}
            </span>
          </div>
        </div>

        {/* Image Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900">
          <div className="lg:col-span-2 relative h-[380px] sm:h-[480px]">
            <img
              src={listing.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200'}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 p-4">
            {listing.images.slice(1, 3).map((img, i) => (
              <div key={i} className="relative h-44 sm:h-56 lg:h-[224px] rounded-2xl overflow-hidden">
                <img
                  src={img}
                  alt={`${listing.title} photo ${i + 2}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid: Specs & Description on Left, Booking Engine on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Property Info & Agent Bio */}
          <div className="lg:col-span-7 space-y-8">
            {/* Specs Bar */}
            <div className="grid grid-cols-3 gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400">
                  <Bed className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Bedrooms</span>
                  <span className="text-base font-bold text-white">{listing.bedrooms} Beds</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400">
                  <Bath className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Bathrooms</span>
                  <span className="text-base font-bold text-white">{listing.bathrooms} Baths</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400">
                  <Maximize2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Living Space</span>
                  <span className="text-base font-bold text-white">{listing.sqft.toLocaleString()} sqft</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4">Property Description</h2>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {listing.description || 'Exclusive architectural residence with state-of-the-art finishes, premium location, and luxury comfort.'}
              </p>
            </div>

            {/* Assigned Listing Agent Card */}
            {listing.agent && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
                <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold block mb-2">
                  Dedicated Showing Specialist
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
                  <img
                    src={listing.agent.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                    alt={listing.agent.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-white">{listing.agent.name}</h3>
                    <p className="text-xs text-amber-400/90 font-medium">{listing.agent.title}</p>
                    <div className="flex items-center space-x-2 mt-1.5 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Operational Base:</span>
                      <strong className="text-slate-200 font-mono">{listing.agent.timezone}</strong>
                    </div>
                  </div>
                </div>

                {listing.agent.bio && (
                  <p className="text-xs text-slate-400 mt-4 leading-relaxed border-t border-slate-800/80 pt-4">
                    {listing.agent.bio}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs text-slate-300">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{listing.agent.email}</span>
                  </div>
                  {listing.agent.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{listing.agent.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Multi-Timezone Booking Engine */}
          <div className="lg:col-span-5">
            {listing.agent ? (
              <div className="sticky top-24">
                <BookingWidget
                  agent={listing.agent}
                  listingId={listing.id}
                  listingTitle={listing.title}
                />
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
                No agent assigned to this listing yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
