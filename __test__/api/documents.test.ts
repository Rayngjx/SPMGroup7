import { GET, POST } from '@/app/api/documents/route';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';

// Mock next/server
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200,
      ...data
    }))
  }
}));

// Mock supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() =>
          Promise.resolve({ data: { path: 'test.pdf' }, error: null })
        ),
        getPublicUrl: jest.fn(() => ({
          data: { publicUrl: 'https://example.com/test.pdf' }
        }))
      }))
    }
  }
}));

// Mock Prisma client
jest.mock('@/lib/db', () => ({
  db: {
    requests: {
      findUnique: jest.fn(() =>
        Promise.resolve({
          document_url: 'test-document.pdf'
        })
      )
    }
  }
}));

describe('Document API', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mocks with new implementations
    (db.requests.findUnique as jest.Mock).mockResolvedValue({
      document_url: 'test-document.pdf'
    });

    const mockStorageFrom = jest.fn(() => ({
      upload: jest.fn(() =>
        Promise.resolve({
          data: { path: 'test.pdf' },
          error: null
        })
      ),
      getPublicUrl: jest.fn(() => ({
        data: { publicUrl: 'https://example.com/test.pdf' }
      }))
    }));

    (supabase.storage.from as jest.Mock) = mockStorageFrom;
  });

  describe('GET /api/documents', () => {
    it('should successfully get document URL', async () => {
      // Create mock request with requestId
      const mockRequest = new Request(
        'http://localhost:3000/api/documents?requestId=123'
      );

      const response = await GET(mockRequest);
      const responseData = await response.json();

      // Verify response
      expect(responseData).toEqual({
        url: 'https://example.com/test.pdf'
      });
      expect(response.status).toBe(200);
      expect(db.requests.findUnique).toHaveBeenCalledWith({
        where: { request_id: 123 },
        select: { document_url: true }
      });
    });

    it('should return 400 when requestId is missing', async () => {
      const mockRequest = new Request('http://localhost:3000/api/documents');

      const response = await GET(mockRequest);
      const responseData = await response.json();

      expect(responseData).toEqual({ error: 'Request ID is required' });
      expect(response.status).toBe(400);
    });

    it('should return 404 when document is not found', async () => {
      // Mock database to return null
      (db.requests.findUnique as jest.Mock).mockResolvedValue(null);

      const mockRequest = new Request(
        'http://localhost:3000/api/documents?requestId=123'
      );

      const response = await GET(mockRequest);
      const responseData = await response.json();

      expect(responseData).toEqual({ error: 'Document not found' });
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/documents', () => {
    it('should successfully upload a document', async () => {
      // Create mock file
      const mockFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf'
      });

      const formData = new FormData();
      formData.append('document', mockFile);

      // Create mock request
      const mockRequest = new Request('http://localhost:3000/api/documents', {
        method: 'POST',
        body: formData
      });

      const response = await POST(mockRequest);
      const responseData = await response.json();

      // Verify response
      expect(responseData).toEqual({
        url: 'https://example.com/test.pdf'
      });
      expect(response.status).toBe(200);
      expect(supabase.storage.from).toHaveBeenCalledWith('testbucket');
    });

    it('should return 400 when no file is provided', async () => {
      const formData = new FormData();
      const mockRequest = new Request('http://localhost:3000/api/documents', {
        method: 'POST',
        body: formData
      });

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(responseData).toEqual({ error: 'No file uploaded' });
      expect(response.status).toBe(400);
    });
  });
});
