import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Handle GET request to fetch logs by staffId
export async function GET(
  req: Request,
  { params }: { params: { staffId: string } }
) {
  const staffId = parseInt(params.staffId);

  if (!staffId) {
    return NextResponse.json({ error: 'Invalid staffId' }, { status: 400 });
  }

  try {
    const staffLogs = await db.logs.findMany({
      where: { staff_id: staffId }
    });

    return NextResponse.json(staffLogs);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch staff logs' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET'] }, { status: 200 });
}
