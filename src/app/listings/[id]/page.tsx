import { getListingById } from '@/lib/data-service';
import BookingWidget from '@/components/BookingWidget';
import PropertyGallery from '@/components/PropertyGallery';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Bed, Bath, Maximize2, Building2, MapPin, ArrowLeft, Mail, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';

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

  const pricePerSqFt = Math.round(listing.price / (listing.sqft || 1));

  const highlights = [
    'Private Concierge & Keycard Access',
    'Custom Poliform Kitchen & Sub-Zero Appliances',
    'Architectural Floor-to-Ceiling Glazing',
    'Integrated Crestron Smart Home System',
    'Climate-Controlled Wine Storage',
    'Private Outdoor Terrace / Garden',
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/listings"
            className="group inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors tracking-widest uppercase font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to All Residences</span>
          </Link>
        </div>

        {/* Title & Price Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase bg-foreground text-background">
                {listing.property_type}
              </span>
              {listing.featured && (
                <span className="px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase bg-accent text-background">
                  Curated Collection
                </span>
              )}
            </div>

            <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black uppercase text-foreground leading-tight tracking-tight">
              {listing.title}
            </h1>

            <div className="flex items-center gap-1.5 text-xs text-muted mt-2">
              <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
              <span>{listing.address}, {listing.city}, {listing.state} {listing.zip_code}</span>
            </div>
          </div>

          <div className="lg:text-right shrink-0 bg-card border border-border p-3 sm:p-4">
            <span className="text-[10px] uppercase tracking-widest text-muted block mb-0.5 font-bold">
              Asking Price
            </span>
            <span className="font-display font-black text-2xl sm:text-4xl text-foreground block">
              {formattedPrice}
            </span>
            <span className="text-[11px] text-muted block font-medium">
              ${pricePerSqFt.toLocaleString()} / sq ft
            </span>
          </div>
        </div>

        {/* High-End Property Gallery Carousel with Fullscreen Lightbox */}
        <PropertyGallery images={listing.images} title={listing.title} />

        {/* Symmetrical 4-Metric Architectural Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border border-border divide-x divide-border bg-card mb-8 sm:mb-12 shadow-sm">
          <div className="p-4 sm:p-5 flex items-center gap-3">
            <Bed className="w-5 h-5 text-accent shrink-0" />
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted block font-bold">Bedrooms</span>
              <span className="font-display font-black text-lg sm:text-2xl text-foreground">{listing.bedrooms} Suites</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 flex items-center gap-3">
            <Bath className="w-5 h-5 text-accent shrink-0" />
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted block font-bold">Bathrooms</span>
              <span className="font-display font-black text-lg sm:text-2xl text-foreground">{listing.bathrooms} Baths</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 flex items-center gap-3">
            <Maximize2 className="w-5 h-5 text-accent shrink-0" />
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted block font-bold">Living Space</span>
              <span className="font-display font-black text-lg sm:text-2xl text-foreground">{listing.sqft.toLocaleString()} sf</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 flex items-center gap-3">
            <Building2 className="w-5 h-5 text-accent shrink-0" />
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted block font-bold">Residence Type</span>
              <span className="font-display font-black text-lg sm:text-2xl text-foreground">{listing.property_type}</span>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Left Column: Description, Features & Advisor Info */}
          <div className="lg:col-span-7 space-y-8">
            <div className="border border-border bg-card p-6 sm:p-8">
              <h2 className="font-display text-xl font-black uppercase text-foreground mb-4 pb-3 border-b border-border">
                Property Overview
              </h2>
              <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                {listing.description || 'An exceptional residence offering refined architecture, premium finishes, and an enviable location.'}
              </p>

              {/* Architectural Highlights */}
              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-muted mb-4">
                  Signature Architectural Features
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {highlights.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-foreground/90">
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Exclusive Listing Advisor Section */}
            {listing.agent && (
              <div className="border border-border bg-card p-6 sm:p-8">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                  <h2 className="font-display text-xl font-black uppercase text-foreground">
                    Exclusive Advisor
                  </h2>
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-accent">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Broker
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start gap-5">
                  <img
                    src={listing.agent.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                    alt={listing.agent.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover border border-border grayscale hover:grayscale-0 transition-all duration-500 shrink-0"
                  />
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-bold text-foreground">{listing.agent.name}</h3>
                    <p className="text-xs text-muted font-medium mt-0.5 mb-2">{listing.agent.title}</p>

                    {listing.agent.bio && (
                      <p className="text-xs text-muted leading-relaxed line-clamp-2 mb-3">
                        {listing.agent.bio}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-xs text-muted pt-2 border-t border-border">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-accent" />
                        <span>{listing.agent.email}</span>
                      </div>
                      {listing.agent.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-accent" />
                          <span>{listing.agent.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Booking Widget */}
          <div className="lg:col-span-5" id="booking-widget">
            {listing.agent ? (
              <div className="sticky top-20 bg-card">
                <BookingWidget
                  agent={listing.agent}
                  listingId={listing.id}
                  listingTitle={listing.title}
                />
              </div>
            ) : (
              <div className="border border-border p-8 text-center text-xs text-muted bg-card">
                Contact our concierge for private showings of this property.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Quick Booking Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur-md border-t border-border p-3 z-40 flex items-center justify-between gap-3 shadow-2xl">
        <div>
          <span className="text-[10px] text-muted block uppercase tracking-wider font-semibold">Asking Price</span>
          <span className="font-display font-black text-base text-foreground">{formattedPrice}</span>
        </div>
        <a
          href="#booking-widget"
          className="px-5 py-2.5 bg-accent text-background text-xs font-bold uppercase tracking-wider hover:bg-foreground transition-colors"
        >
          Book Showing
        </a>
      </div>
    </div>
  );
}

