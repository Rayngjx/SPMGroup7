import { GET, PUT, DELETE, OPTIONS } from '@/app/api/logs/[logId]/route'; // Adjust the path as necessary
import { db } from '@/lib/db';
import { updateLog, deleteLog } from '@/lib/crudFunctions/Logs';

describe('Logs API Route Integration Tests', () => {
  const testLog = {
    log_id: 12345,
    staff_id: 1, // Assuming this staff_id exists in your users table
    request_id: 1,
    request_type: 'Test Request',
    reason: 'Test Reason'
  };

  beforeAll(async () => {
    // Connect to your test database
    await db.$connect();

    // Seed the database with a test log entry
    await db.logs.create({ data: testLog });
  });

  afterAll(async () => {
    // Clean up the test data
    await db.logs.deleteMany({ where: { log_id: testLog.log_id } });
    await db.$disconnect();
  });

  describe('GET /api/logs/[logId]', () => {
    it('should return a specific log entry for valid logId', async () => {
      // Simulate GET request for a specific log entry
      const req = new Request(
        `http://localhost:3000/api/logs/${testLog.log_id}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const params = { logId: String(testLog.log_id) };
      const response = await GET(req, { params });
      const json = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(json.log_id).toBe(testLog.log_id);
      expect(json.request_id).toBe(testLog.request_id);
    });

    it('should return 404 for non-existent log entry', async () => {
      const invalidLogId = 99999; // Assume this logId doesn't exist
      const req = new Request(
        `http://localhost:3000/api/logs/${invalidLogId}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const params = { logId: String(invalidLogId) };
      const response = await GET(req, { params });
      const json = await response.json();

      // Assertions
      expect(response.status).toBe(404);
      expect(json.error).toBe('Log not found');
    });

    it('should return 400 for invalid logId', async () => {
      const req = new Request('http://localhost:3000/api/logs/invalid', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const params = { logId: 'invalid' }; // Invalid logId
      const response = await GET(req, { params });
      const json = await response.json();

      // Assertions
      expect(response.status).toBe(400);
      expect(json.error).toBe('Invalid logId');
    });
  });

  describe('PUT /api/logs/[logId]', () => {
    it('should update a log entry for valid logId', async () => {
      const updatedLogData = {
        reason: 'Another Reason'
      };

      const req = new Request(
        `http://localhost:3000/api/logs/${testLog.log_id}`,
        {
          method: 'PUT',
          body: JSON.stringify(updatedLogData),
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const params = { logId: String(testLog.log_id) };
      const response = await PUT(req, { params });
      const json = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(json.success).toBe(true);

      // Verify the log was updated in the database
      const updatedLog = await db.logs.findUnique({
        where: { log_id: testLog.log_id }
      });
      expect(updatedLog?.reason).toBe(updatedLogData.reason);
    });

    it('should return 400 for invalid log update data', async () => {
      const invalidUpdateData = {
        action: '' // Invalid data (empty action)
      };

      const req = new Request(
        `http://localhost:3000/api/logs/${testLog.log_id}`,
        {
          method: 'PUT',
          body: JSON.stringify(invalidUpdateData),
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const params = { logId: String(testLog.log_id) };
      const response = await PUT(req, { params });
      const json = await response.json();

      // Assertions
      expect(response.status).toBe(400);
      expect(json.error).toBeDefined();
    });

    it('should return 500 for database error during log update', async () => {
      // Temporarily disconnect the database to simulate an error
      await db.$disconnect();

      const validUpdateData = {
        action: 'Another Update',
        timestamp: new Date('2024-03-01'),
        staff_id: 1
      };

      const req = new Request(
        `http://localhost:3000/api/logs/${testLog.log_id}`,
        {
          method: 'PUT',
          body: JSON.stringify(validUpdateData),
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const params = { logId: String(testLog.log_id) };
      const response = await PUT(req, { params });
      const json = await response.json();

      // Assertions
      expect(response.status).toBe(500);
      expect(json.error).toBe('Failed to update log entry');

      // Reconnect the database
      await db.$connect();
    });
  });

  describe('DELETE /api/logs/[logId]', () => {
    it('should delete a log entry for valid logId', async () => {
      // Simulate DELETE request for a specific log entry
      const req = new Request(
        `http://localhost:3000/api/logs/${testLog.log_id}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const params = { logId: String(testLog.log_id) };
      const response = await DELETE(req, { params });
      const json = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(json.success).toBe(true);

      // Verify the log was deleted in the database
      const deletedLog = await db.logs.findUnique({
        where: { log_id: testLog.log_id }
      });
      expect(deletedLog).toBeNull();
    });

    it('should return 400 for invalid logId during delete', async () => {
      const invalidLogId = 'invalid'; // Invalid logId

      const req = new Request(
        `http://localhost:3000/api/logs/${invalidLogId}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const params = { logId: invalidLogId };
      const response = await DELETE(req, { params });
      const json = await response.json();

      // Assertions
      expect(response.status).toBe(400);
      expect(json.error).toBe('Invalid logId');
    });

    it('should return 500 for database error during delete', async () => {
      // Temporarily disconnect the database to simulate an error
      await db.$disconnect();

      const req = new Request(
        `http://localhost:3000/api/logs/${testLog.log_id}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const params = { logId: String(testLog.log_id) };
      const response = await DELETE(req, { params });
      const json = await response.json();

      // Assertions
      expect(response.status).toBe(500);
      expect(json.error).toBe('Failed to delete log entry');

      // Reconnect the database
      await db.$connect();
    });
  });

  describe('OPTIONS /api/logs/[logId]', () => {
    it('should return allowed methods', async () => {
      const response = await OPTIONS();

      const json = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(json.allow).toEqual(
        expect.arrayContaining(['GET', 'PUT', 'DELETE'])
      );
    });
  });
});
