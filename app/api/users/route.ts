import { NextResponse } from 'next/server';
import { createUser, getAllUsers } from '@/lib/crudFunctions/Staff';

// Handle GET request to fetch all users
export async function GET() {
  try {
    const users = await getAllUsers();
    return users
      ? NextResponse.json(users, { status: 200 })
      : NextResponse.json({ error: 'No users found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// Handle POST request to create a new user
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate required fields for creating a user
    if (
      !body.staff_id ||
      !body.staff_fname ||
      !body.staff_lname ||
      !body.department ||
      !body.country ||
      !body.role_id
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await createUser(body);

    return result.success
      ? NextResponse.json(result, { status: 201 })
      : NextResponse.json({ error: result.error }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      Allow: 'GET, PUT, DELETE'
    }
  });
}
