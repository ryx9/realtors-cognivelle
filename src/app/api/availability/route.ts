import { NextRequest, NextResponse } from 'next/server';
import { getAgentAvailability, saveAgentAvailability } from '@/lib/data-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    if (!agentId) {
      return NextResponse.json({ error: 'agentId query param is required' }, { status: 400 });
    }

    const availability = await getAgentAvailability(agentId);
    return NextResponse.json(availability);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, schedules } = body;

    if (!agentId || !Array.isArray(schedules)) {
      return NextResponse.json(
        { error: 'agentId and schedules array are required' },
        { status: 400 }
      );
    }

    const saved = await saveAgentAvailability(agentId, schedules);
    return NextResponse.json(saved);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
