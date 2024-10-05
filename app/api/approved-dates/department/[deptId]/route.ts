import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { department: string } }
) {
  const department = parseInt(params.department);

  if (!department) {
    return NextResponse.json({ error: 'Invalid department' }, { status: 400 });
  }

  try {
    const departmentMembers = await db.users.findMany({
      where: { department: department.toString() },
      select: { staff_id: true }
    });

    const staffIds = departmentMembers.map((member) => member.staff_id);
    const dpmtApprovedDates = await db.approved_dates.findMany({
      where: { staff_id: { in: staffIds } }
    });

    return NextResponse.json(dpmtApprovedDates);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch department approved dates' },
      { status: 500 }
    );
  }
}
