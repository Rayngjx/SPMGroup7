'use server';
import { NextResponse } from 'next/server';
import {
  getWithdrawRequests,
  createWithdrawRequest,
  updateWithdrawRequest,
  deleteWithdrawRequest
} from '@/lib/crudFunctions/WithdrawRequests';

export async function GET(req: Request) {
  try {
    const allWithdrawRequests = await getWithdrawRequests();
    return NextResponse.json(allWithdrawRequests);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch withdraw requests' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const result = await createWithdrawRequest(payload);
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create withdraw request' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const payload = await req.json();
    const result = await updateWithdrawRequest(payload);
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update withdraw request' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { withdraw_request_id } = await req.json();
    if (withdraw_request_id === undefined) {
      return NextResponse.json(
        { error: 'Withdraw Request ID is required' },
        { status: 400 }
      );
    }
    const result = await deleteWithdrawRequest(withdraw_request_id);
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete withdraw request' },
      { status: 500 }
    );
  }
}
