import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import {
  updateApproveDates,
  deleteApproveDates
} from '@/lib/crudFunctions/ApprovedDates';

// Handle GET request to fetch user-approved dates
export async function GET(
  req: Request,
  { params }: { params: { staffId: string } }
) {
  const staffId = parseInt(params.staffId);

  if (!staffId) {
    return NextResponse.json({ error: 'Invalid staffId' }, { status: 400 });
  }

  try {
    const userApprovedDates = await db.approved_dates.findMany({
      where: { staff_id: staffId }
    });

    return NextResponse.json(userApprovedDates);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user approved dates' },
      { status: 500 }
    );
  }
}

// Handle PUT request to update approved dates
export async function PUT(
  req: Request,
  { params }: { params: { staffId: string } }
) {
  const staffId = parseInt(params.staffId);

  try {
    const body = await req.json();
    const payload = { ...body, staff_id: staffId }; // Combine parsed body data with staff_id
    const result = await updateApproveDates(payload);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update approved date' },
      { status: 500 }
    );
  }
}

// Handle DELETE request to delete approved dates
export async function DELETE(
  req: Request,
  { params }: { params: { staffId: string } }
) {
  const staffId = parseInt(params.staffId);

  try {
    const body = await req.json();
    const payload = { ...body, staff_id: staffId }; // Combine parsed body data with staff_id
    const result = await deleteApproveDates(payload);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete approved date' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request to specify allowed methods
export async function OPTIONS() {
  return NextResponse.json(
    { allow: ['GET', 'PUT', 'DELETE'] },
    { status: 200 }
  );
}
