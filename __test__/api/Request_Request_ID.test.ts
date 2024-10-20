import {
  GET,
  PUT,
  DELETE,
  OPTIONS
} from '@/app/api/requests/[requestId]/route';
import { db } from '@/lib/db';

describe('Requests API Integration Tests', () => {
  const mockRequestId = 1;

  // Mock data for the request
  const mockRole = {
    role_id: 1,
    role_title: 'Manager'
  };

  const mockUser = {
    staff_id: 1, // This will be filled after creating the user
    staff_fname: 'John',
    staff_lname: 'Doe',
    department: 'Sales',
    position: 'Sales Manager',
    country: 'USA',
    email: 'john.doe@example.com',
    reporting_manager: null, // No manager for now
    role_id: 1, // This will be filled after creating the role
    temp_replacement: null
  };

  const mockRequest = {
    request_id: mockRequestId,
    staff_id: 1, // This will be filled after creating the user
    timeslot: 'AM',
    daterange: [new Date('2024-10-10')],
    reason: 'Medical reason',
    approved: 'Pending'
  };

  // Ensure the database is cleaned up before and after each test
  beforeEach(async () => {
    // Create mock role
    const role = await db.role.create({
      data: mockRole
    });

    // Update the mock user to reference the created role
    mockUser.role_id = role.role_id;

    // Create mock user
    const user = await db.users.create({
      data: mockUser
    });

    // Update the mock request to reference the created user
    mockRequest.staff_id = user.staff_id;

    // Create mock request
    await db.requests.create({
      data: mockRequest
    });
  });

  afterEach(async () => {
    // Clean up all data from the related tables
    await db.logs.deleteMany();
    await db.delegation_requests.deleteMany();
    await db.requests.deleteMany();
    await db.users.deleteMany();
    await db.role.deleteMany();
  });

  // Test for GET request
  describe('GET /api/requests/:requestId', () => {
    it('should return a specific request when requestId is valid', async () => {
      const req = new Request(
        `http://localhost:3000/api/requests/${mockRequestId}`
      );
      const params = { requestId: String(mockRequestId) };
      const response = await GET(req, { params });

      const json = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(json.request_id).toBe(mockRequestId);
    });

    it('should return 400 when requestId is invalid', async () => {
      const req = new Request(`http://localhost:3000/api/requests/invalid`);
      const params = { requestId: 'invalid' };
      const response = await GET(req, { params });

      const json = await response.json();
      expect(response.status).toBe(400);
      expect(json.error).toBe('Invalid requestId');
    });

    it('should return 404 when request is not found', async () => {
      // Ensure the request doesn't exist
      await db.requests.delete({ where: { request_id: mockRequestId } });

      const req = new Request(
        `http://localhost:3000/api/requests/${mockRequestId}`
      );
      const params = { requestId: String(mockRequestId) };
      const response = await GET(req, { params });

      const json = await response.json();
      expect(response.status).toBe(404);
      expect(json.error).toBe('Request not found');
    });
  });

  // Test for PUT request
  describe('PUT /api/requests/:requestId', () => {
    it('should update the database when requestId is valid', async () => {
      const req = new Request(
        `http://localhost:3000/api/requests/${mockRequestId}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            timeslot: 'PM',
            daterange: [new Date('2024-10-11')],
            reason: 'Personal reason'
          })
        }
      );

      const params = { requestId: String(mockRequestId) };
      const response = await PUT(req, { params });

      const json = await response.json();

      // Check the response
      expect(response.status).toBe(200);
      expect(json.success).toBe(true);

      // Query the database to ensure the update occurred
      const updatedRequest = await db.requests.findUnique({
        where: { request_id: mockRequestId }
      });

      // Verify the database has been updated
      if (updatedRequest) {
        expect(updatedRequest.timeslot).toBe('PM');
        expect(updatedRequest.daterange[0]).toEqual(new Date('2024-10-11'));
      }
    });
  });

  // Test for DELETE request
  describe('DELETE /api/requests/:requestId', () => {
    it('should delete a specific request when requestId is valid', async () => {
      const req = new Request(
        `http://localhost:3000/api/requests/${mockRequestId}`,
        {
          method: 'DELETE'
        }
      );
      const params = { requestId: String(mockRequestId) };
      const response = await DELETE(req, { params });

      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);

      // Verify the request is deleted from the database
      const deletedRequest = await db.requests.findUnique({
        where: { request_id: mockRequestId }
      });
      expect(deletedRequest).toBeNull();
    });

    it('should return 404 if request is not found', async () => {
      // Ensure the request doesn't exist
      await db.requests.delete({ where: { request_id: mockRequestId } });

      const req = new Request(
        `http://localhost:3000/api/requests/${mockRequestId}`,
        {
          method: 'DELETE'
        }
      );
      const params = { requestId: String(mockRequestId) };
      const response = await DELETE(req, { params });

      const json = await response.json();
      expect(response.status).toBe(404);
      expect(json.error).toBe('Request not found');
    });
  });

  // Test for OPTIONS request
  describe('OPTIONS /api/requests/:requestId', () => {
    it('should return the allowed HTTP methods', async () => {
      const response = await OPTIONS();

      const json = await response.json();
      expect(response.status).toBe(200);
      expect(json.allow).toEqual(['GET', 'PUT', 'DELETE']);
    });
  });
});
