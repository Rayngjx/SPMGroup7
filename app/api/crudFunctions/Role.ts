'use server';
import { db } from '@/lib/db';

interface RolePayload {
  role_id?: number; // Optional for create
  role_title: string; // Required for both create and update
}

// Get role

export async function getRole(payload: RolePayload) {
  const response = await db.role.findMany({
    where: { role_id: payload.role_id }
  });
  return response ? response : null;
}
// Get User Role
export async function getUserRole(staffId: number) {
  // Fetch the role_id for the given staffId
  const user = await db.users.findUnique({
    where: { staff_id: staffId },
    select: {
      role_id: true
    }
  });

  // If no user is found or role_id is null, return null
  if (!user || user.role_id === null) {
    return null;
  }

  // Fetch the role details using the retrieved role_id
  const role = await db.role.findUnique({
    where: { role_id: user.role_id }
  });

  return role ? role : null;
}

// Get all roles
export async function getRoles() {
  const response = await db.role.findMany();
  return response ? response : null;
}

// Create a new role
export async function createRole(payload: RolePayload) {
  const response = await db.role.create({
    data: {
      role_title: payload.role_title
    }
  });
  return response
    ? { success: true, role: response }
    : { success: false, error: 'Failed to create role!' };
}

// Update an existing role
export async function updateRole(payload: RolePayload) {
  if (!payload.role_id) {
    return { success: false, error: 'Role ID is required for updating!' };
  }

  const response = await db.role.update({
    where: { role_id: payload.role_id },
    data: {
      role_title: payload.role_title
    }
  });
  return response
    ? { success: true }
    : { success: false, error: 'Failed to update role!' };
}

// Delete a role
export async function deleteRole(role_id: number) {
  const response = await db.role.delete({
    where: { role_id }
  });
  return response
    ? { success: true }
    : { success: false, error: 'Failed to delete role!' };
}
