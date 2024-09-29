import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Handle GET request to fetch logs by processorId
export async function GET(
  req: Request,
  { params }: { params: { processorId: string } }
) {
  const processorId = parseInt(params.processorId);

  if (!processorId) {
    return NextResponse.json({ error: 'Invalid processorId' }, { status: 400 });
  }

  try {
    const processorLogs = await db.logs.findMany({
      where: { processor_id: processorId }
    });

    return processorLogs.length > 0
      ? NextResponse.json(processorLogs)
      : NextResponse.json(
          { error: 'No logs found for this processor' },
          { status: 404 }
        );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch processor logs' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request
export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET'] }, { status: 200 });
}
