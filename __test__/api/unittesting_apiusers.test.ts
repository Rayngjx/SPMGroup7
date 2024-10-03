import { createMocks } from 'node-mocks-http';
import { Request, Response } from 'express';
import { GET, PUT, DELETE, OPTIONS } from '@/app/api/users/[staffId]/route';
import { getUser, updateUser, deleteUser } from '@/lib/crudFunctions/Staff';

jest.mock('@/lib/crudFunctions/Staff', () => ({
  getUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn()
}));

// for invalid staffId (not 6 digits)
describe('GET /app/api/users/staffId', () => {
  it('should return 400 for invalid staffId', async () => {
    (getUser as jest.Mock).mockResolvedValue(null);
    const { req, res } = createMocks({
      method: 'GET',
      params: { staffId: '0' }
    });

    await GET(req as any, { params: { staffId: '000000' } });
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ error: 'Invalid staffId' });
  });
  // when user enters a staffId that isnt in the database
  it('should return 404 when user is not found', async () => {
    (getUser as jest.Mock).mockResolvedValue(null); // Mocking that no user is found
    const { req, res } = createMocks({
      method: 'GET',
      params: { staffId: '000001' }
    });

    await GET(req as any, { params: { staffId: '000001' } });

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual({ error: 'User not found' });
  });

  // when user enters a staffId that is in the database, happy path + correct structure
  it('should return 200 and user data when user is found and correct structure', async () => {
    const mockGetUser = getUser as jest.Mock;
    (getUser as jest.Mock).mockResolvedValue({
      staff_id: 140015,
      staff_fname: 'Oliva',
      staff_lname: 'Lim',
      dept_id: 2,
      position: 'Account Manager',
      country: 'Singapore',
      email: 'Oliva.Lim@allinone.com.sg',
      reporting_manager: 140894,
      role_id: 2,
      id: '8b90108c-9a05-4b43-bc0f-d98e5dfeb13c'
    });
    const { req, res } = createMocks({
      method: 'GET',
      params: { staffId: '140015' }
    });

    await GET(req as any, { params: { staffId: '140015' } });
    expect(mockGetUser).toHaveBeenCalledWith({ staff_id: 140015 });

    const rawData = res._getData(); // Log raw data
    console.log('Raw Response:', rawData); // Log to see what is returned

    expect(res.statusCode).toBe(200);

    const json = rawData ? JSON.parse(rawData) : null;
    expect(json).toEqual(expect.objectContaining({ staff_id: 140015 }));
    expect(json).toHaveProperty('staff_id');
    expect(json).toHaveProperty('name');
    expect(typeof json.staff_id).toBe('number');
    expect(typeof json.name).toBe('string');
  });
});

describe('PUT /app/api/users/staffId', () => {
  it('should return 400 for invalid staffId', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      params: { staffId: 'invalid' }
    });

    await PUT(req as any, { params: { staffId: 'invalid' } });

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ error: 'Invalid staffId' });
  });

  it('should return 500 if update fails', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      params: { staffId: '1' }
    });

    req.json = jest.fn().mockResolvedValue({
      name: 'New Name'
    });

    await PUT(req as any, { params: { staffId: '1' } });

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ error: 'Failed to update user' });
  });

  it('should return 200 if update is successful', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      params: { staffId: '1' }
    });

    req.json = jest.fn().mockResolvedValue({
      name: 'Updated Name'
    });

    await PUT(req as any, { params: { staffId: '1' } });

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(
      expect.objectContaining({ success: true })
    );
  });
});

describe('DELETE /app/api/users/staffId', () => {
  it('should return 400 for invalid staffId', async () => {
    const { req, res } = createMocks({
      method: 'DELETE',
      params: { staffId: 'invalid' }
    });

    await DELETE(req as any, { params: { staffId: 'invalid' } });

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ error: 'Invalid staffId' });
  });

  it('should return 500 if delete fails', async () => {
    const { req, res } = createMocks({
      method: 'DELETE',
      params: { staffId: '1' }
    });

    await DELETE(req as any, { params: { staffId: '1' } });

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ error: 'Failed to delete user' });
  });

  it('should return 200 if delete is successful', async () => {
    const { req, res } = createMocks({
      method: 'DELETE',
      params: { staffId: '1' }
    });

    await DELETE(req as any, { params: { staffId: '1' } });

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(
      expect.objectContaining({ success: true })
    );
  });
});

describe('OPTIONS /api/staff/[staffId]', () => {
  it('should return 200 with allowed methods', async () => {
    const res = await OPTIONS();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ allow: ['GET', 'PUT', 'DELETE'] });
  });
});
