import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { updateRequest, deleteRequest } from '@/lib/crudFunctions/Requests';

// Handle GET request to fetch a specific request by requestId
export async function GET(
  req: Request,
  { params }: { params: { requestId: string } }
) {
  const requestId = parseInt(params.requestId);

  if (!requestId) {
    return NextResponse.json({ error: 'Invalid requestId' }, { status: 400 });
  }

  try {
    const request = await db.requests.findUnique({
      where: { request_id: requestId }
    });

    return request
      ? NextResponse.json(request)
      : NextResponse.json({ error: 'Request not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch request' },
      { status: 500 }
    );
  }
}

// Handle PUT request to update a specific request by requestId
export async function PUT(
  req: Request,
  { params }: { params: { requestId: string } }
) {
  const requestId = parseInt(params.requestId);

  try {
    const body = await req.json();
    const payload = { ...body, request_id: requestId }; // Attach requestId to the payload
    const result = await updateRequest(payload);

    return result.success
      ? NextResponse.json(result, { status: 200 })
      : NextResponse.json({ error: result.error }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    );
  }
}

// Handle DELETE request to delete a specific request by requestId
export async function DELETE(
  req: Request,
  { params }: { params: { requestId: string } }
) {
  const requestId = parseInt(params.requestId);

  try {
    const result = await deleteRequest(requestId);

    return result.success
      ? NextResponse.json(result, { status: 200 })
      : NextResponse.json({ error: result.error }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete request' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request
export async function OPTIONS() {
  return NextResponse.json(
    { allow: ['GET', 'PUT', 'DELETE'] },
    { status: 200 }
  );
}
