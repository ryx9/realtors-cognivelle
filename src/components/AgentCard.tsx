import Link from 'next/link';
import { Agent } from '@/types/database';
import { Mail, Phone, Calendar } from 'lucide-react';

export default function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div className="bg-white border border-stone-200 hover:border-stone-300 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between shadow-sm group hover:shadow-md">
      <div>
        <div className="flex items-start space-x-4 mb-4">
          <img
            src={agent.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
            alt={agent.name}
            className="w-16 h-16 rounded-2xl object-cover border border-stone-200 shadow-sm group-hover:scale-105 transition-transform"
          />
          <div>
            <h3 className="text-lg font-semibold text-stone-900 group-hover:text-amber-800 transition-colors">
              {agent.name}
            </h3>
            <p className="text-xs text-stone-500 font-medium">{agent.title}</p>
          </div>
        </div>

        {agent.bio && (
          <p className="text-sm text-stone-500 leading-relaxed mb-4 line-clamp-3">
            {agent.bio}
          </p>
        )}

        <div className="space-y-1.5 py-3 border-t border-stone-100 text-xs text-stone-600">
          <div className="flex items-center space-x-2">
            <Mail className="w-3.5 h-3.5 text-stone-400" />
            <span className="truncate">{agent.email}</span>
          </div>
          {agent.phone && (
            <div className="flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-stone-400" />
              <span>{agent.phone}</span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4">
        <Link
          href={`/agents/${agent.id}`}
          className="w-full py-2.5 px-4 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs transition-all flex items-center justify-center space-x-2"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Schedule a Consultation</span>
        </Link>
      </div>
    </div>
  );
}
