"use client"
import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[85vh] flex flex-col justify-center py-16 lg:py-24 bg-background overflow-hidden"
    >
      <motion.div
        style={{ opacity }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10"
      >
        {/* Changed items-center to items-start so top edges align */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">

          {/* LEFT COLUMN: Typography & Actions (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">

            {/* Minimal Subtitle Badge with Deep Gold Accent */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl sm:text-6xl lg:text-7xl font-black text-foreground tracking-tight leading-[1.05] mb-6 uppercase"
            >
              The Best <br />
              <span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-800 bg-clip-text text-transparent">
                Property Dealers
              </span> <br />
              In Lahore
            </motion.h1>

            {/* Paragraph Text */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-muted max-w-xl font-normal leading-relaxed mb-8"
            >
              From Gulberg penthouses to DHA luxury estates — azaan associates connects discerning buyers with Lahore&apos;s most sought-after prime real estate.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-12"
            >
              <Link
                href="/listings"
                className="px-8 py-4 bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-800 text-amber-50 font-bold text-xs tracking-widest uppercase rounded-lg shadow-lg hover:brightness-110 transition-all duration-300 text-center"
              >
                Browse Properties
              </Link>
              <Link
                href="/agents"
                className="px-8 py-4 bg-transparent text-foreground border border-border font-bold text-xs tracking-widest uppercase rounded-lg hover:border-amber-600 hover:text-amber-600 transition-all duration-300 text-center"
              >
                Our Advisors
              </Link>
            </motion.div>

            {/* Metric Row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-3 gap-8 pt-8 border-t border-border/50 w-full max-w-lg"
            >
              <div>
                <p className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">100%</p>
                <p className="text-xs text-muted font-semibold uppercase tracking-wider mt-1">Verified</p>
              </div>
              <div>
                <p className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">Est. 2024</p>
                <p className="text-xs text-muted font-semibold uppercase tracking-wider mt-1">Portfolio</p>
              </div>
              <div>
                <p className="font-display text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 bg-clip-text text-transparent">Prime</p>
                <p className="text-xs text-muted font-semibold uppercase tracking-wider mt-1">Locations</p>
              </div>
            </motion.div>

          </div>

          {/* RIGHT COLUMN: Aligned with top edge of left column typography */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 flex justify-center items-start lg:pt-1 relative"
          >
            {/* Soft Ambient Warm Glow behind logo */}
            <div className="absolute w-80 h-80 bg-amber-800/10 rounded-full blur-3xl -z-10 pointer-events-none" />

            <div className="relative flex flex-col items-center justify-center text-center">
              {/* Image Container with Feathered Edge Radial Mask & High Blend Dissolve */}
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
                <Image
                  src="/images.jpg"
                  alt="azaan associates Logo"
                  width={320}
                  height={320}
                  priority
                  className="object-contain mix-blend-multiply dark:mix-blend-screen opacity-85 [mask-image:radial-gradient(circle_at_center,black_30%,transparent_75%)] transition-all duration-500 hover:scale-105 hover:opacity-100"
                />
              </div>

              <div className="mt-1 text-center">
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 bg-clip-text text-transparent">
                  azaan associates
                </p>
                <p className="text-sm font-medium text-muted mt-1">
                  Lahore&apos;s Luxury Property Partner
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </section>
  );
}
