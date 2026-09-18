import { NextRequest, NextResponse } from 'next/server';
import { getAgentById, getAgentAvailability, getBookings } from '@/lib/data-service';
import { generateAgentSlotsForDate } from '@/lib/timezone-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const dateStr = searchParams.get('date'); // 'YYYY-MM-DD'
    const clientTz = searchParams.get('clientTz') || 'UTC';

    if (!agentId || !dateStr) {
      return NextResponse.json(
        { error: 'Missing required parameters: agentId and date (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const agent = await getAgentById(agentId);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const [availability, bookings] = await Promise.all([
      getAgentAvailability(agentId),
      getBookings({ agentId }),
    ]);

    const slots = generateAgentSlotsForDate({
      agentTimezone: agent.timezone,
      clientTimezone: clientTz,
      dateStr,
      availability,
      existingBookings: bookings,
    });

    return NextResponse.json({
      agent: {
        id: agent.id,
        name: agent.name,
        timezone: agent.timezone,
      },
      clientTimezone: clientTz,
      date: dateStr,
      slots,
      totalSlots: slots.length,
      availableSlots: slots.filter((s) => s.isAvailable).length,
    });
  } catch (error: any) {
    console.error('Error generating slots:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while computing slots' },
      { status: 500 }
    );
  }
}
