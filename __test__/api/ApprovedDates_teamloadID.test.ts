import { GET } from '@/app/api/approved-dates/team/[teamleadId]/route'; // Adjust the import path as neededdescribe('GET /api/approved-dates/[teamleadId] Integration Test', () => {
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

const testStaffId = '1';
const testTeamleadId = 123; // Replace with a valid teamlead ID from your test database
const testDepartment = 'Engineering'; // Replace with a valid department

beforeAll(async () => {
  // Connect to your test database
  await db.$connect();

  const teamLead = await db.users.create({
    data: {
      staff_id: testTeamleadId, // The team lead's ID (reporting_manager for team members)
      staff_fname: 'Lead',
      staff_lname: 'Manager',
      department: testDepartment,
      position: 'Manager',
      country: 'USA',
      role_id: 1
    }
  });

  // Seed the database with test data
  await db.users.createMany({
    data: [
      {
        staff_id: 1,
        department: testDepartment,
        staff_fname: 'John',
        staff_lname: 'Doe',
        reporting_manager: testTeamleadId,
        position: 'Manager',
        country: 'USA',
        role_id: 1
      },
      {
        staff_id: 2,
        department: testDepartment,
        staff_fname: 'Jane',
        staff_lname: 'Doe',
        reporting_manager: testTeamleadId,
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

it('should return team approved dates successfully for valid teamleadId', async () => {
  // Simulate the GET request
  const req = new Request(
    `http://localhost:3000/api/approved-dates/${testTeamleadId}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }
  );
  const params = { teamleadId: String(testTeamleadId) };
  const response = await GET(req, { params });

  const json = await response.json();

  // Assertions
  expect(response.status).toBe(200);
  expect(json.length).toBeGreaterThan(0);
  expect(json[0].staff_id).toBe(1);
  expect(json[1].staff_id).toBe(2);
});

it('should return 400 for invalid teamleadId', async () => {
  // Simulate the GET request with an invalid teamleadId
  const req = new Request(`http://localhost:3000/api/approved-dates/invalid`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  const params = { teamleadId: 'invalid' }; // Invalid teamleadId
  const response = await GET(req, { params });

  const json = await response.json();

  // Assertions
  expect(response.status).toBe(400);
  expect(json.error).toBe('Invalid teamleadId');
});

it('should return an empty array if no team members are found', async () => {
  // Simulate a GET request with a valid teamleadId but no members
  const newTeamleadId = 999; // Assume 999 has no members

  const req = new Request(
    `http://localhost:3000/api/approved-dates/${newTeamleadId}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }
  );
  const params = { teamleadId: String(newTeamleadId) };
  const response = await GET(req, { params });

  const json = await response.json();

  // Assertions
  expect(response.status).toBe(200);
  expect(json.length).toBe(0); // Expect no approved dates since no members are found
});
