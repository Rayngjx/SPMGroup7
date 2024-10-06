import { GET, POST, OPTIONS } from '@/app/api/users/all/route'; // Adjust the import path
import { db } from '@/lib/db';
import { createUser, getAllUsers } from '@/lib/crudFunctions/Staff';

describe('Users API Route Integration Tests', () => {
  const testUser = {
    staff_id: 12345,
    staff_fname: 'John',
    staff_lname: 'Doe',
    email: 'johndoe@example.com',
    department: 'Sales',
    position: 'Manager',
    country: 'USA',
    reporting_manager: 140894,
    role_id: 1 // Assuming role_id 1 exists
  };

  beforeAll(async () => {
    // Connect to the test database
    await db.$connect();
  });

  afterAll(async () => {
    // Clean up test data and disconnect
    await db.users.deleteMany({ where: { staff_id: testUser.staff_id } });
    await db.$disconnect();
  });

  describe('GET /api/users', () => {
    it('should return all users', async () => {
      // Seed a user in the database
      await createUser(testUser);

      // Simulate the GET request
      const response = await GET();

      const json = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(json.length).toBeGreaterThan(0);
      expect(json[0]).toHaveProperty('staff_id');
    });

    it('should return 500 if there is a database error', async () => {
      // Temporarily disconnect the database to simulate an error
      await db.$disconnect();

      const response = await GET();
      const json = await response.json();

      // Assertions
      expect(response.status).toBe(500);
      expect(json.error).toBe('Failed to fetch users');

      // Reconnect the database
      await db.$connect();
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user successfully', async () => {
      // Simulate the POST request with test data
      const req = new Request('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(testUser),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(req);
      const json = await response.json();

      // Assertions
      expect(response.status).toBe(201);
      expect(json.success).toBe(true);

      // Verify the user was added in the database
      const createdUser = await db.users.findUnique({
        where: { staff_id: testUser.staff_id }
      });

      expect(createdUser).not.toBeNull();
      expect(createdUser?.email).toBe(testUser.email);
    });

    it('should return 400 if creating a user fails', async () => {
      // Simulate the POST request with invalid data (missing required fields)
      const invalidUser = { staff_fname: 'Missing Fields' };
      const req = new Request('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(invalidUser),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(req);
      const json = await response.json();

      // Assertions
      expect(response.status).toBe(400);
      expect(json.error).toBeDefined();
    });

    it('should return 500 if there is a database error', async () => {
      // Temporarily disconnect the database to simulate an error
      await db.$disconnect();

      const req = new Request('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify(testUser),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(req);
      const json = await response.json();

      // Assertions
      expect(response.status).toBe(500);
      expect(json.error).toBe('Failed to create user');

      // Reconnect the database
      await db.$connect();
    });
  });

  describe('OPTIONS /api/users', () => {
    it('should return allowed methods', async () => {
      const response = await OPTIONS();

      const json = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(json.allow).toEqual(expect.arrayContaining(['GET', 'POST']));
    });
  });
});
