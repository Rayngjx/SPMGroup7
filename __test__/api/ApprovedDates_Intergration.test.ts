import { GET, PUT, DELETE } from '@/app/api/approved-dates/[staffId]/route'; // Adjust the import path as needed
import { db } from '@/lib/db';
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

describe('Approved Dates API Routes', () => {
  const testStaffId = 130002;

  beforeEach(async () => {
    await db.$connect();

    // Clean the tables before each test
    await db.withdraw_requests.deleteMany();
    await db.approved_dates.deleteMany();
    await db.requests.deleteMany();
    await db.users.deleteMany();

    // Insert required data into users and requests before creating approved_dates
    await db.users.create({
      data: {
        staff_id: testStaffId, // Ensure this is unique
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
        request_id: 1, // Ensure this is unique
        staff_id: testStaffId,
        timeslot: 'morning',
        daterange: [new Date('2024-01-01'), new Date('2024-01-02')],
        reason: 'Business',
        approved: 'Yes'
      }
    });
  });

  afterEach(async () => {
    await db.withdraw_requests.deleteMany();
    await db.approved_dates.deleteMany();
    await db.requests.deleteMany();
    await db.users.deleteMany();
    await db.$disconnect();
  });

  /////////////////////////////////////////////STAFF_ID////////////////////////////////////////////////
  it('should fetch approved dates successfully (GET /api/approved_dates/:staffId)', async () => {
    // Seed data for this test (users and requests)
    // await db.users.create({
    //   data: {
    //     staff_id: testStaffId,
    //     staff_fname: 'John',
    //     staff_lname: 'Doe',
    //     department: 'Sales',
    //     position: 'Manager',
    //     country: 'USA',
    //     role_id: 1
    //   }
    // });

    // await db.requests.create({
    //   data: {
    //     request_id: 1,
    //     staff_id: testStaffId,
    //     timeslot: 'morning',
    //     daterange: [new Date('2024-01-01'), new Date('2024-01-02')],
    //     reason: 'Business',
    //     approved: 'Yes'
    //   }
    // });

    // Now create the approved date entry
    await db.approved_dates.create({
      data: {
        staff_id: testStaffId,
        request_id: 1,
        date: new Date('2024-01-01')
      }
    });

    // Simulate the GET request
    const req = new Request(
      `http://localhost:3000/api/approved_dates/${testStaffId}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );
    const params = { staffId: String(testStaffId) };
    const response = await GET(req, { params });

    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.length).toBeGreaterThan(0);
    expect(json[0].staff_id).toBe(testStaffId);
  });

  it('should return 400 for invalid staffId (GET /api/approved_dates/:staffId)', async () => {
    const req = new Request(
      `http://localhost:3000/api/approved_dates/invalid`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );
    const params = { staffId: 'invalid' };
    const response = await GET(req, { params });

    const json = await response.json();
    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid staffId');
  });

  it('should update approved dates successfully (PUT /api/approved_dates/:staffId)', async () => {
    // Seed data for this test
    await db.approved_dates.create({
      data: {
        staff_id: testStaffId,
        request_id: 1,
        date: new Date('2024-01-01')
      }
    });

    const req = new Request(
      `http://localhost:3000/api/approved_dates/${testStaffId}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          request_id: 1,
          date: new Date('2024-01-02')
        }),
        headers: { 'Content-Type': 'application/json' }
      }
    );
    const params = { staffId: String(testStaffId) };
    const response = await PUT(req, { params });

    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);

    // Verify the date was updated in the database
    const updatedDates = await db.approved_dates.findUnique({
      where: {
        staff_id_request_id_date: {
          staff_id: testStaffId,
          request_id: 1,
          date: new Date('2024-01-02')
        }
      }
    });
    expect(updatedDates).toBeTruthy();
  });

  it('should delete approved dates successfully (DELETE /api/approved_dates/:staffId)', async () => {
    // Seed data for this test
    await db.approved_dates.create({
      data: {
        staff_id: testStaffId,
        request_id: 1,
        date: new Date('2024-01-01')
      }
    });

    const req = new Request(
      `http://localhost:3000/api/approved_dates/${testStaffId}`,
      {
        method: 'DELETE',
        body: JSON.stringify({
          request_id: 1
        }),
        headers: { 'Content-Type': 'application/json' }
      }
    );
    const params = { staffId: String(testStaffId) };
    const response = await DELETE(req, { params });

    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);

    // Verify the entry is deleted from the database
    const remainingDates = await db.approved_dates.findMany({
      where: { staff_id: testStaffId }
    });
    expect(remainingDates.length).toBe(0);
  });
});

////////////////////////////////////////////Integration Test Functions////////////////////////////////////////////////

describe('Approved Dates API Functions (Integration Tests)', () => {
  const testStaffId = 130002;

  beforeEach(async () => {
    // Clean the database before each test
    await db.approved_dates.deleteMany();
    await db.users.deleteMany();
    await db.withdraw_requests.deleteMany();

    await db.users.create({
      data: {
        staff_id: testStaffId, // Ensure this is unique
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
        request_id: 1, // Ensure this is unique
        staff_id: testStaffId,
        timeslot: 'morning',
        daterange: [new Date('2024-01-01'), new Date('2024-01-02')],
        reason: 'Business',
        approved: 'Yes'
      }
    });
  });

  afterEach(async () => {
    // Optionally clean up the database after tests
    await db.approved_dates.deleteMany();
    await db.$disconnect();
  });

  describe('getApprovedDates', () => {
    it('should return all approved dates from the database', async () => {
      // Seed data
      await db.approved_dates.create({
        data: {
          staff_id: testStaffId,
          request_id: 1,
          date: new Date('2023-09-25')
        }
      });
      const result = await getApprovedDates();
      expect(result).not.toBeNull(); // Check if result is not null
    });
  });

  describe('createApproveDates', () => {
    it('should create a new approved date entry in the database', async () => {
      // Insert into users and requests before approved_dates
      await db.users.create({
        data: {
          staff_id: 2,
          staff_fname: 'Jane',
          staff_lname: 'Smith',
          department: 'Marketing',
          position: 'Executive',
          country: 'USA',
          role_id: 2
        }
      });

      await db.requests.create({
        data: {
          request_id: 2,
          staff_id: 2,
          timeslot: 'afternoon',
          daterange: [new Date('2023-10-01')],
          reason: 'Holiday',
          approved: 'Yes'
        }
      });

      const payload = {
        staff_id: 2,
        request_id: 2,
        date: '2023-10-01'
      };

      const result = await createApproveDates(payload);
      expect(result).toEqual({ success: true });

      // Verify the new entry in the database
      const approvedDates = await db.approved_dates.findMany({
        where: { staff_id: 2, request_id: 2 }
      });
      expect(approvedDates.length).toBe(1);
    });
  });
});
