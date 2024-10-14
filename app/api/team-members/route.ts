import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const managerId = searchParams.get('managerId');
  const date = searchParams.get('date');

  if (!managerId || !date) {
    return NextResponse.json(
      { error: 'Manager ID and date are required' },
      { status: 400 }
    );
  }

  try {
    const manager = await db.users.findUnique({
      where: { staff_id: parseInt(managerId) },
      include: { role: true }
    });

    // if (!manager || manager.role.role_id !== 3) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    // }

    if (!manager) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const teamMembers = await db.users.findMany({
      where: { reporting_manager: manager.staff_id },
      select: {
        staff_id: true,
        staff_fname: true,
        staff_lname: true,
        department: true,
        position: true,
        approved_dates: {
          where: { date: new Date(date) },
          select: { date: true }
        }
      }
    });

    const formattedTeamMembers = teamMembers.map((member) => ({
      id: member.staff_id,
      name: `${member.staff_fname} ${member.staff_lname}`,
      department: member.department,
      position: member.position,
      status: member.approved_dates.length > 0 ? 'WFH' : 'Office'
    }));

    return NextResponse.json(formattedTeamMembers);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: 'Error fetching team members' },
      { status: 500 }
    );
  }
}
