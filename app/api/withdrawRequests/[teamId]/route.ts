'use server';
import { NextResponse } from 'next/server';
import { getTeamWithdrawRequests } from '@/lib/crudFunctions/WithdrawRequests';

export async function GET(
  req: Request,
  { params }: { params?: { teamId?: string } }
) {
  try {
    if (params?.teamId) {
      const managerStaffId = parseInt(params.teamId); // Assuming teamId is the manager's staff ID
      const teamWithdrawRequests =
        await getTeamWithdrawRequests(managerStaffId);
      return NextResponse.json(teamWithdrawRequests);
    } else {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch team withdraw requests' },
      { status: 500 }
    );
  }
}
