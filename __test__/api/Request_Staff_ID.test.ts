import { GET } from '@/app/api/requests/[requestId]/by-staff/[staffId]/route';
import { db } from '@/lib/db';

describe('GET /api/requests/:staffId (Integration Test)', () => {
  const mockStaffId = 1;
  const mockRequestId = 1;
  beforeEach(async () => {
    // Create mock role, user, and request data
    await db.role.create({ data: { role_title: 'Manager' } });
    const mockRole = {
      role_id: 1,
      role_title: 'Manager'
    };

    const mockUser = {
      staff_id: mockStaffId, // This will be filled after creating the user
      staff_fname: 'John',
      staff_lname: 'Doe',
      department: 'Sales',
      position: 'Sales Manager',
      country: 'USA',
      email: 'john.doe@example.com',
      reporting_manager: 2, // No manager for now
      role_id: 1, // This will be filled after creating the role
      temp_replacement: null
    };

    const mockRequest = {
      request_id: mockRequestId,
      staff_id: mockStaffId, // This will be filled after creating the user
      timeslot: 'AM',
      daterange: [new Date('2024-10-10')],
      reason: 'Medical reason',
      approved: 'Pending'
    };
  });

  // Clean up after each test
  afterEach(async () => {
    await db.logs.deleteMany(); // Clean related data
    await db.requests.deleteMany();
    await db.users.deleteMany();
    await db.role.deleteMany();
  });

  it('should return requests for a valid staffId', async () => {
    const req = new Request(
      `http://localhost:3000/app/api/requests/${mockRequestId}/by-staff/${mockStaffId}`
    );
    const params = {
      requestId: String(mockRequestId),
      staffId: String(mockStaffId)
    };

    const response = await GET(req, { params });
    const json = await response.json();

    // Assert correct response
    expect(response.status).toBe(200);
    expect(json.length).toBe(1);
    expect(json[0].staff_id).toBe(mockStaffId);
  });

  it('should return 404 if no requests are found', async () => {
    // Ensure no requests exist by deleting them
    await db.requests.deleteMany();

    const req = new Request(
      `http://localhost:3000/app/api/requests/${mockRequestId}/by-staff/${mockStaffId}`
    );
    const params = { staffId: String(mockStaffId) };

    const response = await GET(req, { params });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('No requests found for this staff');
  });

  it('should return 400 for invalid staffId', async () => {
    const req = new Request(
      `http://localhost:3000/app/api/requests/${mockRequestId}/by-staff/invalid`
    );
    const params = { staffId: 'invalid' };

    const response = await GET(req, { params });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid staffId');
  });
});
