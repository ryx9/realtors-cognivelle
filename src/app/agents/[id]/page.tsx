import { getAgentById, getListings } from '@/lib/data-service';
import BookingWidget from '@/components/BookingWidget';
import ListingCard from '@/components/ListingCard';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Clock, ShieldCheck, Award } from 'lucide-react';

export const revalidate = 0;

export default async function AgentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const agent = await getAgentById(params.id);

  if (!agent) {
    notFound();
  }

  const agentListings = await getListings({ agentId: agent.id });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/agents"
            className="group inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors tracking-widest uppercase font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to All Advisors</span>
          </Link>
        </div>

        {/* Advisor Profile Hero Card */}
        <div className="border border-border bg-card p-6 sm:p-10 mb-8 sm:mb-12 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8">
            <img
              src={agent.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
              alt={agent.name}
              className="w-28 h-28 sm:w-36 sm:h-36 object-cover object-top border border-border grayscale hover:grayscale-0 transition-all duration-500 shrink-0"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase bg-foreground text-background">
                  Licensed Lead Advisor
                </span>
                <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-accent">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black uppercase text-foreground leading-tight tracking-tight">
                {agent.name}
              </h1>
              <p className="text-xs sm:text-sm text-muted font-medium mt-1 mb-4">{agent.title}</p>

              <div className="flex flex-wrap gap-4 text-xs text-muted">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-accent" />
                  <span>{agent.email}</span>
                </div>
                {agent.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-accent" />
                    <span>{agent.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-muted/80">
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  <span>{agent.timezone.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          </div>

          {agent.bio && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-[10px] uppercase tracking-widest text-accent font-bold mb-2">
                Background &amp; Expertise
              </p>
              <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed max-w-3xl">
                {agent.bio}
              </p>
            </div>
          )}
        </div>

        {/* Content Layout: Current Listings & Booking */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="font-display text-xl font-black uppercase text-foreground">
                Current Listings
              </h2>
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                {agentListings.length} {agentListings.length === 1 ? 'Property' : 'Properties'}
              </span>
            </div>

            {agentListings.length === 0 ? (
              <div className="border border-border bg-card p-10 text-center">
                <p className="font-display font-bold uppercase text-lg text-muted mb-1">No Active Public Listings</p>
                <p className="text-xs text-muted">Contact {agent.name.split(' ')[0]} directly for discreet off-market opportunities.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border border border-border shadow-sm">
                {agentListings.map((listing) => (
                  <div key={listing.id} className="bg-background">
                    <ListingCard listing={listing} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-5" id="advisor-booking">
            <div className="sticky top-20 bg-card">
              <BookingWidget agent={agent} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Quick Booking Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur-md border-t border-border p-3 z-40 flex items-center justify-between gap-3 shadow-2xl">
        <div>
          <span className="text-[10px] text-muted block uppercase tracking-wider font-semibold">Consultation</span>
          <span className="font-display font-bold text-sm text-foreground">{agent.name}</span>
        </div>
        <a
          href="#advisor-booking"
          className="px-5 py-2.5 bg-foreground text-background text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors"
        >
          Book Time
        </a>
      </div>
    </div>
  );
}

