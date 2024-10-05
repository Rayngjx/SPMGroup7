import { GET, OPTIONS } from '@/app/api/logs/processor/[processorId]/route'; // Adjust the import path as necessary
import { db } from '@/lib/db';

describe('Logs API by ProcessorId Integration Tests', () => {
  const testProcessorId = 1; // Replace this with a valid processorId in your schema
  const testStaffId = 2; // Replace this with a valid staff_id in your schema

  const testUserProcessor = {
    staff_id: testProcessorId,
    staff_fname: 'Processor',
    staff_lname: 'User',
    email: 'processor@example.com',
    department: 'Test Department',
    position: 'Test Position',
    country: 'Test Country',
    role_id: 1 // Assuming role_id 2 exists
  };

  const testUserStaff = {
    staff_id: testStaffId,
    staff_fname: 'Staff',
    staff_lname: 'User',
    email: 'staff@example.com',
    department: 'Test Department',
    position: 'Test Position',
    country: 'Test Country',
    role_id: 2 // Assuming role_id 2 exists
  };

  const testLog = {
    staff_id: testStaffId, // Reference a valid staff_id from the users table
    request_id: 123, // Required
    processor_id: testProcessorId, // Reference a valid processor_id from the users table
    reason: 'Testing log creation', // Optional, can be null or string
    request_type: 'Test Request', // String as per the schema (length limit of 50)
    approved: 'Yes', // Optional, can be null or string (length limit of 20)
    timestamp: new Date('2024-01-01'), // Ensure you're passing a valid date
    users_logs_staff_idTousers: {
      connect: { staff_id: testStaffId } // Connect to existing staff_id
    },
    users_logs_processor_idTousers: {
      connect: { staff_id: testProcessorId } // Connect to existing processor_id
    }
  };

  beforeAll(async () => {
    // Connect to the test database
    await db.$connect();

    // Seed the users table with processor and staff users
    await db.users.createMany({
      data: [testUserProcessor, testUserStaff]
    });

    // Seed the database with a test log entry
    await db.logs.create({ data: testLog });
  });

  afterAll(async () => {
    // Clean up the test data
    await db.logs.deleteMany({ where: { processor_id: testProcessorId } });
    await db.users.deleteMany({
      where: { staff_id: { in: [testProcessorId, testStaffId] } }
    });
    await db.$disconnect();
  });

  describe('GET /api/logs/[processorId]', () => {
    it('should return logs for valid processorId', async () => {
      // Simulate GET request for logs by processorId
      const req = new Request(
        `http://localhost:3000/api/logs/${testProcessorId}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const params = { processorId: String(testProcessorId) };
      const response = await GET(req, { params });
      const json = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(json.length).toBeGreaterThan(0);
      expect(json[0].processor_id).toBe(testProcessorId);
    });

    it('should return 404 if no logs are found for a valid processorId', async () => {
      const invalidProcessorId = 99999; // Assume this processorId doesn't exist
      const req = new Request(
        `http://localhost:3000/api/logs/${invalidProcessorId}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const params = { processorId: String(invalidProcessorId) };
      const response = await GET(req, { params });
      const json = await response.json();

      // Assertions
      expect(response.status).toBe(404);
      expect(json.error).toBe('No logs found for this processor');
    });

    it('should return 400 for invalid processorId', async () => {
      const req = new Request(`http://localhost:3000/api/logs/invalid`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const params = { processorId: 'invalid' }; // Invalid processorId
      const response = await GET(req, { params });
      const json = await response.json();

      // Assertions
      expect(response.status).toBe(400);
      expect(json.error).toBe('Invalid processorId');
    });

    it('should return 500 if there is a database error', async () => {
      // Temporarily disconnect the database to simulate a database error
      await db.$disconnect();

      const req = new Request(
        `http://localhost:3000/api/logs/${testProcessorId}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const params = { processorId: String(testProcessorId) };
      const response = await GET(req, { params });
      const json = await response.json();

      // Assertions
      expect(response.status).toBe(500);
      expect(json.error).toBe('Failed to fetch processor logs');

      // Reconnect the database
      await db.$connect();
    });
  });

  describe('OPTIONS /api/logs/[processorId]', () => {
    it('should return allowed methods', async () => {
      const response = await OPTIONS();

      const json = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(json.allow).toEqual(expect.arrayContaining(['GET']));
    });
  });
});
