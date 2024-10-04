import { GET, PUT, DELETE, OPTIONS } from '@/app/api/users/[staffId]/route'; // Import your API route handlers
import { db } from '@/lib/db'; // Changed to named import

describe('Integration Tests for User API Routes', () => {
  beforeAll(async () => {
    await db.$connect(); // Connect to your test database
  });

  afterAll(async () => {
    await db.$disconnect(); // Clean up and close the database connection
  });

  beforeEach(async () => {
    // Ensure the test user is deleted before each test
    await db.users.deleteMany({ where: { staff_id: 123123 } });
  });

  afterEach(async () => {
    await db.logs.deleteMany(); // Delete records from the logs table
    await db.users.deleteMany({ where: { staff_id: 123123 } }); // Now delete from users
  });

  //GET (Fetch user)
  it('should update the user successfully (GET /api/user/:staffId)', async () => {
    await db.users.create({
      data: {
        staff_id: 123123,
        staff_fname: 'John',
        staff_lname: 'Doe',
        department: 'Sales',
        position: 'Manager',
        country: 'USA',
        email: 'tester123@example.com',
        role_id: 1 // Assuming role_id 1 exists
      }
    });

    const req = new Request('http://localhost:3000/api/user/123123', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const params = { staffId: '123123' };
    const response = await GET(req, { params });

    expect(response.status).toBe(200);

    // Step 3: Verify the response
    // const json = await response.json();

    const updatedUser = await db.users.findUnique({
      where: { staff_id: 123123 }
    });
    expect(updatedUser).not.toBeNull();
    expect(
      (updatedUser as { staff_fname: string; staff_lname: string }).staff_fname
    ).toBe('John');
    expect(
      (updatedUser as { staff_fname: string; staff_lname: string }).staff_lname
    ).toBe('Doe');
  });

  // PUT (Update user)
  it('should update the user successfully (PUT /api/user/:staffId)', async () => {
    await db.users.create({
      data: {
        staff_id: 123123,
        staff_fname: 'John',
        staff_lname: 'Doe',
        department: 'Sales',
        position: 'Manager',
        country: 'USA',
        email: 'tester123@example.com',
        role_id: 1 // Assuming role_id 1 exists
      }
    });

    const req = new Request('http://localhost:3000/api/user/123123', {
      method: 'PUT',
      body: JSON.stringify({ staff_fname: 'Jane', staff_lname: 'Smith' }),
      headers: { 'Content-Type': 'application/json' }
    });
    const params = { staffId: '123123' };
    const response = await PUT(req, { params });

    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);

    const updatedUser = await db.users.findUnique({
      where: { staff_id: 123123 }
    });
    expect(updatedUser).not.toBeNull();
    expect(
      (updatedUser as { staff_fname: string; staff_lname: string }).staff_fname
    ).toBe('Jane');
    expect(
      (updatedUser as { staff_fname: string; staff_lname: string }).staff_lname
    ).toBe('Smith');
  });

  // DELETE (Delete user)
  it('should delete the user successfully (DELETE /api/user/:staffId)', async () => {
    await db.users.create({
      data: {
        staff_id: 123123,
        staff_fname: 'John',
        staff_lname: 'Doe',
        department: 'Sales',
        position: 'Manager',
        country: 'USA',
        email: 'test123@example.com',
        role_id: 1 // Assuming role_id 1 exists
      }
    });

    const req = new Request('http://localhost:3000/api/user/123', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    const params = { staffId: '123123' };
    const response = await DELETE(req, { params });

    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);

    const deletedUser = await db.users.findUnique({
      where: { staff_id: 123123 }
    });
    expect(deletedUser).toBeNull();
  });

  // More tests for failure scenarios (invalid staffId, user not found, etc.)
});
