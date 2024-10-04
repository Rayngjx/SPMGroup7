import { GET, PUT, DELETE } from '@/app/api/approved-dates/[staffId]/route'; // Adjust the import path as needed
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
