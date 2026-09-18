import { getListingById } from '@/lib/data-service';
import BookingWidget from '@/components/BookingWidget';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Bed, Bath, Maximize2, MapPin, ArrowLeft, Mail, Phone } from 'lucide-react';

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
    <div className="min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/listings"
            className="inline-flex items-center space-x-1.5 text-xs text-stone-500 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to properties</span>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-100">
                {listing.property_type}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-light text-stone-900 tracking-tight">
              {listing.title}
            </h1>
            <p className="flex items-center space-x-1 text-sm text-stone-500 mt-2">
              <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
              <span>{listing.address}, {listing.city}, {listing.state} {listing.zip_code}</span>
            </p>
          </div>

          <div className="lg:text-right">
            <span className="text-xs uppercase tracking-widest text-stone-400 block font-medium">Asking Price</span>
            <span className="text-3xl sm:text-4xl font-semibold text-stone-900">
              {formattedPrice}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12 rounded-3xl overflow-hidden shadow-sm border border-stone-200 bg-white">
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-8">
            <div className="grid grid-cols-3 gap-4 p-6 bg-white border border-stone-200 rounded-2xl shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                  <Bed className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-stone-400 block">Bedrooms</span>
                  <span className="text-base font-semibold text-stone-900">{listing.bedrooms}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                  <Bath className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-stone-400 block">Bathrooms</span>
                  <span className="text-base font-semibold text-stone-900">{listing.bathrooms}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                  <Maximize2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-stone-400 block">Living Space</span>
                  <span className="text-base font-semibold text-stone-900">{listing.sqft.toLocaleString()} sqft</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-stone-900 mb-4">About This Property</h2>
              <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">
                {listing.description || 'An exceptional residence offering refined architecture, premium finishes, and an enviable location.'}
              </p>
            </div>

            {listing.agent && (
              <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <span className="text-xs uppercase tracking-widest text-amber-800 font-medium block mb-3">
                  Your Advisor
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
                  <img
                    src={listing.agent.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                    alt={listing.agent.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-stone-200"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-stone-900">{listing.agent.name}</h3>
                    <p className="text-sm text-stone-500">{listing.agent.title}</p>
                  </div>
                </div>

                {listing.agent.bio && (
                  <p className="text-sm text-stone-500 mt-4 leading-relaxed border-t border-stone-100 pt-4">
                    {listing.agent.bio}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm text-stone-600">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    <span>{listing.agent.email}</span>
                  </div>
                  {listing.agent.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span>{listing.agent.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

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
              <div className="bg-white border border-stone-200 rounded-2xl p-6 text-center text-stone-500 shadow-sm">
                Contact us for more information about this property.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
