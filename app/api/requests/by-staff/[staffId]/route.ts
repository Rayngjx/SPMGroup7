import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { createRequest } from '@/lib/crudFunctions/Requests';
import { Request } from 'express';
import { supabase } from '@/lib/supabase';

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

export async function POST(req: Request) {
  try {
    const payload = await (
      req as Request & { json: () => Promise<any> }
    ).json();

    if (
      !payload.staff_id ||
      !payload.timeslot ||
      !payload.daterange ||
      !payload.reason
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await createRequest(payload);

    return result.success
      ? NextResponse.json(result.request, { status: 201 })
      : NextResponse.json({ error: result.error }, { status: 500 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create request' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request
export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET', 'POST'] }, { status: 200 });
}
