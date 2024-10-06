import { NextResponse } from 'next/server';
import { getLogs, createLog } from '@/lib/crudFunctions/Logs';

// Handle GET request to fetch all logs
export async function GET() {
  try {
    const logs = await getLogs();

    return logs
      ? NextResponse.json(logs, { status: 200 })
      : NextResponse.json({ error: 'No logs found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}

// Handle POST request to create a new log entry
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Optional: Validate required fields
    if (!body.request_id || !body.request_type) {
      return NextResponse.json(
        { error: 'Missing required fields: request_id, request_type' },
        { status: 400 }
      );
    }

    const result = await createLog(body);

    return result.success
      ? NextResponse.json(result, { status: 201 })
      : NextResponse.json({ error: result.error }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create log entry' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request to specify allowed methods
export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET', 'POST'] }, { status: 200 });
}
