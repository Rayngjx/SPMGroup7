import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Handle GET request to fetch requests by staffId
export async function GET(
  req: Request,
  { params }: { params: { staffId: string } }
) {
  const staffId = parseInt(params.staffId);

  if (!staffId) {
    return NextResponse.json({ error: 'Invalid staffId' }, { status: 400 });
  }

  try {
    const userRequests = await db.requests.findMany({
      where: { staff_id: staffId }
    });

    return userRequests.length > 0
      ? NextResponse.json(userRequests)
      : NextResponse.json(
          { error: 'No requests found for this staff' },
          { status: 404 }
        );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user requests' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request
export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET'] }, { status: 200 });
}
