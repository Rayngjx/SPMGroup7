/**
 * @jest-environment node
 */
import { GET, POST, OPTIONS } from '@/app/api/logs/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

describe('Logs API Tests', () => {
  let requestId: number;

  describe('GET /api/logs', () => {
    let mockLog: {
      log_id: number;
      staff_id: number | null;
      request_id: number;
      processor_id: number | null;
      reason: string | null;
      action: string;
      created_at: Date;
    };
    beforeEach(async () => {
      const result = await prisma.requests.create({
        data: {
          ...mockRequest,
          date: new Date(mockRequest.date)
        }
      });
      requestId = result.request_id;

      // Create a mock log to fetch during tests
      mockLog = await prisma.logs.create({
        data: {
          staff_id: 140015,
          request_id: requestId,
          processor_id: 140894,
          reason: 'Test reason',
          action: 'test_action',
          created_at: new Date()
        }
      });
    });

    afterEach(async () => {
      // Clean up by deleting the mock log
      await prisma.logs.delete({
        where: { log_id: mockLog.log_id }
      });
    });

    test('retrieves logs for a specific requestId', async () => {
      const request = new Request(
        `http://localhost:3000/api/logs?requestId=${requestId}`
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].request_id).toBe(requestId);
      expect(data[0].users_logs_staff_idTousers).toHaveProperty('staff_fname');
    });

    test('retrieves all logs when no requestId is specified', async () => {
      const request = new Request('http://localhost:3000/api/logs');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('POST /api/logs', () => {
    test('creates a new log entry successfully', async () => {
      const newLogData = {
        staff_id: 140015,
        request_id: requestId,
        processor_id: 140894,
        reason: 'New Test reason',
        action: 'test_action',
        created_at: new Date()
      };

      const request = {
        json: jest.fn().mockResolvedValue(newLogData)
      } as unknown as Request;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('log_id');
      expect(data.staff_id).toBe(newLogData.staff_id);
      expect(data.action).toBe(newLogData.action);

      // Clean up created log entry
      await prisma.logs.delete({
        where: { log_id: data.log_id }
      });
    });

    test('handles invalid data on log creation', async () => {
      const invalidLogData = {
        // Missing required fields like `staff_id`, `request_id`
        processor_id: 2,
        reason: 'Invalid data log entry',
        action: 'invalid_action'
      };

      const request = {
        json: jest.fn().mockResolvedValue(invalidLogData)
      } as unknown as Request;

      await expect(POST(request)).rejects.toThrow();
    });
  });

  describe('OPTIONS /api/logs', () => {
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
