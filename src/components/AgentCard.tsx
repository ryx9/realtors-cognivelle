import Link from 'next/link';
import { Agent } from '@/types/database';
import { Mail, Phone, Globe, Calendar } from 'lucide-react';

export default function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-amber-400/50 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between shadow-xl group">
      <div>
        <div className="flex items-start space-x-4 mb-4">
          <img
            src={agent.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
            alt={agent.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400/50 shadow-md group-hover:scale-105 transition-transform"
          />
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
              {agent.name}
            </h3>
            <p className="text-xs text-amber-400/90 font-medium">{agent.title}</p>
            <div className="flex items-center space-x-1.5 mt-1 text-[11px] text-slate-400">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono">{agent.timezone}</span>
            </div>
          </div>
        </div>

        {agent.bio && (
          <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3">
            {agent.bio}
          </p>
        )}

        <div className="space-y-1.5 py-3 border-t border-slate-800/80 text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <Mail className="w-3.5 h-3.5 text-slate-500" />
            <span className="truncate">{agent.email}</span>
          </div>
          {agent.phone && (
            <div className="flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>{agent.phone}</span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4">
        <Link
          href={`/agents/${agent.id}`}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white font-semibold text-xs transition-all flex items-center justify-center space-x-2 border border-slate-700 hover:border-amber-400 shadow-sm"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Book Consultation & View Listings</span>
        </Link>
      </div>
    </div>
  );
}
