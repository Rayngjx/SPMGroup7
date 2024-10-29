import { GET, POST, PUT } from '@/app/api/delegation-requests/route';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

// Define types for our mock Prisma client
type MockPrismaClient = {
  delegation_requests: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  users: {
    update: jest.Mock;
  };
  logs_dele: {
    create: jest.Mock;
  };
  $transaction: jest.Mock;
};

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrismaClient: MockPrismaClient = {
    delegation_requests: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    },
    users: {
      update: jest.fn()
    },
    logs_dele: {
      create: jest.fn()
    },
    $transaction: jest
      .fn()
      .mockImplementation((callback) => callback(mockPrismaClient))
  };
  return { PrismaClient: jest.fn(() => mockPrismaClient) };
});

// Mock NextResponse to return data directly from json() calls
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200
    })),
    error: jest.fn((message, status) => ({
      json: () => Promise.resolve({ error: message }),
      status: status || 500
    }))
  }
}));

const prisma = new PrismaClient() as unknown as MockPrismaClient;

describe('Delegation Requests API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/delegation-requests', () => {
    it('should fetch delegation requests based on staff_id and delegated_to', async () => {
      const mockData = [
        { id: 1, staff_id: 101, delegated_to: 202, status: 'pending' }
      ];
      prisma.delegation_requests.findMany.mockResolvedValue(mockData);

      const url = new URL(
        'https://localhost/api/delegation-requests?staff_id=101&delegated_to=202'
      );
      const request = new Request(url);

      const response = await GET(request);
      const jsonResponse = await response.json();

      expect(jsonResponse).toEqual(mockData);
    });

    it('should fetch delegation requests based on staff_id only', async () => {
      const mockData = [{ id: 1, staff_id: 101, status: 'pending' }];
      prisma.delegation_requests.findMany.mockResolvedValue(mockData);

      const url = new URL(
        'https://localhost/api/delegation-requests?staff_id=101'
      );
      const request = new Request(url);

      const response = await GET(request);
      const jsonResponse = await response.json();

      expect(jsonResponse).toEqual(mockData);
    });

    it('should fetch delegation requests based on delegated_to only', async () => {
      const mockData = [{ id: 1, delegated_to: 202, status: 'pending' }];
      prisma.delegation_requests.findMany.mockResolvedValue(mockData);

      const url = new URL(
        'https://localhost/api/delegation-requests?delegated_to=202'
      );
      const request = new Request(url);

      const response = await GET(request);
      const jsonResponse = await response.json();

      expect(jsonResponse).toEqual(mockData);
    });

    it('should fetch specific delegation request by id', async () => {
      const mockData = {
        id: 1,
        staff_id: 101,
        delegated_to: 202,
        status: 'pending'
      };
      prisma.delegation_requests.findUnique.mockResolvedValue(mockData);

      const url = new URL(
        'https://localhost/api/delegation-requests?delegationRequestId=1'
      );
      const request = new Request(url);

      const response = await GET(request);
      const jsonResponse = await response.json();

      expect(jsonResponse).toEqual(mockData);
    });
  });

  describe('POST /api/delegation-requests', () => {
    it('should create a new delegation request successfully', async () => {
      const mockRequest = {
        staff_id: 101,
        delegated_to: 202,
        reason: 'Vacation',
        status: 'pending'
      };

      const mockNewRequest = {
        delegation_request: 1,
        ...mockRequest
      };

      const mockNewLog = {
        log_id: 1,
        staff_id: 101,
        delegation_request_id: 1,
        processor_id: 101,
        reason: 'Vacation',
        action: 'request'
      };

      prisma.delegation_requests.create.mockResolvedValue(mockNewRequest);
      prisma.logs_dele.create.mockResolvedValue(mockNewLog);

      const request = new Request('https://localhost/api/delegation-requests', {
        method: 'POST',
        body: JSON.stringify(mockRequest)
      });

      const response = await POST(request);
      const jsonResponse = await response.json();

      expect(jsonResponse).toEqual({
        request: mockNewRequest,
        log: mockNewLog
      });
      expect(response.status).toBe(201);
    });

    it('should handle invalid request data', async () => {
      const invalidRequest = {
        staff_id: 'invalid', // Should be a number
        delegated_to: 202,
        reason: 'Vacation'
      };

      const request = new Request('https://localhost/api/delegation-requests', {
        method: 'POST',
        body: JSON.stringify(invalidRequest)
      });

      const response = await POST(request);
      const jsonResponse = await response.json();

      expect(response.status).toBe(400);
      expect(jsonResponse.error).toBe('Invalid request data');
    });
  });

  describe('PUT /api/delegation-requests', () => {
    it('should approve a delegation request successfully', async () => {
      const mockCurrentRequest = {
        delegation_request: 1,
        staff_id: 101,
        delegated_to: 202,
        status: 'pending'
      };

      const updateBody = {
        delegation_request: 1,
        status: 'approved',
        reason: 'Approved by manager',
        processor_id: 303
      };

      prisma.delegation_requests.findUnique.mockResolvedValue(
        mockCurrentRequest
      );
      prisma.delegation_requests.update.mockResolvedValue({
        ...mockCurrentRequest,
        status: 'approved'
      });
      prisma.users.update.mockResolvedValue({});
      prisma.logs_dele.create.mockResolvedValue({
        log_id: 2,
        staff_id: 101,
        delegation_request_id: 1,
        processor_id: 303,
        reason: 'Approved by manager',
        action: 'delegation_approve'
      });

      const request = new Request('https://localhost/api/delegation-requests', {
        method: 'PUT',
        body: JSON.stringify(updateBody)
      });

      const response = await PUT(request);
      const jsonResponse = await response.json();

      expect(jsonResponse.updatedRequest.status).toBe('approved');
      expect(prisma.users.update).toHaveBeenCalledWith({
        where: { staff_id: 202 },
        data: { temp_replacement: 101 }
      });
    });

    it('should handle rejection of a delegation request', async () => {
      const mockCurrentRequest = {
        delegation_request: 1,
        staff_id: 101,
        delegated_to: 202,
        status: 'pending'
      };

      const updateBody = {
        delegation_request: 1,
        status: 'rejected',
        reason: 'Not approved',
        processor_id: 303
      };

      prisma.delegation_requests.findUnique.mockResolvedValue(
        mockCurrentRequest
      );
      prisma.delegation_requests.update.mockResolvedValue({
        ...mockCurrentRequest,
        status: 'rejected'
      });

      const request = new Request('https://localhost/api/delegation-requests', {
        method: 'PUT',
        body: JSON.stringify(updateBody)
      });

      const response = await PUT(request);
      const jsonResponse = await response.json();

      expect(jsonResponse.updatedRequest.status).toBe('rejected');
    });

    it('should handle request not found error', async () => {
      prisma.delegation_requests.findUnique.mockResolvedValue(null);

      const updateBody = {
        delegation_request: 999,
        status: 'approved',
        reason: 'Approve request',
        processor_id: 303
      };

      const request = new Request('https://localhost/api/delegation-requests', {
        method: 'PUT',
        body: JSON.stringify(updateBody)
      });

      const response = await PUT(request);
      const jsonResponse = await response.json();

      expect(response.status).toBe(500);
      expect(jsonResponse.error).toBe(
        'An error occurred while processing your request'
      );
    });

    it('should handle redaction of a delegation request', async () => {
      const mockCurrentRequest = {
        delegation_request: 1,
        staff_id: 101,
        delegated_to: 202,
        status: 'approved'
      };

      const updateBody = {
        delegation_request: 1,
        status: 'redacted',
        reason: 'No longer needed',
        processor_id: 101
      };

      prisma.delegation_requests.findUnique.mockResolvedValue(
        mockCurrentRequest
      );
      prisma.delegation_requests.update.mockResolvedValue({
        ...mockCurrentRequest,
        status: 'redacted'
      });

      const request = new Request('https://localhost/api/delegation-requests', {
        method: 'PUT',
        body: JSON.stringify(updateBody)
      });

      const response = await PUT(request);
      const jsonResponse = await response.json();

      expect(jsonResponse.updatedRequest.status).toBe('redacted');
      expect(prisma.users.update).toHaveBeenCalledWith({
        where: { staff_id: 202 },
        data: { temp_replacement: null }
      });
    });

    it('should handle cancellation of a delegation request', async () => {
      const mockCurrentRequest = {
        delegation_request: 1,
        staff_id: 101,
        delegated_to: 202,
        status: 'pending'
      };

      const updateBody = {
        delegation_request: 1,
        status: 'cancelled',
        reason: 'No longer needed',
        processor_id: 101
      };

      // Mock the response for findUnique to return the current request
      prisma.delegation_requests.findUnique.mockResolvedValue(
        mockCurrentRequest
      );

      // Mock the update call to set the request status to "cancelled"
      prisma.delegation_requests.update.mockResolvedValue({
        ...mockCurrentRequest,
        status: 'cancelled'
      });

      // Mock the log creation
      prisma.logs_dele.create.mockResolvedValue({
        log_id: 3,
        staff_id: 101,
        delegation_request_id: 1,
        processor_id: 101,
        reason: 'No longer needed',
        action: 'cancelled'
      });

      const request = new Request('https://localhost/api/delegation-requests', {
        method: 'PUT',
        body: JSON.stringify(updateBody)
      });

      const response = await PUT(request);
      const jsonResponse = await response.json();

      // Verify the delegation request was updated with "cancelled" status
      expect(jsonResponse.updatedRequest.status).toBe('cancelled');

      // Ensure the update was called with correct parameters
      expect(prisma.delegation_requests.update).toHaveBeenCalledWith({
        where: { delegation_request: 1 },
        data: { status: 'cancelled' }
      });

      // Ensure a log entry was created for the cancellation action
      expect(prisma.logs_dele.create).toHaveBeenCalledWith({
        data: {
          staff_id: 101,
          delegation_request_id: 1,
          processor_id: 101,
          reason: 'No longer needed',
          action: 'cancelled'
        }
      });
    });
  });
});
