'use client';

import Link from 'next/link';
import { Agent } from '@/types/database';
import { Mail, Phone, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AgentCard({ agent }: { agent: Agent }) {
  // Extract market location from title if available
  const market = agent.title?.includes('-')
    ? agent.title.split('-')[1]?.trim()
    : agent.title || 'Advisor';

  return (
    <div className="bg-card border border-border hover:border-foreground/30 transition-all duration-300 flex flex-col h-full group relative">
      {/* Advisor Portrait */}
      <div className="relative h-60 sm:h-64 w-full overflow-hidden bg-muted/20">
        <Link href={`/agents/${agent.id}`} className="block w-full h-full">
          <img
            src={
              agent.avatar_url ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
            }
            alt={agent.name}
            className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
          />
        </Link>

        {/* Market Specialty Pill Badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase bg-background/90 text-foreground backdrop-blur-sm border border-border/40 flex items-center gap-1">
            <ShieldCheck className="w-2.5 h-2.5 text-accent" />
            Verified Lead
          </span>
        </div>
      </div>

      {/* Advisor Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3.5">
        <div>
          {/* Advisor Name & Market (Moved below image) */}
          <div className="mb-2.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent block mb-0.5">
              {market}
            </span>
            <Link href={`/agents/${agent.id}`}>
              <h3 className="font-display font-bold text-lg text-foreground hover:text-accent transition-colors leading-tight">
                {agent.name}
              </h3>
            </Link>
          </div>

          <p className="text-xs text-muted font-medium line-clamp-2 leading-relaxed">
            {agent.bio || agent.title}
          </p>

          {/* Contact Details Ribbon */}
          <div className="mt-3.5 pt-3 border-t border-border/80 space-y-1.5 text-xs text-muted">
            <div className="flex items-center gap-2 truncate">
              <Mail className="w-3 h-3 text-accent shrink-0" />
              <span className="truncate">{agent.email}</span>
            </div>
            {agent.phone && (
              <div className="flex items-center gap-2 truncate">
                <Phone className="w-3 h-3 text-accent shrink-0" />
                <span>{agent.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-[11px] text-muted/80">
              <Clock className="w-3 h-3 text-accent shrink-0" />
              <span>{agent.timezone?.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Symmetrical CTA Button */}
        <Link
          href={`/agents/${agent.id}`}
          className="group/btn relative w-full py-2.5 px-4 bg-foreground text-background text-xs font-bold tracking-widest uppercase overflow-hidden text-center flex items-center justify-center gap-1.5"
        >
          <span className="relative z-10 group-hover/btn:text-background transition-colors duration-300 flex items-center gap-1.5">
            Schedule Consultation
            <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform duration-300" />
          </span>
          <div className="absolute inset-0 bg-accent scale-x-0 group-hover/btn:scale-x-100 origin-center transition-transform duration-400 ease-out z-0" />
        </Link>
      </div>
    </div>
  );
}
