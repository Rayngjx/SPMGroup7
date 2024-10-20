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

  // Clean up existing data
  await db.withdraw_requests.deleteMany();
  await db.approved_dates.deleteMany();
  await db.requests.deleteMany();
  await db.users.deleteMany();

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

  // Seed the database with users first
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

  // Seed the requests table
  await db.requests.createMany({
    data: [
      {
        request_id: 1,
        staff_id: 1,
        timeslot: 'AM',
        daterange: [new Date('2024-01-01')],
        reason: 'Business Trip',
        approved: 'Accepted',
        document_url: 'some-url'
      },
      {
        request_id: 2,
        staff_id: 2,
        timeslot: 'PM',
        daterange: [new Date('2024-01-02')],
        reason: 'Vacation',
        approved: 'Accepted',
        document_url: 'some-url'
      }
    ]
  });

  // Seed the approved_dates table with valid request_ids
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

describe('Approved Dates Functions', () => {
  const testStaffId = 1;
  const testTeamleadId = 123; // Replace with a valid team lead ID from your test data

  beforeEach(async () => {
    // Clean the database before each test
    await db.approved_dates.deleteMany();
    await db.users.deleteMany();
    await db.requests.deleteMany();

    // Seed the users and requests tables
    await db.users.create({
      data: {
        staff_id: testStaffId,
        staff_fname: 'John',
        staff_lname: 'Doe',
        department: 'Sales',
        position: 'Manager',
        country: 'USA',
        role_id: 1
      }
    });

    await db.requests.create({
      data: {
        request_id: 1,
        staff_id: testStaffId,
        timeslot: 'morning',
        daterange: [new Date('2024-01-01')],
        reason: 'Business',
        approved: 'Yes'
      }
    });

    // Seed the approved_dates table
    await db.approved_dates.create({
      data: {
        staff_id: testStaffId,
        request_id: 1,
        date: new Date('2024-01-01')
      }
    });
  });

  afterEach(async () => {
    // Clean up the database after each test
    await db.approved_dates.deleteMany();
    await db.users.deleteMany();
    await db.requests.deleteMany();
  });

  it('should return approved dates for a specific user', async () => {
    const result = await getUserApprovedDates(testStaffId);

    expect(result).not.toBeNull();
    if (result) {
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].staff_id).toBe(1); // assuming that staff_id is 1 for the first entry
    }
  });

  it('should return null if no approved dates are found for the user', async () => {
    const result = await getUserApprovedDates(999); // Invalid staff_id

    expect(result).toStrictEqual([]);
  });
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

describe('getTeamApprovedDates', () => {
  const testTeamleadId = 123; // Replace with a valid team lead ID from your test data

  beforeEach(async () => {
    // Clean the database before each test
    await db.approved_dates.deleteMany();
    await db.users.deleteMany();
    await db.requests.deleteMany();

    // Seed the users and requests tables
    await db.users.createMany({
      data: [
        {
          staff_id: testTeamleadId, // The team lead's ID
          staff_fname: 'Lead',
          staff_lname: 'Manager',
          department: 'Sales',
          position: 'Manager',
          country: 'USA',
          role_id: 1
        },
        {
          staff_id: 1,
          staff_fname: 'John',
          staff_lname: 'Doe',
          department: 'Sales',
          position: 'Manager',
          country: 'USA',
          reporting_manager: testTeamleadId,
          role_id: 1
        }
      ]
    });

    await db.requests.create({
      data: {
        request_id: 1,
        staff_id: 1,
        timeslot: 'morning',
        daterange: [new Date('2024-01-01')],
        reason: 'Business',
        approved: 'Yes'
      }
    });

    // Seed the approved_dates table
    await db.approved_dates.create({
      data: {
        staff_id: 1,
        request_id: 1,
        date: new Date('2024-01-01')
      }
    });
  });

  afterEach(async () => {
    // Clean up the database after each test
    await db.approved_dates.deleteMany();
    await db.users.deleteMany();
    await db.requests.deleteMany();
  });

  it('should return approved dates for team members', async () => {
    const result = await getTeamApprovedDates(testTeamleadId);

    expect(result).not.toBeNull();
    if (result) {
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].staff_id).toBe(1); // assuming that staff_id is 1 for the first entry
    }
  });

  it('should return null if no team members have approved dates', async () => {
    const result = await getTeamApprovedDates(999); // Invalid teamleadId

    expect(result).toBeNull();
  });
});
