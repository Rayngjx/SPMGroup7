import {
  GET,
  OPTIONS
} from '@/app/api/requests/[requestId]/by-manager/[managerStaffId]/route'; // Adjust the import path as needed
import { db } from '@/lib/db';

describe('Team Requests API by ManagerStaffId Integration Tests', () => {
  const testManagerStaffId = 1; // Replace this with a valid managerStaffId in your schema
  const testStaffId = 2; // Replace this with a valid staff_id for a team member

  const testManager = {
    staff_id: testManagerStaffId,
    staff_fname: 'Manager',
    staff_lname: 'User',
    email: 'manager@example.com',
    department: 'Test Department',
    position: 'Manager',
    country: 'Test Country',
    role_id: 1 // Assuming role_id 1 exists for managers
  };

  const testTeamMember = {
    staff_id: testStaffId,
    staff_fname: 'Team',
    staff_lname: 'Member',
    email: 'teammember@example.com',
    department: 'Test Department',
    position: 'Team Member',
    country: 'Test Country',
    role_id: 2, // Assuming role_id 2 exists for team members
    reporting_manager: testManagerStaffId // Set reporting manager to the manager
  };

  const testRequest = {
    staff_id: testStaffId,
    timeslot: 'AM',
    daterange: [new Date('2023-10-01'), new Date('2023-10-05')],
    reason: 'Test Request Reason',
    approved: 'Pending'
  };

  beforeAll(async () => {
    // Connect to the test database
    await db.$connect();

    // Seed the users table with manager and team member users
    await db.users.createMany({
      data: [testManager, testTeamMember]
    });

    // Seed the database with a test request
    await db.requests.create({
      data: testRequest
    });
  });

  afterAll(async () => {
    // Clean up the test data
    await db.requests.deleteMany({ where: { staff_id: testStaffId } });
    await db.users.deleteMany({
      where: { staff_id: { in: [testManagerStaffId, testStaffId] } }
    });
    await db.$disconnect();
  });

  describe('GET /api/team/requests/[managerStaffId]', () => {
    it('should return requests for valid managerStaffId', async () => {
      // Simulate GET request for team requests by managerStaffId
      const req = new Request(
        `http://localhost:3000/api/team/requests/${testManagerStaffId}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const params = { managerStaffId: String(testManagerStaffId) };
      const response = await GET(req, { params });
      const json = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(json.length).toBeGreaterThan(0);
      expect(json[0].staff_id).toBe(testStaffId); // Ensure the staff_id matches the team member
    });

    it('should return 404 if no requests are found for the managerStaffId', async () => {
      const invalidManagerStaffId = 99999; // Assume this managerStaffId doesn't exist
      const req = new Request(
        `http://localhost:3000/api/team/requests/${invalidManagerStaffId}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const params = { managerStaffId: String(invalidManagerStaffId) };
      const response = await GET(req, { params });
      const json = await response.json();

      // Assertions
      expect(response.status).toBe(404);
      expect(json.error).toBe('No requests found for this manager');
    });

    it('should return 400 for invalid managerStaffId', async () => {
      const req = new Request(
        `http://localhost:3000/api/team/requests/invalid`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const params = { managerStaffId: 'invalid' }; // Invalid managerStaffId
      const response = await GET(req, { params });
      const json = await response.json();

      // Assertions
      expect(response.status).toBe(400);
      expect(json.error).toBe('Invalid managerStaffId');
    });

    // it('should return 500 if there is a database error', async () => {
    //   // Temporarily disconnect the database to simulate a database error
    //   await db.$disconnect();

    //   const req = new Request(
    //     `http://localhost:3000/api/team/requests/${testManagerStaffId}`,
    //     {
    //       method: 'GET',
    //       headers: { 'Content-Type': 'application/json' },
    //     }
    //   );

    //   const params = { managerStaffId: String(testManagerStaffId) };
    //   const response = await GET(req, { params });
    //   const json = await response.json();

    //   // Assertions
    //   expect(response.status).toBe(500);
    //   expect(json.error).toBe('Failed to fetch team requests');

    //   // Reconnect the database
    //   await db.$connect();
    // });
  });

  describe('OPTIONS /api/team/requests/[managerStaffId]', () => {
    it('should return allowed methods', async () => {
      const response = await OPTIONS();
      const json = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(json.allow).toEqual(expect.arrayContaining(['GET']));
    });
  });
});
