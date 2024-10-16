import { db } from '@/lib/db';
import { GET, PUT, DELETE } from '@/app/api/roles/[roleId]/route';
import { NextRequest, NextResponse } from 'next/server';

describe('Integration Test for GET /api/roles/:roleId', () => {
  let testRoleId: number;

  beforeAll(async () => {
    console.log('Database URL:', process.env.DATABASE_URL);
    await db.$connect();
    await db.users.deleteMany();

    // Seed the database with a test role, let Prisma auto-generate the role_id
    const role = await db.role.create({
      data: {
        role_title: 'Test Role' // Do not specify ifrole_id
      }
    });
    testRoleId = role.role_id; // Capture the generated role_id
  });

  afterAll(async () => {
    // Clean up users associated with the role first
    await db.users.deleteMany({
      where: { role_id: testRoleId }
    });

    // Clean up the role
    await db.role.deleteMany({
      where: { role_id: testRoleId }
    });

    await db.$disconnect();
  });

  it('should return a role by role_id (200)', async () => {
    const req = new NextRequest(`http://localhost/api/roles/${testRoleId}`);
    const response = await GET(req, {
      params: { roleId: testRoleId.toString() }
    });
    const jsonResponse = await response.json();

    expect(response.status).toBe(200);
    expect(jsonResponse.role_id).toBe(testRoleId);
    expect(jsonResponse.role_title).toBe('Test Role');
  });

  it('should return 404 if role not found', async () => {
    const req = new NextRequest(`http://localhost/api/roles/999999`);
    const response = await GET(req, { params: { roleId: '999999' } });
    const jsonResponse = await response.json();

    expect(response.status).toBe(404);
    expect(jsonResponse.error).toBe('Role not found');
  });

  it('should return 400 if roleId is invalid', async () => {
    const req = new NextRequest(`http://localhost/api/roles/abc`);
    const response = await GET(req, { params: { roleId: 'abc' } });
    const jsonResponse = await response.json();

    expect(response.status).toBe(400);
    expect(jsonResponse.error).toBe('Invalid roleId');

    //     it('should return 404 if role not found', async () => {
    //       const req = createRequest({
    //         method: 'GET',
    //         url: '/api/roles/99999',
    //         params: { roleId: '99999' }
    //       });
    //       const res = createResponse();

    //       // Call the API handler
    //       await GET(req as unknown as Request, { params: { roleId: '99999' } });

    //       // Ensure the response is finalized
    //       res.end();

    //       const jsonResponse = res._getJSONData();
    //       expect(res.statusCode).toBe(404);
    //       expect(jsonResponse.error).toBe('Role not found');
    //     });

    //     it('should return 400 for invalid roleId', async () => {
    //       const req = createRequest({
    //         method: 'GET',
    //         url: '/api/roles/invalid',
    //         params: { roleId: 'invalid' }
    //       });
    //       const res = createResponse();

    //       // Call the API handler
    //       await GET(req as unknown as Request, { params: { roleId: 'invalid' } });

    //       // Ensure the response is finalized
    //       res.end();

    //       const jsonResponse = res._getJSONData();
    //       expect(res.statusCode).toBe(400);
    //       expect(jsonResponse.error).toBe('Invalid roleId');
    //     });
    //   });
    // });

    // describe('PUT /api/roles/:roleId', () => {
    //   let testRoleId: number;

    //   it('should update a role', async () => {
    //     const req = createRequest({
    //       method: 'PUT',
    //       url: `/api/roles/${testRoleId}`,
    //       params: { roleId: testRoleId.toString() },
    //       body: { role_title: 'Updated Test Role' }
    //     });
    //     const res = createResponse();

    //     await PUT(req as unknown as Request, { params: { roleId: testRoleId.toString() } });

    //     res.end();

    //     const jsonResponse = res._getJSONData();
    //     expect(res.statusCode).toBe(200);
    //     expect(jsonResponse.success).toBe(true);
    //   });

    //   it('should return 400 for invalid roleId', async () => {
    //     const req = createRequest({
    //       method: 'PUT',
    //       url: '/api/roles/invalid',
    //       params: { roleId: 'invalid' },
    //       body: { role_title: 'Invalid Role' }
    //     });
    //     const res = createResponse();

    //     await PUT(req as unknown as Request, { params: { roleId: 'invalid' } });

    //     res.end();

    //     const jsonResponse = res._getJSONData();
    //     expect(res.statusCode).toBe(400);
    //     expect(jsonResponse.error).toBe('Invalid roleId');
    //   });
    // });

    //   describe('DELETE /api/roles/:roleId', () => {
    //     it('should delete an existing role', async () => {
    //       // First, create a role to delete
    //       const newRole = await db.role.create({
    //         data: { role_title: 'Role to Delete' }
    //       });

    //       const req = createRequest({
    //         method: 'DELETE',
    //         url: `/api/roles/${newRole.role_id}`,
    //         params: { roleId: newRole.role_id.toString() }
    //       });
    //       const res = createResponse();

    //       await DELETE(req as unknown as Request, { params: { roleId: newRole.role_id.toString() } });
    //       res.end();

    //       const jsonResponse = res._getJSONData();
    //       expect(res.statusCode).toBe(200);
    //       expect(jsonResponse.success).toBe(true);
    //     });

    //     it('should return 404 for a non-existent role', async () => {
    //       const req = createRequest({
    //         method: 'DELETE',
    //         url: '/api/roles/99999',
    //         params: { roleId: '99999' }
    //       });
    //       const res = createResponse();

    //       await DELETE(req as unknown as Request, { params: { roleId: '99999' } });
    //       res.end();

    //       const jsonResponse = res._getJSONData();
    //       expect(res.statusCode).toBe(400);
    //       expect(jsonResponse.error).toBe('Failed to delete role!');
    //     });

    //     it('should return 400 for invalid roleId', async () => {
    //       const req = createRequest({
    //         method: 'DELETE',
    //         url: '/api/roles/invalid',
    //         params: { roleId: 'invalid' }
    //       });
    //       const res = createResponse();

    //       await DELETE(req as unknown as Request, { params: { roleId: 'invalid' } });
    //       res.end();

    //       const jsonResponse = res._getJSONData();
    //       expect(res.statusCode).toBe(400);
    //       expect(jsonResponse.error).toBe('Invalid roleId');
  });
});
