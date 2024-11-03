// __tests__/documentUpload.test.ts
import { GET, POST } from '@/app/api/documents/route';
import { supabase } from '@/lib/supabase';
import { createMocks } from 'node-mocks-http';
import { File, FormData } from 'formdata-node';
import { Request } from 'cross-fetch';

global.Request = Request as any;

jest.mock('@/lib/supabase', () => {
  const mockFrom = jest.fn(() => ({
    select: jest.fn(() => ({
      limit: jest.fn().mockResolvedValue({ data: [{ id: 1 }], error: null })
    })),
    upload: jest
      .fn()
      .mockResolvedValue({ data: { path: 'path/to/file' }, error: null }),
    getPublicUrl: jest
      .fn()
      .mockReturnValueOnce({
        data: { publicUrl: 'https://public.url/uploaded/test.pdf' },
        error: null
      })
  }));

  return {
    supabase: {
      from: mockFrom,
      storage: { from: mockFrom }
    }
  };
});

const NextResponse = require('next/server').NextResponse;

function createFormDataRequest(
  fileContent = 'test content',
  fileName = 'test-file.pdf',
  fileType = 'application/pdf'
) {
  const formData = new FormData();
  formData.append(
    'document',
    new File([fileContent], fileName, { type: fileType })
  );

  const headers = { 'Content-Type': 'multipart/form-data' };
  const request = new Request('http://localhost/api/documents', {
    method: 'POST',
    headers: headers as HeadersInit,
    body: formData as unknown as BodyInit
  });

  return request;
}

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200
    }))
  }
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Document Upload API', () => {
  test('Supabase connection check', async () => {
    const { data, error } = await supabase
      .from('testbucket')
      .select('*')
      .limit(1);
    expect(error).toBeNull();
    expect(data).not.toBeNull();
  });

  it('should upload the file and return the public URL on success', async () => {
    const request = createFormDataRequest();

    // Mock supabase storage functions
    const mockStorage = supabase.storage.from('testbucket');
    (mockStorage.upload as jest.Mock).mockResolvedValue({
      data: { path: 'uploads/test-file.pdf' },
      error: null
    });
    (mockStorage.getPublicUrl as jest.Mock).mockReturnValue({
      data: { publicUrl: 'https://public.url/uploaded/test-file.pdf' },
      error: null
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ url: 'https://public.url/uploaded/test-file.pdf' });
  });

  it('should return 500 if there is a public URL retrieval error', async () => {
    const formData = new FormData();
    const file = new File(['test content'], 'testfile.pdf', {
      type: 'application/pdf'
    });
    formData.append('document', file);

    const mockStorage = supabase.storage.from('testbucket');
    (mockStorage.upload as jest.Mock).mockResolvedValue({
      data: { path: 'uploaded/test.pdf' },
      error: null
    });
    (mockStorage.getPublicUrl as jest.Mock).mockReturnValueOnce({
      data: null,
      error: { message: 'Failed to retrieve public URL' }
    });

    const { req } = createMocks({ method: 'POST', body: formData });
    req.formData = async () => formData;

    await POST(req as any);

    const NextResponse = require('next/server').NextResponse;
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Could not get public URL: Failed to retrieve public URL' },
      { status: 500 }
    );
  });

  test('GET function with valid requestId', async () => {
    const request = new Request('http://localhost/api/documents?requestId=123');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ url: 'https://public.url/uploaded/test.pdf' });
  });

  it('should handle file size exceeding limit', async () => {
    const largeFile = new File(
      [new ArrayBuffer(5 * 1024 * 1024 + 1)],
      'largefile.pdf',
      { type: 'application/pdf' }
    );
    const formData = new FormData();
    formData.append('document', largeFile);

    const { req } = createMocks({ method: 'POST', body: formData });
    req.formData = async () => formData;

    await POST(req as any);

    const NextResponse = require('next/server').NextResponse;
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'File size exceeds 5MB limit' },
      { status: 400 }
    );
  });
});

describe('Document Upload API - POST handler', () => {
  it('should upload the file and return the public URL on success', async () => {
    const formData = new FormData();
    const file = new File(['test content'], 'testfile.pdf', {
      type: 'application/pdf'
    });
    formData.append('document', file);

    const mockStorage = supabase.storage.from('testbucket');
    (mockStorage.upload as jest.Mock).mockResolvedValue({
      data: { path: 'uploaded/test.pdf' },
      error: null
    });
    (mockStorage.getPublicUrl as jest.Mock).mockReturnValue({
      data: { publicUrl: 'https://public.url/uploaded/test.pdf' },
      error: null
    });

    const { req, res } = createMocks({ method: 'POST', body: formData });
    req.formData = async () => formData;

    await POST(req as any);

    const NextResponse = require('next/server').NextResponse;
    expect(NextResponse.json).toHaveBeenCalledWith(
      { url: 'https://public.url/uploaded/test.pdf' },
      { status: 200 }
    );
  });

  it('should return 400 if the file type is invalid', async () => {
    const formData = new FormData();
    const file = new File(['invalid content'], 'invalidfile.exe', {
      type: 'application/x-msdownload'
    });
    formData.append('document', file);

    const { req, res } = createMocks({ method: 'POST', body: formData });
    req.formData = async () => formData;

    await POST(req as any);
    const NextResponse = require('next/server').NextResponse;
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        error:
          'Invalid file type. Only PDF, JPEG, PNG, DOC, and DOCX are allowed'
      },
      { status: 400 }
    );
  });

  it('should return 400 if the file size exceeds 5MB', async () => {
    const largeFile = new File(
      [new ArrayBuffer(5 * 1024 * 1024 + 1)],
      'largefile.pdf',
      {
        type: 'application/pdf'
      }
    );
    const formData = new FormData();
    formData.append('document', largeFile);

    const { req, res } = createMocks({ method: 'POST', body: formData });
    req.formData = async () => formData;

    await POST(req as any);
    const NextResponse = require('next/server').NextResponse;
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'File size exceeds 5MB limit' },
      { status: 400 }
    );
  });

  it('should return 500 if there is a storage upload error', async () => {
    const formData = new FormData();
    const file = new File(['test content'], 'testfile.pdf', {
      type: 'application/pdf'
    });
    formData.append('document', file);

    const mockStorage = supabase.storage.from('testbucket');
    (mockStorage.upload as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: 'Upload failed' }
    });

    const { req, res } = createMocks({ method: 'POST', body: formData });
    req.formData = async () => formData;

    await POST(req as any);
    const NextResponse = require('next/server').NextResponse;
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'File upload failed: Upload failed' },
      { status: 500 }
    );
  });

  describe('Document Upload API - POST handler', () => {
    it('should return 500 if there is a public URL retrieval error', async () => {
      const formData = new FormData();
      const file = new File(['test content'], 'testfile.pdf', {
        type: 'application/pdf'
      });
      formData.append('document', file);

      const mockStorage = supabase.storage.from('testbucket');
      (mockStorage.upload as jest.Mock).mockResolvedValue({
        data: { path: 'uploaded/test.pdf' },
        error: null
      });
      (mockStorage.getPublicUrl as jest.Mock).mockReturnValueOnce({
        data: null,
        error: { message: 'Failed to retrieve public URL' }
      });

      const { req, res } = createMocks({ method: 'POST', body: formData });
      req.formData = async () => formData;

      const response = await POST(req as any);
      const NextResponse = require('next/server').NextResponse;
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Could not get public URL: Failed to retrieve public URL' },
        { status: 500 }
      );
    });
  });
});
