'use server';
import { db } from '@/lib/db';

// Interface for the user payload
interface UpdateUserPayload {
  staff_id: number;
  staff_fname: string;
  staff_lname: string;
  department: string;
  position?: string;
  country: string;
  email?: string;
  reporting_manager?: number;
  role_id: number;
  temp_replacement?: number;
}

// Function to get a specific user by staff_id
export async function getUser({ staff_id }: { staff_id: number }) {
  const response = await db.users.findUnique({
    where: { staff_id }
  });
  return response ? response : null;
}

// Function to get all users
export async function getAllUsers() {
  const response = await db.users.findMany();
  return response ? response : null;
}

// Function to create a new user
export async function createUser(payload: UpdateUserPayload) {
  const cleanedPayload = {
    ...payload,
    staff_fname: payload.staff_fname,
    staff_lname: payload.staff_lname,
    department: payload.department,
    position: payload.position || '',
    country: payload.country,
    email: payload.email ?? null,
    reporting_manager: payload.reporting_manager ?? null,
    role_id: payload.role_id,
    temp_replacement: payload.temp_replacement ?? null
  };

  const response = await db.users.create({
    data: cleanedPayload
  });
  return response ? { success: true } : { success: false, error: 'Failed!' };
}

// Function to update a user by staff_id
export async function updateUser(payload: UpdateUserPayload) {
  const response = await db.users.update({
    where: {
      staff_id: payload.staff_id
    },
    data: {
      staff_fname: payload.staff_fname,
      staff_lname: payload.staff_lname,
      department: payload.department,
      position: payload.position,
      country: payload.country,
      email: payload.email,
      reporting_manager: payload.reporting_manager,
      role_id: payload.role_id,
      temp_replacement: payload.temp_replacement
    }
  });
  return response ? { success: true } : { success: false, error: 'Failed!' };
}

// Function to delete a user by staff_id
export async function deleteUser({ staff_id }: { staff_id: number }) {
  const response = await db.users.delete({
    where: { staff_id }
  });
  return response ? { success: true } : { success: false, error: 'Failed!' };
}
