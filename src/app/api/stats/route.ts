import { NextResponse } from 'next/server';
import { getAdminStats } from '@/lib/data-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = await getAdminStats();
    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
