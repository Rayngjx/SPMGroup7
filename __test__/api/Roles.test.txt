import { describe, expect, test, beforeEach } from '@jest/globals';

// Define mock data
const mockRole = {
  role_id: 1,
  role_title: 'Test Role'
};

const mockUpdatedRole = {
  role_id: 1,
  role_title: 'Updated Test Role'
};

// Mock NextResponse
// jest.mock('next/server', () => ({
//   NextResponse: {
//     json: jest.fn().mockImplementation((data, options) => ({
//       json: () => Promise.resolve(data),
//       headers: new Headers(options?.headers || {}),
//       ...options
//     }))
//   }
// }));
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => {
      const headers = new Headers(options?.headers || {});
      return {
        json: () => Promise.resolve(data),
        headers,
        status: options?.status || 200
      };
    })
  }
}));

// Create mock Prisma instance
const mockPrismaInstance = {
  role: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  $connect: jest.fn(),
  $disconnect: jest.fn()
};

// Mock PrismaClient constructor
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaInstance)
}));

// Import routes after mocks are set up
import * as roleRoutes from '@/app/api/roles/route';

describe('Roles API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock implementations
    mockPrismaInstance.role.findMany.mockResolvedValue([mockRole]);
    mockPrismaInstance.role.create.mockResolvedValue(mockRole);
    mockPrismaInstance.role.update.mockResolvedValue(mockUpdatedRole);
    mockPrismaInstance.role.delete.mockResolvedValue(mockRole);
  });

  describe('GET /api/roles', () => {
    test('should return all roles', async () => {
      const response = await roleRoutes.GET();
      const data = await response.json();

      expect(data).toEqual([mockRole]);
      expect(mockPrismaInstance.role.findMany).toHaveBeenCalledTimes(1);
    });

    test('should handle database errors', async () => {
      mockPrismaInstance.role.findMany.mockRejectedValue(new Error('DB Error'));

      const response = await roleRoutes.GET();
      const data = await response.json();

      expect(data).toEqual({ error: 'Failed to fetch roles' });
    });
  });

  describe('POST /api/roles', () => {
    test('should create a new role', async () => {
      const request = new Request('http://localhost/api/roles', {
        method: 'POST',
        body: JSON.stringify(mockRole)
      });

      const response = await roleRoutes.POST(request);
      const data = await response.json();

      expect(data).toEqual(mockRole);
      expect(mockPrismaInstance.role.create).toHaveBeenCalledWith({
        data: mockRole
      });
    });
  });

  describe('PUT /api/roles', () => {
    test('should update an existing role', async () => {
      const request = new Request('http://localhost/api/roles', {
        method: 'PUT',
        body: JSON.stringify(mockUpdatedRole)
      });

      const response = await roleRoutes.PUT(request);
      const data = await response.json();

      expect(data).toEqual(mockUpdatedRole);
      expect(mockPrismaInstance.role.update).toHaveBeenCalledWith({
        where: { role_id: mockUpdatedRole.role_id },
        data: { role_title: mockUpdatedRole.role_title }
      });
    });
  });

  describe('DELETE /api/roles', () => {
    test('should delete a role', async () => {
      const url = new URL('http://localhost/api/roles');
      url.searchParams.set('role_id', mockRole.role_id.toString());

      const request = new Request(url);
      const response = await roleRoutes.DELETE(request);
      const data = await response.json();

      expect(data).toEqual(mockRole);
      expect(mockPrismaInstance.role.delete).toHaveBeenCalledWith({
        where: { role_id: mockRole.role_id }
      });
    });

    test('should handle missing role_id', async () => {
      const request = new Request('http://localhost/api/roles');
      const response = await roleRoutes.DELETE(request);
      const data = await response.json();

      expect(data).toEqual({ error: 'Role ID is required' });
    });
  });

  describe('OPTIONS /api/roles', () => {
    test('should return correct CORS headers', async () => {
      const response = await roleRoutes.OPTIONS();

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
