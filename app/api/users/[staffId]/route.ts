import { NextResponse } from 'next/server';
import { getUser, updateUser, deleteUser } from '@/lib/crudFunctions/Staff';

// Handle GET request to fetch a specific user by staffId
export async function GET(
  req: Request,
  { params }: { params: { staffId: string } }
) {
  const staffId = parseInt(params.staffId);

  if (isNaN(staffId)) {
    return NextResponse.json({ error: 'Invalid staffId' }, { status: 400 });
  }

  try {
    const user = await getUser({ staff_id: staffId });
    return user
      ? NextResponse.json(user)
      : NextResponse.json({ error: 'User not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// Handle PUT request to update a specific user by staffId
export async function PUT(
  req: Request,
  { params }: { params: { staffId: string } }
) {
  const staffId = parseInt(params.staffId);

  if (isNaN(staffId)) {
    return NextResponse.json({ error: 'Invalid staffId' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const payload = { ...body, staff_id: staffId };
    const result = await updateUser(payload);

    return result.success
      ? NextResponse.json(result, { status: 200 })
      : NextResponse.json({ error: result.error }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// Handle DELETE request to delete a specific user by staffId
export async function DELETE(
  req: Request,
  { params }: { params: { staffId: string } }
) {
  const staffId = parseInt(params.staffId);

  if (isNaN(staffId)) {
    return NextResponse.json({ error: 'Invalid staffId' }, { status: 400 });
  }

  try {
    const result = await deleteUser({ staff_id: staffId });
    return result.success
      ? NextResponse.json(result, { status: 200 })
      : NextResponse.json({ error: result.error }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request
export async function OPTIONS() {
  return NextResponse.json(
    { allow: ['GET', 'PUT', 'DELETE'] },
    { status: 200 }
  );
}
