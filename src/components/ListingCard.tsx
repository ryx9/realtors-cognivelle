'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Listing } from '@/types/database';
import { Bed, Bath, Maximize2, MapPin, ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';

export default function ListingCard({ listing }: { listing: Listing }) {
  const images = listing.images && listing.images.length > 0
    ? listing.images
    : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200'];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(listing.price);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const selectImage = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Symmetrical slide variants
  const slideVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
      scale: 1.02,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 350, damping: 30 },
        opacity: { duration: 0.25 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -40 : 40,
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: 'spring' as const, stiffness: 350, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  };


  return (
    <div className="group bg-card border border-border hover:border-foreground/30 transition-all duration-300 flex flex-col h-full relative">
      {/* Media / Carousel Viewport */}
      <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-muted/20 select-none">
        <Link href={`/listings/${listing.id}`} className="block w-full h-full">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              alt={`${listing.title} - photo ${currentIndex + 1}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent pointer-events-none" />
        </Link>

        {/* Carousel Navigation Arrows (Visible on hover & touch) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              aria-label="Previous photo"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background/85 hover:bg-background text-foreground backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 transition-all duration-200 shadow-md hover:scale-110 z-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextImage}
              aria-label="Next photo"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background/85 hover:bg-background text-foreground backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 transition-all duration-200 shadow-md hover:scale-110 z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Symmetrical Dot Indicators */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-foreground/40 backdrop-blur-sm px-2 py-1 rounded-full">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => selectImage(e, i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentIndex ? 'w-4 bg-background' : 'w-1.5 bg-background/50 hover:bg-background/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <span className="px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase bg-background/90 text-foreground backdrop-blur-sm border border-border/40">
            {listing.property_type}
          </span>
          {listing.featured && (
            <span className="px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase bg-accent text-background flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              Featured
            </span>
          )}
        </div>

        {/* Slide Counter on Hover */}
        {images.length > 1 && (
          <div className="absolute top-2.5 right-2.5 text-[10px] font-semibold text-background bg-foreground/60 backdrop-blur-sm px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            {currentIndex + 1}/{images.length}
          </div>
        )}

        {/* Price Tag pinned to bottom left of media */}
        <div className="absolute bottom-2.5 left-3 z-10 pointer-events-none">
          <span className="font-display font-extrabold text-xl sm:text-2xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            {formattedPrice}
          </span>
        </div>
      </div>

      {/* Card Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3.5">
        <div>
          <Link href={`/listings/${listing.id}`}>
            <h3 className="font-display text-base font-bold text-foreground group-hover:text-accent transition-colors line-clamp-1">
              {listing.title}
            </h3>
          </Link>
          <div className="flex items-center gap-1 text-xs text-muted mt-1 truncate">
            <MapPin className="w-3 h-3 text-accent shrink-0" />
            <span className="truncate">{listing.address}, {listing.city}, {listing.state}</span>
          </div>

          {/* Symmetrical 3-Column Metric Ribbon */}
          <div className="grid grid-cols-3 border-y border-border/80 my-3.5 py-2 text-center text-xs">
            <div className="flex items-center justify-center gap-1 text-muted">
              <Bed className="w-3.5 h-3.5 text-accent/80" />
              <span className="font-semibold text-foreground">{listing.bedrooms}</span>
              <span className="text-[10px] uppercase">bd</span>
            </div>
            <div className="flex items-center justify-center gap-1 border-x border-border/80 text-muted">
              <Bath className="w-3.5 h-3.5 text-accent/80" />
              <span className="font-semibold text-foreground">{listing.bathrooms}</span>
              <span className="text-[10px] uppercase">ba</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-muted">
              <Maximize2 className="w-3.5 h-3.5 text-accent/80" />
              <span className="font-semibold text-foreground">{listing.sqft.toLocaleString()}</span>
              <span className="text-[10px] uppercase">sf</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {listing.agent && (
            <div className="flex items-center gap-2.5">
              <img
                src={listing.agent.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                alt={listing.agent.name}
                className="w-7 h-7 object-cover border border-border grayscale group-hover:grayscale-0 transition-all duration-300 shrink-0"
              />
              <div className="truncate text-left">
                <span className="text-xs font-semibold text-foreground block truncate">{listing.agent.name}</span>
                <span className="text-[10px] text-muted block truncate font-medium">Exclusive Advisor</span>
              </div>
            </div>
          )}

          {/* Symmetrical Action Button matching hero */}
          <Link
            href={`/listings/${listing.id}`}
            className="group/btn relative w-full py-2.5 px-4 bg-foreground text-background text-xs font-bold tracking-widest uppercase overflow-hidden text-center flex items-center justify-center gap-1.5"
          >
            <span className="relative z-10 group-hover/btn:text-background transition-colors duration-300 flex items-center gap-1.5">
              View Property
              <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 bg-accent scale-x-0 group-hover/btn:scale-x-100 origin-center transition-transform duration-400 ease-out z-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}

