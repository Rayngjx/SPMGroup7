import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { requestId: string } }
) {
  const requestId = parseInt(params.requestId);

  if (!requestId) {
    return NextResponse.json({ error: 'Invalid requestId' }, { status: 400 });
  }

  try {
    const requestLogs = await db.logs.findMany({
      where: { request_id: requestId }
    });

    return requestLogs.length > 0
      ? NextResponse.json(requestLogs)
      : NextResponse.json(
          { error: 'No logs found for this request' },
          { status: 404 }
        );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch request logs' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET'] }, { status: 200 });
}
