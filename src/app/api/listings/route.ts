import { NextRequest, NextResponse } from 'next/server';
import { getListings, createListing, updateListing } from '@/lib/data-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId') || undefined;
    const status = searchParams.get('status') || undefined;
    const featuredOnly = searchParams.get('featuredOnly') === 'true';

    const listings = await getListings({ agentId, status, featuredOnly });
    return NextResponse.json(listings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      price,
      address,
      city,
      state,
      zip_code,
      property_type,
      bedrooms,
      bathrooms,
      sqft,
      images,
      featured,
      agent_id,
      status,
    } = body;

    if (!title || !price || !address || !city || !state || !agent_id) {
      return NextResponse.json(
        { error: 'Missing required listing fields' },
        { status: 400 }
      );
    }

    const listing = await createListing({
      title,
      description: description || '',
      price: Number(price),
      address,
      city,
      state,
      zip_code: zip_code || '',
      property_type: property_type || 'Single Family',
      bedrooms: Number(bedrooms || 1),
      bathrooms: Number(bathrooms || 1),
      sqft: Number(sqft || 1000),
      images: images && images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200'
      ],
      featured: Boolean(featured),
      agent_id,
      status: status || 'active',
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    const updated = await updateListing(id, updates);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
