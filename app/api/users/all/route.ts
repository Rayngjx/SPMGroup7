import { NextResponse } from 'next/server';
import { getAllUsers, createUser } from '@/lib/crudFunctions/Staff';

// Handle GET request to fetch all users
export async function GET() {
  try {
    const users = await getAllUsers();
    return NextResponse.json(users);
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
    const payload = await req.json();
    const result = await createUser(payload);

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
  return NextResponse.json({ allow: ['GET', 'POST'] }, { status: 200 });
}
