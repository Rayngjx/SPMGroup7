import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Get all approved dates (GET request)
export async function GET() {
  try {
    const approvedDates = await db.approved_dates.findMany();
    return NextResponse.json(approvedDates);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch approved dates' },
      { status: 500 }
    );
  }
}

// Create approved dates (POST request)
export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const response = await db.approved_dates.create({
      data: {
        ...payload,
        date: new Date(payload.date)
      }
    });
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create approved date' },
      { status: 500 }
    );
  }
}

// Update approved dates (PUT request)
export async function PUT(req: Request) {
  try {
    const payload = await req.json();
    const response = await db.approved_dates.update({
      where: {
        staff_id_request_id_date: {
          staff_id: payload.staff_id,
          request_id: payload.request_id,
          date: new Date(payload.date)
        }
      },
      data: payload
    });
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update approved date' },
      { status: 500 }
    );
  }
}

// Delete approved dates (DELETE request)
export async function DELETE(req: Request) {
  try {
    const payload = await req.json();
    const response = await db.approved_dates.delete({
      where: {
        staff_id_request_id_date: {
          staff_id: payload.staff_id,
          request_id: payload.request_id,
          date: new Date(payload.date)
        }
      }
    });
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete approved date' },
      { status: 500 }
    );
  }
}
