'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Listing } from '@/types/database';
import ListingCard from '@/components/ListingCard';
import { ChevronLeft, ChevronRight, LayoutGrid, SlidersHorizontal } from 'lucide-react';

interface PropertyCarouselProps {
  listings: Listing[];
}

export default function PropertyCarousel({ listings }: PropertyCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');

  if (!listings || listings.length === 0) return null;

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % listings.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + listings.length) % listings.length);
  };

  const goToSlide = (idx: number) => {
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  // Symmetrical slide variants
  const slideVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.96,
      transition: {
        x: { type: 'spring' as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.25 },
        scale: { duration: 0.25 },
      },
    }),
  };


  return (
    <div className="w-full">
      {/* Header controls for carousel: View Mode & Navigation */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('carousel')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase font-bold tracking-wider transition-all duration-300 border ${
              viewMode === 'carousel'
                ? 'bg-foreground text-background border-foreground shadow-sm'
                : 'bg-background text-muted border-border hover:text-foreground hover:border-foreground'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Featured Showcase</span>
            <span className="sm:hidden">Carousel</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase font-bold tracking-wider transition-all duration-300 border ${
              viewMode === 'grid'
                ? 'bg-foreground text-background border-foreground shadow-sm'
                : 'bg-background text-muted border-border hover:text-foreground hover:border-foreground'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>
        </div>

        {/* Prev / Next controls for carousel mode */}
        {viewMode === 'carousel' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-muted mr-1">
              0{currentIndex + 1} <span className="text-border">/</span> 0{listings.length}
            </span>
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous property"
              className="w-8 h-8 sm:w-9 sm:h-9 border border-border hover:border-foreground bg-background hover:bg-foreground hover:text-background text-foreground flex items-center justify-center transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next property"
              className="w-8 h-8 sm:w-9 sm:h-9 border border-border hover:border-foreground bg-background hover:bg-foreground hover:text-background text-foreground flex items-center justify-center transition-all duration-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Carousel Mode View */}
      {viewMode === 'carousel' ? (
        <div className="relative">
          {/* Main animated stage */}
          <div className="overflow-hidden min-h-[460px]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full max-w-xl mx-auto"
              >
                <ListingCard listing={listings[currentIndex]} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Symmetrical Carousel Navigation Indicators */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {listings.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goToSlide(i)}
                aria-label={`Jump to property ${i + 1}`}
                className={`h-1.5 transition-all duration-300 rounded-full ${
                  i === currentIndex ? 'w-8 bg-foreground' : 'w-2 bg-border hover:bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Grid Mode View */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border"
        >
          {listings.map((listing) => (
            <div key={listing.id} className="bg-background">
              <ListingCard listing={listing} />
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
