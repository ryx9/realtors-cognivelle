import { NextRequest, NextResponse } from 'next/server';
import { getBookings, createBooking, updateBookingStatus } from '@/lib/data-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId') || undefined;
    const status = searchParams.get('status') || undefined;

    const bookings = await getBookings({ agentId, status });
    return NextResponse.json(bookings);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      agent_id,
      listing_id,
      client_name,
      client_email,
      client_phone,
      client_timezone,
      start_time,
      end_time,
      tour_type,
      notes,
    } = body;

    if (!agent_id || !client_name || !client_email || !client_phone || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Missing required booking fields (agent, name, email, phone, start/end time)' },
        { status: 400 }
      );
    }

    const result = await createBooking({
      agent_id,
      listing_id: listing_id || null,
      client_name,
      client_email,
      client_phone,
      client_timezone: client_timezone || 'UTC',
      start_time,
      end_time,
      tour_type: tour_type || 'in_person',
      notes: notes || null,
      status: 'confirmed',
    });

    if (!result.success) {
      // 409 Conflict status code when a slot is already taken!
      return NextResponse.json(
        {
          error: result.error,
          conflict: true,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(result.booking, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to process booking' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const updated = await updateBookingStatus(id, status);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update booking status' },
      { status: 500 }
    );
  }
}
