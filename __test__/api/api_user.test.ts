import { createMocks } from 'node-mocks-http';
import { GET, PUT, DELETE, OPTIONS } from '@/app/api/users/staffId/route';

describe('GET /app/api/users/staffId', () => {
  it('should return 400 for invalid staffId', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      params: { staffId: 'invalid' }
    });

    await GET(req, { params: { staffId: 'invalid' } });

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ error: 'Invalid staffId' });
  });

  it('should return 404 when user is not found', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      params: { staffId: '1' }
    });

    await GET(req, { params: { staffId: '1' } });

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual({ error: 'User not found' });
  });

  it('should return 200 and user data when user is found', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      params: { staffId: '1' }
    });

    await GET(req, { params: { staffId: '1' } });

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(
      expect.objectContaining({
        staff_id: 1,
        name: 'John Doe'
      })
    );
  });
});

describe('PUT /app/api/users/staffId', () => {
  it('should return 400 for invalid staffId', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      params: { staffId: 'invalid' }
    });

    await PUT(req, { params: { staffId: 'invalid' } });

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

    await PUT(req, { params: { staffId: '1' } });

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

    await PUT(req, { params: { staffId: '1' } });

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

    await DELETE(req, { params: { staffId: 'invalid' } });

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ error: 'Invalid staffId' });
  });

  it('should return 500 if delete fails', async () => {
    const { req, res } = createMocks({
      method: 'DELETE',
      params: { staffId: '1' }
    });

    await DELETE(req, { params: { staffId: '1' } });

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ error: 'Failed to delete user' });
  });

  it('should return 200 if delete is successful', async () => {
    const { req, res } = createMocks({
      method: 'DELETE',
      params: { staffId: '1' }
    });

    await DELETE(req, { params: { staffId: '1' } });

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
