import { createMocks } from 'node-mocks-http';
import { GET, PUT, DELETE, OPTIONS } from '@/app/api/users/[staffId]/route';
import { NextResponse } from 'next/server';
import { getUser, updateUser, deleteUser } from '@/lib/crudFunctions/Staff';

// jest.mock('@/lib/crudFunctions/Staff', () => ({
//   getUser: jest.fn(),
//   updateUser: jest.fn(),
//   deleteUser: jest.fn()
// }));

jest.mock('@/lib/crudFunctions/Staff');

describe('GET API Route', () => {
  // Mock NextResponse
  const jsonSpy = jest.spyOn(NextResponse, 'json');

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 for invalid staffId', async () => {
    const req = new Request('http://localhost:3000/api/user');
    const params = { staffId: 'invalid' }; // Invalid staffId

    await GET(req, { params });

    expect(jsonSpy).toHaveBeenCalledWith(
      { error: 'Invalid staffId' },
      { status: 400 }
    );
  });

  it('should return 404 when user is not found', async () => {
    const req = new Request('http://localhost:3000/api/user');
    const params = { staffId: '123432' }; // this staffId does not exist in the database

    // Mock getUser to return null (user not found)
    (getUser as jest.Mock).mockResolvedValueOnce(null);

    await GET(req, { params });

    expect(getUser).toHaveBeenCalledWith({ staff_id: 123432 });
    expect(jsonSpy).toHaveBeenCalledWith(
      { error: 'User not found' },
      { status: 404 }
    );
  });

  it('should return 200 and user data when user is found', async () => {
    const req = new Request('http://localhost:3000/api/user');
    const params = { staffId: '123' }; // Valid staffId

    const mockUser = { staff_id: 123, name: 'John Doe' }; // Mock user data

    (getUser as jest.Mock).mockResolvedValueOnce(mockUser);

    await GET(req, { params });

    expect(getUser).toHaveBeenCalledWith({ staff_id: 123 });
    expect(jsonSpy).toHaveBeenCalledWith(mockUser);
  });

  it('should return 500 on error while fetching user', async () => {
    const req = new Request('http://localhost:3000/api/user');
    const params = { staffId: '123' }; // Valid staffId

    // Mock getUser to throw an error
    (getUser as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

    await GET(req, { params });

    expect(getUser).toHaveBeenCalledWith({ staff_id: 123 });
    expect(jsonSpy).toHaveBeenCalledWith(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  });
});

describe('PUT API Route', () => {
  const jsonSpy = jest.spyOn(NextResponse, 'json');

  afterEach(() => {
    jest.clearAllMocks(); // Reset mock call history between tests
  });

  it('should return 400 for invalid staffId', async () => {
    const req = new Request('http://localhost:3000/api/user', {
      method: 'PUT'
    });
    const params = { staffId: 'invalid' }; // Invalid staffId

    await PUT(req, { params });

    expect(jsonSpy).toHaveBeenCalledWith(
      { error: 'Invalid staffId' },
      { status: 400 }
    );
  });

  it('should return 200 when user is successfully updated', async () => {
    const req = new Request('http://localhost:3000/api/user', {
      method: 'PUT',
      body: JSON.stringify({ name: 'John Doe' })
    });
    const params = { staffId: '123' }; // Valid staffId

    const mockResponse = { success: true }; // Mock successful update
    (updateUser as jest.Mock).mockResolvedValueOnce(mockResponse);

    await PUT(req, { params });

    expect(updateUser).toHaveBeenCalledWith({
      staff_id: 123,
      name: 'John Doe'
    });
    expect(jsonSpy).toHaveBeenCalledWith(mockResponse, { status: 200 });
  });

  it('should return 400 if update fails', async () => {
    const req = new Request('http://localhost:3000/api/user', {
      method: 'PUT',
      body: JSON.stringify({ name: 'John Doe' })
    });
    const params = { staffId: '123' }; // Valid staffId

    const mockErrorResponse = { success: false, error: 'Update failed' }; // Mock failure
    (updateUser as jest.Mock).mockResolvedValueOnce(mockErrorResponse);

    await PUT(req, { params });

    expect(updateUser).toHaveBeenCalledWith({
      staff_id: 123,
      name: 'John Doe'
    });
    expect(jsonSpy).toHaveBeenCalledWith(
      { error: 'Update failed' },
      { status: 400 }
    );
  });

  it('should return 500 if update throws an error', async () => {
    const req = new Request('http://localhost:3000/api/user', {
      method: 'PUT',
      body: JSON.stringify({ name: 'John Doe' })
    });
    const params = { staffId: '123' }; // Valid staffId

    (updateUser as jest.Mock).mockRejectedValueOnce(
      new Error('Database error')
    );

    await PUT(req, { params });

    expect(jsonSpy).toHaveBeenCalledWith(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  });
});

describe('DELETE API Route', () => {
  const jsonSpy = jest.spyOn(NextResponse, 'json');

  afterEach(() => {
    jest.clearAllMocks(); // Reset mock call history between tests
  });

  it('should return 400 for invalid staffId', async () => {
    const req = new Request('http://localhost:3000/api/user', {
      method: 'DELETE'
    });
    const params = { staffId: 'invalid' }; // Invalid staffId

    await DELETE(req, { params });

    expect(jsonSpy).toHaveBeenCalledWith(
      { error: 'Invalid staffId' },
      { status: 400 }
    );
  });

  it('should return 200 when user is successfully deleted', async () => {
    const req = new Request('http://localhost:3000/api/user', {
      method: 'DELETE'
    });
    const params = { staffId: '123' }; // Valid staffId

    const mockResponse = { success: true }; // Mock successful delete
    (deleteUser as jest.Mock).mockResolvedValueOnce(mockResponse);

    await DELETE(req, { params });

    expect(deleteUser).toHaveBeenCalledWith({ staff_id: 123 });
    expect(jsonSpy).toHaveBeenCalledWith(mockResponse, { status: 200 });
  });

  it('should return 400 if delete fails', async () => {
    const req = new Request('http://localhost:3000/api/user', {
      method: 'DELETE'
    });
    const params = { staffId: '123' }; // Valid staffId

    const mockErrorResponse = { success: false, error: 'Delete failed' }; // Mock failure
    (deleteUser as jest.Mock).mockResolvedValueOnce(mockErrorResponse);

    await DELETE(req, { params });

    expect(deleteUser).toHaveBeenCalledWith({ staff_id: 123 });
    expect(jsonSpy).toHaveBeenCalledWith(
      { error: 'Delete failed' },
      { status: 400 }
    );
  });

  it('should return 500 if delete throws an error', async () => {
    const req = new Request('http://localhost:3000/api/user', {
      method: 'DELETE'
    });
    const params = { staffId: '123' }; // Valid staffId

    (deleteUser as jest.Mock).mockRejectedValueOnce(
      new Error('Database error')
    );

    await DELETE(req, { params });

    expect(jsonSpy).toHaveBeenCalledWith(
      { error: 'Failed to delete user' },
      { status: 500 }
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
