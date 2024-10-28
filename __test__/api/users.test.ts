import { NextResponse } from 'next/server';

// Mock Prisma
const mockFindUnique = jest.fn();
const mockFindMany = jest.fn();
const mockCreate = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    users: {
      findUnique: mockFindUnique,
      findMany: mockFindMany,
      create: mockCreate
    }
  }))
}));

import { GET, POST, OPTIONS } from '@/app/api/users/route';

describe('Users API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    const mockUser = {
      staff_id: 1,
      name: 'John Doe',
      department: 'IT',
      reporting_manager: 2
    };

    function createGetRequest(params = {}) {
      const searchParams = new URLSearchParams(params);
      return new Request(`http://localhost/api/users?${searchParams}`);
    }

    test('fetches all users when no params provided', async () => {
      const mockUsers = [mockUser];
      mockFindMany.mockResolvedValueOnce(mockUsers);

      const response = await GET(createGetRequest());
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockUsers);
      expect(mockFindMany).toHaveBeenCalledWith();
    });

    test('fetches user by staff_id', async () => {
      mockFindUnique.mockResolvedValueOnce(mockUser);

      const response = await GET(createGetRequest({ staff_id: '1' }));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockUser);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { staff_id: 1 }
      });
    });

    test('returns 404 when user not found by staff_id', async () => {
      mockFindUnique.mockResolvedValueOnce(null);

      const response = await GET(createGetRequest({ staff_id: '1' }));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'User not found' });
    });

    test('fetches users by department', async () => {
      const mockUsers = [mockUser];
      mockFindMany.mockResolvedValueOnce(mockUsers);

      const response = await GET(createGetRequest({ department: 'IT' }));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockUsers);
      expect(mockFindMany).toHaveBeenCalledWith({
        where: { department: 'IT' }
      });
    });

    test('fetches users by reporting manager', async () => {
      const mockUsers = [mockUser];
      mockFindMany.mockResolvedValueOnce(mockUsers);

      const response = await GET(createGetRequest({ reportingManager: '2' }));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockUsers);
      expect(mockFindMany).toHaveBeenCalledWith({
        where: { reporting_manager: 2 }
      });
    });

    test('handles database errors', async () => {
      mockFindMany.mockRejectedValueOnce(new Error('Database error'));

      const response = await GET(createGetRequest());
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch users' });
    });
  });

  describe('POST /api/users', () => {
    const mockUser = {
      staff_id: 1,
      name: 'John Doe',
      department: 'IT',
      reporting_manager: 2
    };

    function createPostRequest(body: any) {
      return new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    }

    test('creates new user successfully', async () => {
      mockCreate.mockResolvedValueOnce(mockUser);

      const response = await POST(createPostRequest(mockUser));
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockUser);
      expect(mockCreate).toHaveBeenCalledWith({
        data: mockUser
      });
    });

    test('handles missing required fields', async () => {
      const invalidUser = { name: 'John Doe' };

      const response = await POST(createPostRequest(invalidUser));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Missing required fields' });
      expect(mockCreate).not.toHaveBeenCalled();
    });

    test('handles database errors', async () => {
      mockCreate.mockRejectedValueOnce(new Error('Database error'));

      const response = await POST(createPostRequest(mockUser));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create user' });
    });

    test('handles invalid JSON', async () => {
      const request = new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create user' });
    });
  });

  describe('OPTIONS /api/users', () => {
    test('returns correct CORS headers', async () => {
      const response = await OPTIONS();

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe(
        'GET,POST,OPTIONS'
      );
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe(
        'Content-Type,Authorization'
      );
    });
  });
});
