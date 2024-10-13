import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { staffId: string } }
) {
  const staffId = parseInt(params.staffId);

  try {
    const [approvedDates, allRequests, withdrawnDates] = await Promise.all([
      prisma.approved_dates.findMany({
        where: { staff_id: staffId }
      }),
      prisma.requests.findMany({
        where: { staff_id: staffId }
      }),
      prisma.withdrawn_dates.findMany({
        where: { staff_id: staffId }
      })
    ]);

    return NextResponse.json({ approvedDates, allRequests, withdrawnDates });
  } catch (error) {
    console.error('Error fetching WFH data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch WFH data' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
