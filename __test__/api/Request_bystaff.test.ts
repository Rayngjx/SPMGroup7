import {
  GET,
  PUT,
  DELETE,
  OPTIONS
} from '@/app/api/requests/[requestId]/route'; // Adjust the import path as needed
import { db } from '@/lib/db';

describe('Requests API Integration Tests', () => {
  const testRequestId = 1000; // Set this to a valid requestId in your test database
  const newTestRequestId = 9999; // For creating a new request
  const uniqueSuffix = Date.now(); // Create a unique suffix using the current timestamp
  const uniqueEmail = `testuser${uniqueSuffix}@example.com`; // Generate a unique email
  const testPayload = {
    staff_id: 1,
    timeslot: 'AM', // Make sure this matches your constraint
    daterange: [new Date('2024-10-01'), new Date('2024-10-02')],
    reason: 'Test Request',
    approved: 'Pending'
  };

  beforeAll(async () => {
    // Connect to the test database
    await db.$connect();
    db.approved_dates.deleteMany();
    db.requests.deleteMany();
    db.users.deleteMany();
    // Clean up any previous test data before creating new records
    // Seed the database with unique user and request data
    await db.users.create({
      data: {
        staff_id: 1, // Ensure this matches the `staff_id` in your test request
        staff_fname: 'Test',
        staff_lname: 'User',
        email: uniqueEmail, // Use the generated unique email
        department: 'Test Department',
        position: 'Tester',
        country: 'Testland',
        role_id: 1 // Assuming you have a valid role_id
      }
    });

    await db.requests.create({
      data: {
        request_id: testRequestId, // Ensure testRequestId is unique
        staff_id: 1, // This must match the `staff_id` in the users table
        timeslot: 'AM', // Valid timeslot
        daterange: [new Date('2024-10-01'), new Date('2024-10-05')],
        reason: 'Test Request Reason',
        approved: 'Pending'
      }
    });
  });

  afterAll(async () => {
    // Delete related entries from `approved_dates` before removing the `requests`
    await db.approved_dates.deleteMany({
      where: { staff_id: 1 } // Adjust to your test data
    });

    // Then delete the requests associated with the user
    await db.requests.deleteMany({
      where: { staff_id: 1 } // Adjust to your test data
    });

    // Finally, delete the user
    await db.users.deleteMany({
      where: { staff_id: 1 } // Adjust to your test data
    });

    await db.$disconnect();
  });

  describe('GET /api/requests/[requestId]', () => {
    it('should return the request for a valid requestId', async () => {
      const req = new Request(
        `http://localhost:3000/api/requests/${testRequestId}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const params = { requestId: String(testRequestId) };
      const response = await GET(req, { params });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.request_id).toBe(testRequestId);
    });

    it('should return 404 if the request is not found', async () => {
      const invalidRequestId = 99999; // Assume this requestId doesn't exist in the DB
      const req = new Request(
        `http://localhost:3000/api/requests/${invalidRequestId}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const params = { requestId: String(invalidRequestId) };
      const response = await GET(req, { params });
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error).toBe('Request not found');
    });

    it('should return 400 for an invalid requestId', async () => {
      const req = new Request(`http://localhost:3000/api/requests/invalid`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const params = { requestId: 'invalid' }; // Invalid requestId
      const response = await GET(req, { params });
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Invalid requestId');
    });
  });

  describe('PUT /api/requests/[requestId]', () => {
    it('should update a request for a valid requestId', async () => {
      const req = new Request(
        `http://localhost:3000/api/requests/${testRequestId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ timeslot: 'PM' }), // Update a field like timeslot
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const params = { requestId: String(testRequestId) };
      const response = await PUT(req, { params });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);

      // Verify the change in the database
      const updatedRequest = await db.requests.findUnique({
        where: { request_id: testRequestId }
      });
      expect(updatedRequest?.timeslot).toBe('PM');
    });

    it('should return 400 if update fails', async () => {
      const req = new Request(
        `http://localhost:3000/api/requests/${testRequestId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ timeslot: 'InvalidTimeslot' }), // Invalid due to constraint
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const params = { requestId: String(testRequestId) };
      const response = await PUT(req, { params });
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBeTruthy();
    });
  });

  describe('DELETE /api/requests/[requestId]', () => {
    it('should delete a request for a valid requestId', async () => {
      // Insert a new request to delete
      await db.requests.create({
        data: {
          request_id: newTestRequestId,
          ...testPayload
        }
      });

      const req = new Request(
        `http://localhost:3000/api/requests/${newTestRequestId}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const params = { requestId: String(newTestRequestId) };
      const response = await DELETE(req, { params });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);

      // Verify the request was deleted in the database
      const deletedRequest = await db.requests.findUnique({
        where: { request_id: newTestRequestId }
      });
      expect(deletedRequest).toBeNull();
    });

    it('should return 400 if delete fails', async () => {
      const invalidRequestId = 99999; // Assume this requestId doesn't exist in the DB
      const req = new Request(
        `http://localhost:3000/api/requests/${invalidRequestId}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const params = { requestId: String(invalidRequestId) };
      const response = await DELETE(req, { params });
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBeTruthy();
    });
  });

  describe('OPTIONS /api/requests/[requestId]', () => {
    it('should return allowed methods', async () => {
      const response = await OPTIONS();
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.allow).toEqual(
        expect.arrayContaining(['GET', 'PUT', 'DELETE'])
      );
    });
  });
});
