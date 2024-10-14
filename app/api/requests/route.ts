import { NextResponse } from 'next/server';
import { getRequests } from '@/lib/crudFunctions/Requests';

export async function GET() {
  try {
    const requests = await getRequests();

    return requests
      ? NextResponse.json(requests, { status: 200 })
      : NextResponse.json({ error: 'No requests found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET'] }, { status: 200 });
}
