import { db } from '@/lib/db';
import {
  getRole,
  getUserRole,
  getRoles,
  createRole,
  updateRole,
  deleteRole
} from '@/lib/crudFunctions/Role';

describe('Role CRUD Functions', () => {
  const testRoleId = 1;
  const newTestRoleId = 9999;
  const testPayload = {
    role_title: 'Test Role'
  };

  beforeAll(async () => {
    // Connect to the test database
    await db.$connect();

    // Seed the database with a test role
    await db.role.create({
      data: {
        role_id: testRoleId,
        role_title: 'Test Role'
      }
    });

    // Seed the users table with a role_id
    await db.users.create({
      data: {
        staff_id: 1, // Make sure this staff_id exists in your test data
        staff_fname: 'Test',
        staff_lname: 'User',
        email: 'testuser@example.com',
        department: 'Test Department',
        position: 'Tester',
        country: 'Testland',
        role_id: testRoleId // Assuming the user has a role
      }
    });
  });

  afterAll(async () => {
    // Clean up the test data after all tests run
    await db.role.deleteMany({
      where: { role_id: newTestRoleId }
    });

    await db.users.deleteMany({
      where: { staff_id: 1 } // Adjust to your test data
    });

    await db.$disconnect();
  });

  describe('getRole', () => {
    it('should return a role by role_id', async () => {
      const result = await getRole({ role_id: testRoleId });
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].role_id).toBe(testRoleId);
    });

    it('should return null for a non-existent role', async () => {
      const result = await getRole({ role_id: 99999 });
      expect(result).toBeNull();
    });
  });

  describe('getUserRole', () => {
    it('should return a role for a valid staff ID', async () => {
      const result = await getUserRole(1); // Adjust with a valid staff_id
      expect(result).not.toBeNull();
      expect(result?.role_id).toBe(testRoleId);
    });

    it('should return null for a staff ID with no role', async () => {
      const result = await getUserRole(99999); // Non-existent staff_id
      expect(result).toBeNull();
    });
  });

  describe('getRoles', () => {
    it('should return all roles', async () => {
      const result = await getRoles();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('createRole', () => {
    it('should create a new role', async () => {
      const result = await createRole({ role_title: 'New Test Role' });
      expect(result.success).toBe(true);
      expect(result.role.role_title).toBe('New Test Role');

      // Clean up by deleting the newly created role
      await db.role.delete({
        where: { role_id: result.role.role_id }
      });
    });

    it('should fail to create a role with missing title', async () => {
      const result = await createRole({ role_title: '' });
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('updateRole', () => {
    it('should update an existing role', async () => {
      const result = await updateRole({
        role_id: testRoleId,
        role_title: 'Updated Role Title'
      });
      expect(result.success).toBe(true);

      const updatedRole = await db.role.findUnique({
        where: { role_id: testRoleId }
      });
      expect(updatedRole?.role_title).toBe('Updated Role Title');
    });

    it('should fail to update a role without a role_id', async () => {
      const result = await updateRole({ role_title: 'No ID' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Role ID is required for updating!');
    });
  });

  describe('deleteRole', () => {
    it('should delete an existing role', async () => {
      // First, create a role to delete
      const newRole = await db.role.create({
        data: { role_title: 'Role to Delete' }
      });

      const result = await deleteRole(newRole.role_id);
      expect(result.success).toBe(true);

      // Verify the role is deleted
      const deletedRole = await db.role.findUnique({
        where: { role_id: newRole.role_id }
      });
      expect(deletedRole).toBeNull();
    });

    it('should fail to delete a non-existent role', async () => {
      const result = await deleteRole(99999); // Non-existent role_id
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to delete role!');
    });
  });
});
