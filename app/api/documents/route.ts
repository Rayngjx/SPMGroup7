import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('document') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const filename = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage
    .from('testbucket')
    .upload(`documents/${filename}`, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ url: data?.path });
}
