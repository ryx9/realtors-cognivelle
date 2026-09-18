import { NextRequest, NextResponse } from 'next/server';
import { getAgents, createAgent, updateAgent } from '@/lib/data-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const agents = await getAgents(includeInactive);
    return NextResponse.json(agents);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, title, bio, avatar_url, timezone } = body;

    if (!name || !email || !timezone) {
      return NextResponse.json(
        { error: 'Name, email, and timezone are required' },
        { status: 400 }
      );
    }

    const agent = await createAgent({
      name,
      email,
      phone: phone || null,
      title: title || 'Real Estate Specialist',
      bio: bio || '',
      avatar_url: avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      timezone,
      is_active: true,
    });

    return NextResponse.json(agent, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    const updated = await updateAgent(id, updates);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
