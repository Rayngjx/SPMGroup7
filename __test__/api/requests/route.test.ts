/**
 * @jest-environment node
 */
import { GET, OPTIONS, POST, PUT } from '@/app/api/requests/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mock Data
const mockRequest = {
  staff_id: 140015,
  timeslot: 'AM',
  date: '2024-10-29T00:00:00.000Z',
  reason: 'Personal appointment',
  status: 'pending',
  document_url: 'https://example.com/doc',
  processor_id: 140894,
  created_at: new Date(),
  last_updated: new Date()
};

// Mock Data
const mockApproved = {
  staff_id: 140015,
  timeslot: 'AM',
  date: '2024-10-29T00:00:00.000Z',
  reason: 'Personal appointment',
  status: 'approved',
  document_url: 'https://example.com/doc',
  processor_id: 140894,
  created_at: new Date(),
  last_updated: new Date()
};

// Mock Data
const mockWithdrawPending = {
  staff_id: 140015,
  timeslot: 'AM',
  date: '2024-10-29T00:00:00.000Z',
  reason: 'Personal appointment',
  status: 'withdraw_pending',
  document_url: 'https://example.com/doc',
  processor_id: 140894,
  created_at: new Date(),
  last_updated: new Date()
};

// Ensure this matches mockRequest where applicable
const validRequestData = [
  {
    staff_id: 140015, // Match staff_id
    timeslot: 'AM', // Match timeslot
    date: '2024-10-29T00:00:00.000Z', // Match date
    reason: 'vacation', // This can be different, as it's valid data for a new request
    status: 'pending',
    processor_id: 140894, // Match processor_id
    document_url: 'https://example.com/doc' // Different URL is acceptable
  }
];

describe('Requests API Tests', () => {
  let requestId: number;

  beforeAll(async () => {
    // Insert mock request directly into the database
    // await prisma.requests.create({
    //   data: mockRequest
    // });
  });

  afterAll(async () => {
    // Delete only the specific request where request_id is 8888
    await prisma.requests.deleteMany({});

    await prisma.logs.deleteMany({});
    await prisma.$disconnect();
  });

  describe('POST /api/requests', () => {
    it('should create a new request successfully', async () => {
      const request = {
        json: jest.fn().mockResolvedValue(validRequestData)
      } as unknown as Request;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data[0].request).toHaveProperty('request_id');
      expect(data[0].log).toHaveProperty('log_id');
    });

    it('should handle validation errors', async () => {
      const invalidData = [
        {
          staff_id: 'invalid', // Should be number
          timeslot: 'morning',
          date: '2024-01-01'
        }
      ];

      const request = {
        json: jest.fn().mockResolvedValue(invalidData)
      } as unknown as Request;

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should return a 500 error for simulated database error', async () => {
      const invalidRequestData = [
        {
          staff_id: -1, // This triggers the simulated error
          timeslot: 'AM',
          date: '2024-10-29T00:00:00.000Z',
          reason: 'Simulated error',
          status: 'pending',
          processor_id: 140894
        }
      ];

      const request = {
        json: jest.fn().mockResolvedValue(invalidRequestData)
      } as unknown as Request;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'An error occurred while processing your request'
      });
    });
  });

  describe('GET /api/requests', () => {
    beforeEach(async () => {
      // Create test data
      const result = await prisma.requests.create({
        data: {
          ...mockRequest,
          date: new Date(mockRequest.date)
        }
      });
      requestId = result.request_id;
    });

    it('should get a specific request by requestId', async () => {
      const request = new Request(
        `http://localhost:3000/api/requests?requestId=${requestId}`
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.request_id).toBe(requestId);
    });

    it('should get requests by staff_id', async () => {
      const request = new Request(
        `http://localhost:3000/api/requests?staff_id=${mockRequest.staff_id}`
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });

    it('should get requests by reporting manager', async () => {
      const request = new Request(
        `http://localhost:3000/api/requests?reportingManager=${mockRequest.processor_id}`
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });

    it('should get requests by department', async () => {
      const request = new Request(
        `http://localhost:3000/api/requests?department=Sales`
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });

    it('should get all requests when no filters provided', async () => {
      const request = new Request('http://localhost:3000/api/requests');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });

    it('should handle non-existent request ID', async () => {
      const request = new Request(
        'http://localhost:3000/api/requests?requestId=99999'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500); // Assuming you return a 500 status for the error in your function
      expect(data).toEqual({
        error: 'An error occurred while processing your request'
      });
    });
  });

  describe('PUT /api/requests', () => {
    //   beforeEach(async () => {
    //     const result = await prisma.requests.create({
    //       data: {
    //         ...mockRequest,
    //         date: new Date(mockRequest.date)
    //       }
    //     });
    //     requestId = result.request_id;
    //   });

    it('should update request status to approved', async () => {
      //simiulate the request data
      const result = await prisma.requests.create({
        data: {
          ...mockRequest,
          date: new Date(mockRequest.date)
        }
      });
      requestId = result.request_id;

      const updateData = {
        request_id: requestId,
        status: 'approved',
        reason: 'Approved by manager',
        processor_id: mockRequest.processor_id
      };

      const request = {
        json: jest.fn().mockResolvedValue(updateData),
        url: `http://localhost:3000/api/requests?reportingManager=${updateData.processor_id}`
      } as unknown as Request;

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.updatedRequest.status).toBe('approved');
      expect(data.newLog.action).toBe('approve');
    });

    it('should handle reject request', async () => {
      //simiulate the request data
      const result = await prisma.requests.create({
        data: {
          ...mockRequest,
          date: new Date(mockRequest.date)
        }
      });
      requestId = result.request_id;
      const updateData = {
        request_id: requestId,
        status: 'rejected',
        reason: 'Need to reject request',
        processor_id: mockRequest.processor_id
      };

      const request = {
        json: jest.fn().mockResolvedValue(updateData),
        url: `http://localhost:3000/api/requests?reportingManager=${updateData.processor_id}`
      } as unknown as Request;

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.updatedRequest.status).toBe('rejected');
      expect(data.newLog.action).toBe('reject');
    });

    it('should handle withdrawal request - withdrawal approve', async () => {
      //simiulate the request data
      const result = await prisma.requests.create({
        data: {
          ...mockWithdrawPending,
          date: new Date(mockRequest.date)
        }
      });
      requestId = result.request_id;

      const updateData = {
        request_id: requestId,
        status: 'withdrawn',
        reason: 'Need to cancel',
        processor_id: mockRequest.processor_id
      };

      const request = {
        json: jest.fn().mockResolvedValue(updateData),
        url: `http://localhost:3000/api/requests?reportingManager=${updateData.processor_id}`
      } as unknown as Request;

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.updatedRequest.status).toBe('withdrawn');
      expect(data.newLog.action).toBe('forced_withdraw');
    });

    it('should handle withdrawal approval - pending', async () => {
      //simiulate the request data
      const result = await prisma.requests.create({
        data: {
          ...mockApproved,
          date: new Date(mockRequest.date)
        }
      });
      requestId = result.request_id;

      const updateData = {
        request_id: requestId,
        status: 'withdrawn',
        reason: 'Need to cancel',
        processor_id: mockRequest.processor_id
      };

      const request = {
        json: jest.fn().mockResolvedValue(updateData),
        url: `http://localhost:3000/api/requests?reportingManager=${updateData.processor_id}`
      } as unknown as Request;

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.updatedRequest.status).toBe('withdrawn');
      expect(data.newLog.action).toBe('forced_withdraw');
    });

    it('should handle withdrawal approval - withdrawal rejection', async () => {
      //simiulate the request data
      const result = await prisma.requests.create({
        data: {
          ...mockWithdrawPending,
          date: new Date(mockRequest.date)
        }
      });
      requestId = result.request_id;

      const updateData = {
        request_id: requestId,
        status: 'rejected',
        reason: 'Need to reject',
        processor_id: mockRequest.processor_id
      };

      const request = {
        json: jest.fn().mockResolvedValue(updateData),
        url: `http://localhost:3000/api/requests?reportingManager=${updateData.processor_id}`
      } as unknown as Request;

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.updatedRequest.status).toBe('approved');
      expect(data.newLog.action).toBe('withdraw_reject');
    });

    it('should handle approved withdrawal approval - withdrawal cancelled', async () => {
      //simiulate the request data
      const result = await prisma.requests.create({
        data: {
          ...mockWithdrawPending,
          date: new Date(mockRequest.date)
        }
      });
      requestId = result.request_id;

      const updateData = {
        request_id: requestId,
        status: 'cancelled',
        reason: 'Need to cancel',
        processor_id: mockRequest.processor_id
      };

      const request = {
        json: jest.fn().mockResolvedValue(updateData),
        url: `http://localhost:3000/api/requests?reportingManager=${updateData.processor_id}`
      } as unknown as Request;

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.updatedRequest.status).toBe('approved');
      expect(data.newLog.action).toBe('cancel ');
    });

    it('should handle withdrawal approval - approved', async () => {
      //simiulate the request data
      const result = await prisma.requests.create({
        data: {
          ...mockWithdrawPending,
          date: new Date(mockRequest.date)
        }
      });
      requestId = result.request_id;

      const updateData = {
        request_id: requestId,
        status: 'approved',
        reason: 'Need to approve',
        processor_id: mockRequest.processor_id
      };

      const request = {
        json: jest.fn().mockResolvedValue(updateData),
        url: `http://localhost:3000/api/requests?reportingManager=${updateData.processor_id}`
      } as unknown as Request;

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.updatedRequest.status).toBe('withdrawn');
      expect(data.newLog.action).toBe('withdraw_approve');
    });

    beforeEach(async () => {
      const result = await prisma.requests.create({
        data: {
          ...mockRequest,
          date: new Date(mockRequest.date)
        }
      });
      requestId = result.request_id;
    });

    it('should handle cancellation', async () => {
      const updateData = {
        request_id: requestId,
        status: 'cancelled',
        reason: 'Need to cancel',
        processor_id: mockRequest.processor_id
      };

      const request = {
        json: jest.fn().mockResolvedValue(updateData),
        url: `http://localhost:3000/api/requests?reportingManager=${updateData.processor_id}`
      } as unknown as Request;

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.updatedRequest.status).toBe('cancelled');
      expect(data.newLog.action).toBe('cancel');
    });

    it('should handle withdraw pending', async () => {
      const updateData = {
        request_id: requestId,
        status: 'withdraw_pending',
        reason: 'Need to withdraw',
        processor_id: mockRequest.processor_id
      };

      const request = {
        json: jest.fn().mockResolvedValue(updateData),
        url: `http://localhost:3000/api/requests?reportingManager=${updateData.processor_id}`
      } as unknown as Request;

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.updatedRequest.status).toBe('withdraw_pending');
      expect(data.newLog.action).toBe('withdraw');
    });

    it('should handle date change for pending requests', async () => {
      const updateData = {
        request_id: requestId,
        new_date: '2024-11-01',
        processor_id: mockRequest.processor_id
      };

      const request = {
        json: jest.fn().mockResolvedValue(updateData),
        url: 'http://localhost:3000/api/requests'
      } as unknown as Request;

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.updatedRequest.date).toContain('2024-11-01');
      expect(data.newLog.action).toBe('change_date');
    });

    it('should handle invalid status transitions', async () => {
      const updateData = {
        request_id: requestId,
        status: 'invalid_status',
        processor_id: mockRequest.processor_id
      };

      const request = {
        json: jest.fn().mockResolvedValue(updateData),
        url: 'http://localhost:3000/api/requests'
      } as unknown as Request;

      await expect(PUT(request)).rejects.toThrow('Invalid status transition');
    });

    it('should handle non-existent request', async () => {
      const updateData = {
        request_id: 99999,
        status: 'approved',
        processor_id: mockRequest.processor_id
      };

      const request = {
        json: jest.fn().mockResolvedValue(updateData),
        url: 'http://localhost:3000/api/requests'
      } as unknown as Request;

      await expect(PUT(request)).rejects.toThrow('Request not found');
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
