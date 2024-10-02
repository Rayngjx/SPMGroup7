import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Handle GET request to fetch team requests by managerStaffId
export async function GET(
  req: Request,
  { params }: { params: { managerStaffId: string } }
) {
  const managerStaffId = parseInt(params.managerStaffId);

  if (!managerStaffId) {
    return NextResponse.json(
      { error: 'Invalid managerStaffId' },
      { status: 400 }
    );
  }

  try {
    // Find all staff IDs that have the specified manager as their reporting manager
    const teamMembers = await db.users.findMany({
      where: { reporting_manager: managerStaffId },
      select: { staff_id: true }
    });

    const staffIds = teamMembers.map((member) => member.staff_id);

    // Find all requests for the staff IDs
    const teamRequests = await db.requests.findMany({
      where: { staff_id: { in: staffIds } }
    });

    return teamRequests.length > 0
      ? NextResponse.json(teamRequests)
      : NextResponse.json(
          { error: 'No requests found for this manager' },
          { status: 404 }
        );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch team requests' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request
export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET'] }, { status: 200 });
}
