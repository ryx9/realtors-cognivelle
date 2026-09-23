'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight, Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function Navbar() {
  const pathname = usePathname();
  const { user, role, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Track scroll for subtle border enhancement
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/listings', label: 'Properties' },
    { href: '/agents', label: 'Advisors' },
  ];

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b transition-all duration-300 ${scrolled ? 'border-border shadow-sm' : 'border-border/60'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo / Brandmark */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="font-display italic text-sm font-bold text-accent tracking-wider px-1.5 py-0.5 border border-accent/40 group-hover:bg-accent group-hover:text-background transition-colors duration-300">
              CVR
            </span>
            <div className="w-px h-4 bg-border" />
            <div className="flex flex-col">
              <span className="font-sans font-extrabold tracking-[0.15em] text-xs sm:text-sm text-foreground uppercase">
                Azaan
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-muted -mt-0.5 font-medium">
                Associates
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-xs tracking-widest uppercase font-semibold py-1 transition-colors duration-300 ${isActive ? 'text-foreground' : 'text-muted hover:text-foreground'
                    }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-[2px] bg-accent"
                      transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right CTA & Auth Status */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={role === 'client' ? '/' : '/admin'}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-border bg-card text-xs font-semibold text-foreground hover:border-foreground transition-colors"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${role === 'admin'
                      ? 'bg-amber-400'
                      : role === 'agent'
                        ? 'bg-cyan-400'
                        : 'bg-emerald-400'
                      }`}
                  />
                  <span className="text-[10px] uppercase tracking-wider font-bold text-muted">
                    {role}:
                  </span>
                  <span className="truncate max-w-[110px]">
                    {profile?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                  </span>
                </Link>

                {role !== 'client' && (
                  <Link
                    href="/admin"
                    className="px-3 py-1.5 bg-foreground text-background text-[10px] font-bold tracking-widest uppercase hover:bg-accent transition-colors"
                  >
                    Portal
                  </Link>
                )}

                <button
                  onClick={() => signOut()}
                  className="p-1.5 border border-border text-muted hover:text-foreground transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/admin/login"
                className="px-3 py-2 text-[11px] font-bold tracking-wider uppercase text-muted hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
            )}

            <Link
              href="/listings"
              className="group relative px-4 sm:px-5 py-2 sm:py-2.5 bg-foreground text-background text-[11px] font-bold tracking-widest uppercase overflow-hidden"
            >
              <span className="relative z-10 group-hover:text-background transition-colors duration-300 flex items-center gap-1.5">
                Browse Properties
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-accent scale-x-0 group-hover:scale-x-100 origin-center transition-transform duration-400 ease-out z-0" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/listings"
              className="sm:hidden px-3 py-1.5 bg-foreground text-background text-[10px] font-bold tracking-widest uppercase"
            >
              Residences
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-foreground hover:text-accent transition-colors focus:outline-none"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 transition-transform duration-200" />
              ) : (
                <Menu className="w-5 h-5 transition-transform duration-200" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Symmetrical Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
            className="md:hidden fixed inset-x-0 top-14 sm:top-16 z-40 bg-background/98 backdrop-blur-lg border-b border-border shadow-2xl px-6 py-6"
          >
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link, idx) => {
                const isActive = pathname === link.href;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.2 }}
                  >
                    <Link
                      href={link.href}
                      className={`flex items-center justify-between py-2 text-sm uppercase tracking-wider font-bold border-b border-border/40 ${isActive ? 'text-accent' : 'text-foreground'
                        }`}
                    >
                      <span>{link.label}</span>
                      <ArrowRight className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-muted'}`} />
                    </Link>
                  </motion.div>
                );
              })}

              <div className="pt-2 space-y-3">
                {user ? (
                  <div className="p-3 border border-border bg-card space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted font-bold text-[10px] uppercase">Signed In As</span>
                      <span className="font-bold text-accent uppercase text-[10px]">{role}</span>
                    </div>
                    <p className="text-xs font-semibold text-foreground truncate">
                      {profile?.full_name || user.email}
                    </p>
                    <div className="flex gap-2 pt-1">
                      {role !== 'client' && (
                        <Link
                          href="/admin"
                          className="flex-1 py-2 text-center bg-foreground text-background text-[10px] font-bold uppercase tracking-wider"
                        >
                          Operations Portal
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => signOut()}
                        className="py-2 px-3 border border-border text-[10px] font-bold uppercase text-muted hover:text-foreground"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/admin/login"
                    className="w-full py-2.5 border border-border text-foreground text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-card"
                  >
                    <span>Sign In / Advisor Access</span>
                  </Link>
                )}

                <Link
                  href="/listings"
                  className="w-full py-3 bg-foreground text-background text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2"
                >
                  <span>Explore All Properties</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center justify-between text-[11px] text-muted pt-2">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-accent" />
                    +1 (212) 555-0198
                  </span>
                  <span className="uppercase tracking-wider">NY · LA · LDN · TYO</span>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

