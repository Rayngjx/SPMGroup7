'use server';
import { NextResponse } from 'next/server';
import {
  getWithdrawnDates,
  getUserWithdrawnDates,
  getTeamWithdrawnDates,
  getDpmtWithdrawnDates,
  createWithdrawnDates,
  updateWithdrawnDates,
  deleteWithdrawnDates
} from '@/lib/crudFunctions/WithdrawnDates';

export async function GET(
  req: Request,
  {
    params
  }: { params?: { staffId?: string; teamleadId?: string; deptId?: string } }
) {
  try {
    if (params?.staffId) {
      const userWithdrawnDates = await getUserWithdrawnDates(
        parseInt(params.staffId)
      );
      return NextResponse.json(userWithdrawnDates);
    } else if (params?.teamleadId) {
      const teamWithdrawnDates = await getTeamWithdrawnDates(
        parseInt(params.teamleadId)
      );
      return NextResponse.json(teamWithdrawnDates);
    } else if (params?.deptId) {
      const departmentWithdrawnDates = await getDpmtWithdrawnDates(
        parseInt(params.deptId)
      );
      return NextResponse.json(departmentWithdrawnDates);
    } else {
      const allWithdrawnDates = await getWithdrawnDates();
      return NextResponse.json(allWithdrawnDates);
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch withdrawn dates' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const result = await createWithdrawnDates(payload);
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create withdrawn date' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const payload = await req.json();
    const result = await updateWithdrawnDates(payload);
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update withdrawn date' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    // Extract parameters from request body
    const { staff_id, withdraw_request_id, date } = await req.json();

    // Ensure all required fields are present
    if (
      staff_id === undefined ||
      withdraw_request_id === undefined ||
      date === undefined
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Call the function to delete withdrawn dates
    const result = await deleteWithdrawnDates({
      staff_id,
      withdraw_request_id,
      date
    });

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete withdrawn date' },
      { status: 500 }
    );
  }
}
