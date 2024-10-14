'use server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Request } from 'express';
import { NextRequest } from 'next/server';
import { getUserWithdrawRequests } from '@/lib/crudFunctions/WithdrawRequests';

export async function GET(
  req: Request,
  { params }: { params: { staffId: string } }
) {
  const staffId = parseInt(params.staffId);

  if (!staffId) {
    return NextResponse.json({ error: 'Invalid staffId' }, { status: 400 });
  }
  try {
    const userWithdrawRequests = await db.withdraw_requests.findMany({
      where: { staff_id: staffId }
    });
    return userWithdrawRequests.length > 0
      ? NextResponse.json(userWithdrawRequests)
      : NextResponse.json(
          { error: 'No requests found for this staff' },
          { status: 404 }
        );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch withdraw requests' },
      { status: 500 }
    );
  }
}
