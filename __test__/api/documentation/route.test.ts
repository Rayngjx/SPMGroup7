/**
 * @jest-environment node
 */
import { GET, POST } from '@/app/api/documents/route';
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

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
      const mockRequest = new Request(
        'http://localhost:3000/api/documents?requestId=123'
      );

      const response = await GET(mockRequest);
      const responseData = await response.json();

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
      (db.requests.findUnique as jest.Mock).mockResolvedValue(null);

      const mockRequest = new Request(
        'http://localhost:3000/api/documents?requestId=123'
      );

      const response = await GET(mockRequest);
      const responseData = await response.json();

      expect(responseData).toEqual({ error: 'Document not found' });
      expect(response.status).toBe(404);
    });

    it('should return 500 when getPublicUrl fails', async () => {
      const mockStorageFrom = jest.fn(() => ({
        getPublicUrl: jest.fn(() => ({
          data: { publicUrl: null }
        }))
      }));
      (supabase.storage.from as jest.Mock) = mockStorageFrom;

      const mockRequest = new Request(
        'http://localhost:3000/api/documents?requestId=123'
      );

      const response = await GET(mockRequest);
      const responseData = await response.json();

      expect(responseData).toEqual({ error: 'Failed to get public URL' });
      expect(response.status).toBe(500);
    });

    it('should handle unexpected errors', async () => {
      (db.requests.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const mockRequest = new Request(
        'http://localhost:3000/api/documents?requestId=123'
      );

      const response = await GET(mockRequest);
      const responseData = await response.json();

      expect(responseData).toEqual({ error: 'Database error' });
      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/documents', () => {
    it('should successfully upload a document', async () => {
      const mockFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf'
      });

      const formData = new FormData();
      formData.append('document', mockFile);

      const mockRequest = new Request('http://localhost:3000/api/documents', {
        method: 'POST',
        body: formData
      });

      const response = await POST(mockRequest);
      const responseData = await response.json();

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

    it('should validate file size', async () => {
      const mockFile = new File(['test'.repeat(2000000)], 'large.pdf', {
        type: 'application/pdf'
      });
      Object.defineProperty(mockFile, 'size', { value: 6 * 1024 * 1024 });

      const formData = new FormData();
      formData.append('document', mockFile);

      const mockRequest = new Request('http://localhost:3000/api/documents', {
        method: 'POST',
        body: formData
      });

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(responseData).toEqual({ error: 'File size exceeds 5MB limit' });
      expect(response.status).toBe(400);
    });

    it('should validate file type', async () => {
      const mockFile = new File(['test content'], 'test.txt', {
        type: 'text/plain'
      });

      const formData = new FormData();
      formData.append('document', mockFile);

      const mockRequest = new Request('http://localhost:3000/api/documents', {
        method: 'POST',
        body: formData
      });

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(responseData).toEqual({
        error:
          'Invalid file type. Only PDF, JPEG, PNG, DOC, and DOCX are allowed'
      });
      expect(response.status).toBe(400);
    });

    it('should handle upload errors', async () => {
      const mockStorageFrom = jest.fn(() => ({
        upload: jest.fn(() =>
          Promise.resolve({
            data: null,
            error: { message: 'Upload failed' }
          })
        ),
        getPublicUrl: jest.fn()
      }));
      (supabase.storage.from as jest.Mock) = mockStorageFrom;

      const mockFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf'
      });

      const formData = new FormData();
      formData.append('document', mockFile);

      const mockRequest = new Request('http://localhost:3000/api/documents', {
        method: 'POST',
        body: formData
      });

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(responseData).toEqual({
        error: 'File upload failed: Upload failed'
      });
      expect(response.status).toBe(500);
    });

    it('should handle getPublicUrl errors after upload', async () => {
      const mockStorageFrom = jest.fn(() => ({
        upload: jest.fn(() =>
          Promise.resolve({
            data: { path: 'test.pdf' },
            error: null
          })
        ),
        getPublicUrl: jest.fn(() => ({
          data: { publicUrl: null }
        }))
      }));
      (supabase.storage.from as jest.Mock) = mockStorageFrom;

      const mockFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf'
      });

      const formData = new FormData();
      formData.append('document', mockFile);

      const mockRequest = new Request('http://localhost:3000/api/documents', {
        method: 'POST',
        body: formData
      });

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(responseData).toEqual({ error: 'Could not get public URL' });
      expect(response.status).toBe(500);
    });
  });
});
