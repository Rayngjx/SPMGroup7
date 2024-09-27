import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { teamleadId: string } }
) {
  const teamleadId = parseInt(params.teamleadId);

  if (!teamleadId) {
    return NextResponse.json({ error: 'Invalid teamleadId' }, { status: 400 });
  }

  try {
    const teamMembers = await db.users.findMany({
      where: { reporting_manager: teamleadId },
      select: { staff_id: true }
    });

    const staffIds = teamMembers.map((member) => member.staff_id);
    const teamApprovedDates = await db.approved_dates.findMany({
      where: { staff_id: { in: staffIds } }
    });

    return NextResponse.json(teamApprovedDates);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch team approved dates' },
      { status: 500 }
    );
  }
}
