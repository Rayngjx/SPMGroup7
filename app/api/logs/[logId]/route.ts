import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { updateLog, deleteLog } from '@/lib/crudFunctions/Logs';

// Handle GET request to fetch a specific log entry by logId
export async function GET(
  req: Request,
  { params }: { params: { logId: string } }
) {
  const logId = parseInt(params.logId);

  if (!logId) {
    return NextResponse.json({ error: 'Invalid logId' }, { status: 400 });
  }

  try {
    const logEntry = await db.logs.findUnique({
      where: { log_id: logId }
    });

    return logEntry
      ? NextResponse.json(logEntry)
      : NextResponse.json({ error: 'Log not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch log entry' },
      { status: 500 }
    );
  }
}

// Handle PUT request to update a log entry by logId
export async function PUT(
  req: Request,
  { params }: { params: { logId: string } }
) {
  const logId = parseInt(params.logId);

  try {
    const body = await req.json();
    const payload = { ...body, log_id: logId }; // Attach logId to the payload
    const result = await updateLog(payload);

    return result.success
      ? NextResponse.json(result, { status: 200 })
      : NextResponse.json({ error: result.error }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update log entry' },
      { status: 500 }
    );
  }
}

// Handle DELETE request to delete a log entry by logId
export async function DELETE(
  req: Request,
  { params }: { params: { logId: string } }
) {
  const logId = parseInt(params.logId);

  try {
    const result = await deleteLog(logId);

    return result.success
      ? NextResponse.json(result, { status: 200 })
      : NextResponse.json({ error: result.error }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete log entry' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request to specify allowed methods
export async function OPTIONS() {
  return NextResponse.json(
    { allow: ['GET', 'PUT', 'DELETE'] },
    { status: 200 }
  );
}
