import { GET } from '@/app/api/approved-dates/department/[deptId]/route'; // Adjust the import path as needed
import {
  getApprovedDates,
  getUserApprovedDates,
  getTeamApprovedDates,
  getDpmtApprovedDates,
  createApproveDates,
  updateApproveDates,
  deleteApproveDates,
  getApprovedDatesWithUserDetails
} from '@/lib/crudFunctions/ApprovedDates';
import { db } from '@/lib/db';

describe('GET /api/approved-dates/[department] Integration Test', () => {
  const testDepartment = 'Sales'; // Replace this with a valid test department name from your database
  const testStaffId = '1'; // Replace this with a valid staffId from your database

  beforeAll(async () => {
    // Connect to your test database
    await db.$connect();

    // Seed the database with test data
    await db.users.createMany({
      data: [
        {
          staff_id: 1,
          department: testDepartment,
          staff_fname: 'Emman',
          staff_lname: 'Koh',
          position: 'Manager',
          country: 'USA',
          role_id: 1
        },
        {
          staff_id: 2,
          department: testDepartment,
          staff_fname: 'Donkey',
          staff_lname: 'Kong',
          position: 'Manager',
          country: 'USA',
          role_id: 2
        }
      ]
    });

    await db.approved_dates.createMany({
      data: [
        { staff_id: 1, request_id: 1, date: new Date('2024-01-01') },
        { staff_id: 2, request_id: 2, date: new Date('2024-01-02') }
      ]
    });
  });

  afterAll(async () => {
    // Clean up the test data
    await db.approved_dates.deleteMany({ where: { staff_id: { in: [1, 2] } } });
    await db.users.deleteMany({ where: { department: testDepartment } });

    // Disconnect from the database
    await db.$disconnect();
  });

  it('should return department approved dates successfully for valid department', async () => {
    // Simulate the GET request
    const req = new Request(
      `http://localhost:3000/api/approved-dates/${testDepartment}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );
    const params = { department: testDepartment }; // Added staffId
    const response = await GET(req, { params });

    const json = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(json.length).toBeGreaterThan(0);
    expect(json[0].staff_id).toBe(1);
    expect(json[1].staff_id).toBe(2);
  });

  it('should return 400 for invalid department', async () => {
    // Simulate the GET request with invalid department
    const req = new Request(
      `http://localhost:3000/api/approved-dates/invalid`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );
    const params = { department: 'invalid' }; // Invalid department
    const response = await GET(req, { params });

    const json = await response.json();

    // Assertions
    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid department');
  });

  it('should return an empty array if no department members are found', async () => {
    // Simulate a GET request with a valid department but no members
    const newDepartment = 'NonExistentDept'; // Assume this department has no members

    const req = new Request(
      `http://localhost:3000/api/approved-dates/${newDepartment}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );
    const params = { department: newDepartment };
    const response = await GET(req, { params });

    const json = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(json.length).toBe(0); // Expect no approved dates since no members are found
  });

  it('should return 500 if there is a database error', async () => {
    // Intentionally disconnect from the database to simulate an error
    await db.$disconnect();

    const req = new Request(
      `http://localhost:3000/api/approved-dates/${testDepartment}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );
    const params = { department: testDepartment };
    const response = await GET(req, { params });

    const json = await response.json();

    // Assertions
    expect(response.status).toBe(500);
    expect(json.error).toBe('Failed to fetch department approved dates');

    // Reconnect the database for other tests
    await db.$connect();
  });
});
