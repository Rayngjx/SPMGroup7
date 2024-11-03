import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import { z } from 'zod';

// Response type definitions
const UploadResponseSchema = z.object({
  url: z.string().url()
});

const ErrorResponseSchema = z.object({
  error: z.string()
});

type UploadResponse = z.infer<typeof UploadResponseSchema>;
type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// File validation schemas
const FileValidationSchema = z.object({
  size: z.number().max(5 * 1024 * 1024, 'File size exceeds 5MB limit'),
  type: z.enum(
    [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    {
      errorMap: () => ({
        message:
          'Invalid file type. Only PDF, JPEG, PNG, DOC, and DOCX are allowed'
      })
    }
  )
});

export async function GET(
  request: Request
): Promise<NextResponse<UploadResponse | ErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    const requestRecord = await db.requests.findUnique({
      where: { request_id: parseInt(requestId) },
      select: { document_url: true }
    });

    if (!requestRecord?.document_url) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const { data } = supabase.storage
      .from('testbucket')
      .getPublicUrl(requestRecord.document_url);

    if (!data?.publicUrl) {
      return NextResponse.json(
        {
          error: 'Failed to get public URL'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: data.publicUrl });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Internal Server Error';
    // console.error('Unexpected error:', err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(
  request: Request
): Promise<NextResponse<UploadResponse | ErrorResponse>> {
  try {
    const formData = await request.formData();
    const file = formData.get('document') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file using the schema
    try {
      FileValidationSchema.parse({
        size: file.size,
        type: file.type
      });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: validationError.errors[0].message },
          { status: 400 }
        );
      }
    }

    // console.log('File details:', {
    //   name: file.name,
    //   type: file.type,
    //   size: file.size
    // });

    // Generate unique filename using timestamp and original name
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const filename = `${timestamp}-${randomString}_${file.name}`;

    const { data, error } = await supabase.storage
      .from('testbucket')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      // console.error('Supabase upload error:', error);
      return NextResponse.json(
        { error: `File upload failed: ${error.message}` },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from('testbucket')
      .getPublicUrl(filename);

    if (!publicUrlData?.publicUrl) {
      return NextResponse.json(
        {
          error: 'Could not get public URL'
        },
        { status: 500 }
      );
    }

    // Validate response before sending
    const response = { url: publicUrlData.publicUrl };
    const validatedResponse = UploadResponseSchema.parse(response);

    return NextResponse.json(validatedResponse);
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function OPTIONS() {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization'
  };

  return new NextResponse(null, { headers });
}
