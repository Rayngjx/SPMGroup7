import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
