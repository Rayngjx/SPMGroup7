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

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const filename = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('testbucket')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get public URL of the uploaded file
    const { data: publicUrlData, error: urlError } = supabase.storage
      .from('testbucket')
      .getPublicUrl(filename);

    if (urlError || !publicUrlData?.publicUrl) {
      return NextResponse.json(
        { error: 'Could not get public URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
