'use server';
import { db } from '@/lib/db';

export async function getApprovedDates() {
  const response = await db.approved_dates.findMany();
  if (response) return response;
}

export async function createApproveDates(payload: any) {
  const response = await db.approved_dates.create({
    data: payload
  });
  if (response) return { success: true };
  return { success: false, error: 'Failed!' };
}

export async function updateApproveDates(payload: any) {
  const response = await db.approved_dates.update({
    where: {
      staff_id_request_id_date: {
        staff_id: payload.staff_id,
        request_id: payload.request_id,
        date: new Date(payload.date) // Ensure date is a Date object
      }
    },
    data: payload // Only update non-key fields
  });
  if (response) return { success: true };
  return { success: false, error: 'Failed!' };
}

export async function deleteApproveDates(payload: any) {
  const response = await db.approved_dates.delete({
    where: {
      staff_id_request_id_date: {
        staff_id: payload.staff_id,
        request_id: payload.request_id,
        date: new Date(payload.date) // Ensure date is a Date object
      }
    }
  });
  if (response) return { success: true };
  return { success: false, error: 'Failed!' };
}
