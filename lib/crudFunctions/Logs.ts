'use server';
import { db } from '@/lib/db';

interface LogsPayload {
  log_id?: number; // Optional for create
  staff_id?: number;
  request_id?: number;
  withdraw_request_id?: number;
  processor_id?: number;
  reason?: string;
}

// Get all logs
export async function getLogs() {
  const response = await db.logs.findMany();
  return response ? response : null;
}

// Get logs by staff ID
export async function getStaffLogs(staffId: number) {
  const response = await db.logs.findMany({
    where: { staff_id: staffId }
  });
  return response ? response : null;
}

// Get logs by processor ID
export async function getProcessorLogs(processorId: number) {
  const response = await db.logs.findMany({
    where: { staff_id: processorId }
  });
  return response ? response : null;
}
// Get logs by request ID
export async function getRequestLogs(requestId: number) {
  const response = await db.logs.findMany({
    where: { request_id: requestId }
  });
  return response ? response : null;
}

// Get logs by withdraw request ID
export async function getWithdrawRequestLogs(withdrawRequestId: number) {
  const response = await db.logs.findMany({
    where: { withdraw_request_id: withdrawRequestId }
  });
  return response ? response : null;
}

// Create a new log entry
export async function createLog(payload: LogsPayload) {
  const response = await db.logs.create({
    data: {
      staff_id: payload.staff_id,
      request_id: payload.request_id,
      withdraw_request_id: payload.withdraw_request_id,
      processor_id: payload.processor_id,
      reason: payload.reason
    }
  });
  return response
    ? { success: true, log: response }
    : { success: false, error: 'Failed to create log!' };
}

// Update an existing log entry
export async function updateLog(payload: LogsPayload) {
  if (!payload.log_id) {
    return { success: false, error: 'Log ID is required for updating!' };
  }

  const response = await db.logs.update({
    where: { log_id: payload.log_id },
    data: {
      staff_id: payload.staff_id,
      request_id: payload.request_id,
      withdraw_request_id: payload.withdraw_request_id,
      processor_id: payload.processor_id,
      reason: payload.reason
    }
  });
  return response
    ? { success: true, log: response }
    : { success: false, error: 'Failed to update log!' };
}

// Delete a log entry
export async function deleteLog(log_id: number) {
  const response = await db.logs.delete({
    where: { log_id }
  });
  return response
    ? { success: true }
    : { success: false, error: 'Failed to delete log!' };
}
