import { GET, POST, OPTIONS } from '@/app/api/users/route'; // Adjust the import path
import { db } from '@/lib/db';
import { createUser } from '@/lib/crudFunctions/Staff'; // Adjust based on where the function is located

describe('Users API Route Integration Tests', () => {
  const testUser = {
    staff_id: 12345,
    staff_fname: 'John',
    staff_lname: 'Doe',
    email: 'johndoe@example.com',
    department: 'Sales',
    position: 'Manager',
    country: 'USA',
    reporting_manager: undefined,
    role_id: 1 // Assuming role_id 1 exists
  };

  beforeAll(async () => {
    await db.users.deleteMany();
    await db.$connect(); // Connect to the test database
  });

  afterEach(async () => {
    await db.users.deleteMany({ where: { staff_id: testUser.staff_id } }); // Clean up test data after each test
  });

  afterAll(async () => {
    await db.$disconnect(); // Disconnect after all tests are complete
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

    it('should return an empty array if no users are found', async () => {
      // Simulate the GET request without creating a user
      const response = await GET();
      const json = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(json).toEqual([]); // Expect an empty array
    });

    it('should return 500 if there is a database error', async () => {
      // Mock a database error by making `getAllUsers` throw an error
      jest
        .spyOn(db.users, 'findMany')
        .mockRejectedValueOnce(new Error('Database error'));

      const response = await GET();
      const json = await response.json();

      // Assertions
      expect(response.status).toBe(500);
      expect(json.error).toBe('Failed to fetch users');
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

      // Verify the user was added to the database
      const createdUser = await db.users.findUnique({
        where: { staff_id: testUser.staff_id }
      });

      expect(createdUser).not.toBeNull();
      expect(createdUser?.email).toBe(testUser.email);
    });

    it('should return 400 if required fields are missing', async () => {
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
      // Mock a database error by making `createUser` throw an error
      jest
        .spyOn(db.users, 'create')
        .mockRejectedValueOnce(new Error('Database error'));

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
    });
  });

  it('should return allowed methods', async () => {
    const response = await OPTIONS();

    // Assertions
    expect(response.status).toBe(200);
    expect(response.headers.get('Allow')).toEqual(
      expect.stringContaining('GET, PUT, DELETE')
    );
  });
});
