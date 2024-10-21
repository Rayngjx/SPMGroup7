import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    // Fetch the document filename from the database using Prisma
    const requestRecord = await db.requests.findUnique({
      where: { request_id: parseInt(requestId) },
      select: { document_url: true }
    });

    if (!requestRecord || !requestRecord.document_url) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Get public URL of the file
    const { data, error } = supabase.storage
      .from('testbucket')
      .getPublicUrl(requestRecord.document_url);

    if (error || !data?.publicUrl) {
      return NextResponse.json(
        { error: 'Could not get public URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: data.publicUrl });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('document') as File;
    console.log('File:', file);
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Add file size check
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Add file type check
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, JPEG, and PNG are allowed' },
        { status: 400 }
      );
    }

    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    const filename = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('testbucket')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error.message);
      return NextResponse.json(
        { error: 'File upload failed' },
        { status: 500 }
      );
    }

    // Get public URL of the uploaded file
    const { data: publicUrlData, error: urlError } = supabase.storage
      .from('testbucket')
      .getPublicUrl(filename);

    if (urlError || !publicUrlData?.publicUrl) {
      console.error('Error getting public URL:', urlError);
      return NextResponse.json(
        { error: 'Could not get public URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (err) {
    console.error('Unexpected error in document upload:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
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
