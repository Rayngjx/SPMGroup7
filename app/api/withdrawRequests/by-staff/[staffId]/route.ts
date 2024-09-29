'use server';
import { NextResponse } from 'next/server';
import { getUserWithdrawRequests } from '@/lib/crudFunctions/WithdrawRequests';

export async function GET(
  req: Request,
  { params }: { params?: { staffId?: string } }
) {
  try {
    if (params?.staffId) {
      const userWithdrawRequests = await getUserWithdrawRequests(
        parseInt(params.staffId)
      );
      return NextResponse.json(userWithdrawRequests);
    } else {
      return NextResponse.json(
        { error: 'Staff ID is required' },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch withdraw requests' },
      { status: 500 }
    );
  }
}
