import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Updated API method: Dynamically check for role_id and department
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get('user_id');
  const role_id = searchParams.get('role_id'); // Dynamically pass role_id
  const department = searchParams.get('department'); // Dynamically pass department

  // Ensure that user_id is provided
  if (!user_id) {
    return NextResponse.json(
      {
        message: 'User ID is required',
        success: false
      },
      { status: 400 }
    );
  }

  // Ensure that at least one of role_id or department is present
  if (!role_id && !department) {
    return NextResponse.json(
      {
        message: 'Either role_id or department must be provided',
        success: false
      },
      { status: 400 }
    );
  }

  // Query the users table directly using the user_id to check role_id and department
  const user = await prisma.users.findUnique({
    where: { staff_id: Number(user_id) } // Assuming staff_id is passed in as a query parameter
  });

  // If user not found, return a 404 error
  if (!user) {
    return NextResponse.json(
      {
        message: 'User not found',
        success: false
      },
      { status: 404 }
    );
  }

  // Check if the user matches the role_id and department (if provided)
  const roleCheck = role_id ? user.role_id === Number(role_id) : false;
  const departmentCheck = department ? user.department === department : false;

  // Return true if either condition is met (roleCheck or departmentCheck)
  const isAuthorized = roleCheck || departmentCheck;

  return NextResponse.json({
    isAuthorized,
    success: true
  });
}
