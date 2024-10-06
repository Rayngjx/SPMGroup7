import { db } from '@/lib/db';
import {
  getLogs,
  getStaffLogs,
  getProcessorLogs,
  getRequestLogs,
  createLog,
  updateLog,
  deleteLog
} from '@/lib/crudFunctions/Logs';

describe('Logs CRUD Functions', () => {
  const testLogId = 9999;
  const testStaffId = 1;
  const testProcessorId = 2;
  const testRequestId = 123;

  const testLogPayload = {
    staff_id: testStaffId,
    request_id: testRequestId,
    processor_id: testProcessorId,
    reason: 'Test Reason',
    request_type: 'Test Request Type',
    approved: 'Pending'
  };

  beforeAll(async () => {
    // Connect to the test database
    await db.$connect();

    // Seed the database with a test log
    await db.logs.create({
      data: {
        log_id: testLogId,
        ...testLogPayload
      }
    });
  });

  afterAll(async () => {
    // Cleanup the test log and disconnect
    await db.logs.deleteMany({
      where: { log_id: testLogId }
    });

    await db.$disconnect();
  });

  describe('getLogs', () => {
    it('should return all logs', async () => {
      const logs = await getLogs();
      expect(logs).not.toBeNull();
      if (logs) {
        expect(logs.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getStaffLogs', () => {
    it('should return logs by staff ID', async () => {
      const logs = await getStaffLogs(testStaffId);
      expect(logs).not.toBeNull();
      if (logs) {
        expect(logs[0].staff_id).toBe(testStaffId);
      }
    });
  });

  describe('getProcessorLogs', () => {
    it('should return logs by processor ID', async () => {
      const logs = await getProcessorLogs(testProcessorId);
      expect(logs).not.toBeNull();
      if (logs) {
        expect(logs[0].processor_id).toBe(testProcessorId);
      }
    });
  });

  describe('getRequestLogs', () => {
    it('should return logs by request ID', async () => {
      const logs = await getRequestLogs(testRequestId);
      expect(logs).not.toBeNull();
      if (logs) {
        expect(logs[0].request_id).toBe(testRequestId);
      }
    });
  });

  describe('createLog', () => {
    it('should create a new log', async () => {
      const newLogPayload = {
        staff_id: testStaffId,
        request_id: testRequestId + 1,
        processor_id: testProcessorId,
        reason: 'New Test Reason',
        request_type: 'New Test Request Type',
        approved: 'Approved'
      };

      const result = await createLog(newLogPayload);
      expect(result.success).toBe(true);
      expect(result.log).toHaveProperty('log_id');

      // Clean up the created log
      if (result.log) {
        await deleteLog(result.log.log_id);
      }
    });
  });

  describe('updateLog', () => {
    it('should update an existing log', async () => {
      const updatedPayload = {
        log_id: testLogId,
        reason: 'Updated Reason',
        approved: 'Approved',
        request_id: 1,
        request_type: 'Test Request Type'
      };

      const result = await updateLog(updatedPayload);
      expect(result.success).toBe(true);
      if (result.log) {
        expect(result.log.reason).toBe('Updated Reason');
        expect(result.log.approved).toBe('Approved');
      }
    });

    it('should fail to update without log ID', async () => {
      const invalidPayload = {
        reason: 'Fail Update'
      };

      const result = await updateLog(invalidPayload as any);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Log ID is required for updating!');
    });
  });

  describe('deleteLog', () => {
    it('should delete an existing log', async () => {
      const newLog = await db.logs.create({
        data: {
          ...testLogPayload,
          request_id: testRequestId + 2
        }
      });

      const result = await deleteLog(newLog.log_id);
      expect(result.success).toBe(true);

      // Verify the log is deleted
      const deletedLog = await db.logs.findUnique({
        where: { log_id: newLog.log_id }
      });
      expect(deletedLog).toBeNull();
    });

    it('should fail to delete a non-existent log', async () => {
      const result = await deleteLog(99999); // Non-existent log ID
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to delete log!');
    });
  });
});
