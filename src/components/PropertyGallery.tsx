'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export default function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const galleryImages = images && images.length > 0
    ? images
    : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200'];

  const nextImage = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
  }, [galleryImages.length]);

  const prevImage = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  }, [galleryImages.length]);

  // Keyboard navigation for carousel & lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextImage, prevImage]);

  // Symmetrical slide variants
  const slideVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0,
      scale: 1.02,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 320, damping: 32 },
        opacity: { duration: 0.28 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: 'spring' as const, stiffness: 320, damping: 32 },
        opacity: { duration: 0.2 },
      },
    }),
  };


  return (
    <div className="w-full select-none mb-8 sm:mb-12">
      {/* Main Image Stage */}
      <div className="relative h-[320px] sm:h-[460px] lg:h-[540px] w-full overflow-hidden bg-foreground/5 border border-border group">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.img
            key={currentIndex}
            src={galleryImages[currentIndex]}
            alt={`${title} - photo ${currentIndex + 1}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setLightboxOpen(true)}
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent pointer-events-none" />

        {/* Carousel Navigation Arrows */}
        {galleryImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              aria-label="Previous image"
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-background/80 hover:bg-background text-foreground backdrop-blur-md flex items-center justify-center transition-all duration-200 border border-border shadow-lg hover:scale-105"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              aria-label="Next image"
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-background/80 hover:bg-background text-foreground backdrop-blur-md flex items-center justify-center transition-all duration-200 border border-border shadow-lg hover:scale-105"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Floating controls: Counter & Fullscreen preview */}
        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-mono font-bold tracking-wider bg-foreground/80 text-background backdrop-blur-sm">
            0{currentIndex + 1} / 0{galleryImages.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="Open fullscreen gallery"
          className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-background/90 text-foreground hover:bg-foreground hover:text-background backdrop-blur-sm border border-border transition-colors duration-200"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Fullscreen</span>
        </button>
      </div>

      {/* Thumbnail Carousel Strip */}
      {galleryImages.length > 1 && (
        <div className="flex gap-2 sm:gap-3 mt-3 overflow-x-auto pb-1 no-scrollbar">
          {galleryImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              className={`relative h-16 sm:h-20 w-24 sm:w-32 shrink-0 overflow-hidden border transition-all duration-200 ${
                idx === currentIndex
                  ? 'border-accent ring-2 ring-accent/30 opacity-100 scale-[1.02]'
                  : 'border-border opacity-60 hover:opacity-100 hover:border-foreground'
              }`}
            >
              <img
                src={img}
                alt={`${title} thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Symmetrical Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-foreground/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-background hover:text-accent transition-colors z-50"
              aria-label="Close lightbox"
            >
              <X className="w-7 h-7" />
            </button>

            {/* Modal image */}
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
              className="relative max-w-6xl max-h-[85vh] w-full flex items-center justify-center"
            >
              <img
                src={galleryImages[currentIndex]}
                alt={title}
                className="max-h-[80vh] w-auto max-w-full object-contain shadow-2xl border border-background/20"
              />

              {/* Prev / Next within Lightbox */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 p-2 bg-background/20 hover:bg-background/40 text-background rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 p-2 bg-background/20 hover:bg-background/40 text-background rounded-full transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </motion.div>

            {/* Lightbox Caption */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-background/80 text-xs sm:text-sm font-medium tracking-wider text-center">
              <span>{title}</span> · <span>0{currentIndex + 1} / 0{galleryImages.length}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
