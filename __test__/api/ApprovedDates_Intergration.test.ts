import { GET, PUT, DELETE } from '@/app/api/approved-dates/[staffId]/route'; // Adjust the import path as needed
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

describe('Approved Dates API Routes', () => {
  const testStaffId = 123123; // Specific staffId to use for the tests

  beforeAll(async () => {
    await db.$connect(); // Connect to the test database
  });

  afterAll(async () => {
    await db.$disconnect(); // Disconnect the test database
  });

  afterEach(async () => {
    // Clean up test data after each test
    await db.approved_dates.deleteMany({ where: { staff_id: testStaffId } });
  });
  /////////////////////////////////////////////STAFF_ID////////////////////////////////////////////////
  // Test GET request to fetch approved dates
  it('should fetch approved dates successfully (GET /api/approved_dates/:staffId)', async () => {
    // Insert test data
    await db.approved_dates.create({
      data: {
        staff_id: testStaffId,
        request_id: 1,
        date: new Date()
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

  // Test GET request with invalid staffId
  it('should return 400 for invalid staffId (GET /api/approved_dates/:staffId)', async () => {
    const req = new Request(
      `http://localhost:3000/api/approved_dates/invalid`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );
    const params = { staffId: 'invalid' }; // Invalid staffId
    const response = await GET(req, { params });

    const json = await response.json();
    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid staffId');
  });

  // Test PUT request to update approved dates
  it('should update approved dates successfully (PUT /api/approved_dates/:staffId)', async () => {
    // Insert test data
    await db.approved_dates.create({
      data: {
        staff_id: testStaffId,
        request_id: 1,
        date: new Date()
      }
    });

    // Simulate PUT request to update the approved date
    const req = new Request(
      `http://localhost:3000/api/approved_dates/${testStaffId}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          request_id: 1,
          date: new Date('2024-01-01') // Updated date
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
    const updatedDates = await db.approved_dates.findMany({
      where: { staff_id: testStaffId }
    });
    expect(updatedDates[0].date).toEqual(new Date('2024-01-01'));
  });

  // Test DELETE request to delete approved dates
  it('should delete approved dates successfully (DELETE /api/approved_dates/:staffId)', async () => {
    // Insert test data
    await db.approved_dates.create({
      data: {
        staff_id: testStaffId,
        request_id: 1,
        date: new Date()
      }
    });

    // Simulate DELETE request to remove the approved date
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

    // Verify the date was deleted in the database
    const remainingDates = await db.approved_dates.findMany({
      where: { staff_id: testStaffId }
    });
    expect(remainingDates.length).toBe(0);
  });

  // Test DELETE request with invalid staffId
  it('should return 400 for invalid staffId (DELETE /api/approved_dates/:staffId)', async () => {
    const req = new Request(
      `http://localhost:3000/api/approved_dates/invalid`,
      {
        method: 'DELETE',
        body: JSON.stringify({
          request_id: 1
        }),
        headers: { 'Content-Type': 'application/json' }
      }
    );
    const params = { staffId: 'invalid' }; // Invalid staffId
    const response = await DELETE(req, { params });

    const json = await response.json();
    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid staffId');
  });
});

/////////////////////////////////////////////Dept_Id////////////////////////////////////////////////

////////////////////////////////////////////teamloadID////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////

describe('Approved Dates API Functions (Integration Tests)', () => {
  beforeAll(async () => {
    // Optionally seed the database with test data
    await db.approved_dates.create({
      data: {
        staff_id: 1,
        request_id: 1,
        date: new Date('2023-09-25')
      }
    });
    await db.users.create({
      data: {
        staff_id: 123123,
        staff_fname: 'John',
        staff_lname: 'Doe',
        department: 'Sales',
        position: 'Manager',
        country: 'USA',
        email: 'test123@example.com',
        role_id: 1, // Assuming role_id 1 exists
        reporting_manager: 140894
      }
    });
  });

  afterAll(async () => {
    // Optionally clean up the database after tests
    await db.approved_dates.deleteMany();
    await db.$disconnect();
  });

  describe('getApprovedDates', () => {
    it('should return all approved dates from the database', async () => {
      const result = await getApprovedDates();
      const resultLength = (result as { length: number }).length;
      expect(resultLength).toBeGreaterThan(0);
    });
  });
  // positive test case
  describe('getUserApprovedDates: positive test case', () => {
    it('should return approved dates for a specific user', async () => {
      const result = await getUserApprovedDates(1);
      const resultLength = (result as { length: number }).length;
      expect(resultLength).toBeGreaterThan(0);
    });
  });
  // negative test case
  describe('getUserApprovedDates: negative test case', () => {
    it('should return approved dates for a specific user', async () => {
      const result = await getUserApprovedDates(0);
      if (result === null) {
        expect(result).toBeNull();
      } else {
        // If result is not null, it should be an empty array
        expect(Array.isArray(result)).toBe(true); // Ensure it's an array
        expect(result.length).toBe(0); // Ensure array is empty
      }
    });
  });
  // positive test case
  describe('getTeamApprovedDates', () => {
    it('should return approved dates for team members: positive test case', async () => {
      // Assume team members with reporting_manager: 140894 exist in the test DB
      const result = await getTeamApprovedDates(140894);
      const resultLength = (result as { length: number }).length;
      expect(resultLength).toBeGreaterThan(0);
    });
  });
  //negative test case
  describe('getTeamApprovedDates', () => {
    it('should return approved dates for team members: negative test case', async () => {
      // Assume team members with reporting_manager: 0 does not exist in the test DB
      const result = await getTeamApprovedDates(0);
      expect(result).toBeNull();
    });
  });

  //getDepartmentApprovedDates perimeter isnt updated yet , still dept_id
  describe('getDpmtApprovedDates', () => {
    it('should return approved dates for a specific department', async () => {
      // Assume department 'Marketing' exists in the test DB
      const result = await getDpmtApprovedDates('Marketing');
      const resultLength = (result as { length: number }).length;
      expect(resultLength).toBeGreaterThan(0);
    });
  });

  describe('createApproveDates', () => {
    it('should create a new approved date entry in the database', async () => {
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

  describe('updateApproveDates', () => {
    it('should update an approved date entry in the database', async () => {
      const payload = {
        staff_id: 1,
        request_id: 1,
        date: '2023-09-25'
      };

      const result = await updateApproveDates(payload);
      expect(result).toEqual({ success: true });

      // Verify the updated entry in the database
      const updatedEntry = await db.approved_dates.findUnique({
        where: {
          staff_id_request_id_date: {
            staff_id: payload.staff_id,
            request_id: payload.request_id,
            date: new Date(payload.date)
          }
        }
      });
      expect(updatedEntry).toBeTruthy();
    });
  });

  describe('deleteApproveDates', () => {
    it('should delete an approved date entry from the database', async () => {
      const payload = {
        staff_id: 1,
        request_id: 1,
        date: '2023-09-25'
      };

      const result = await deleteApproveDates(payload);
      expect(result).toEqual({ success: true });

      // Verify the entry is deleted from the database
      const deletedEntry = await db.approved_dates.findUnique({
        where: {
          staff_id_request_id_date: {
            staff_id: payload.staff_id,
            request_id: payload.request_id,
            date: new Date(payload.date)
          }
        }
      });
      expect(deletedEntry).toBeNull();
    });
  });

  describe('getApprovedDatesWithUserDetails', () => {
    it('should return approved dates along with user details', async () => {
      const result = await getApprovedDatesWithUserDetails();
      if (result) {
        expect(result.length).toBeGreaterThan(0);
        expect(result[0]).toHaveProperty('users');
      } else {
        // If result is null, handle that case accordingly
        expect(result).toBeNull();
      }
    });
  });
});

////////////////////////////////////////////////////////////////////////////////////////////////
