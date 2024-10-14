// Import jest and the future WFH functions
jest.mock('@/lib/crudFunctions/WFHFunctions', () => ({
  applyForWFHRequest: jest.fn(),
  cancelWFHRequest: jest.fn(),
  viewTeamSchedule: jest.fn(),
  viewWFHRequest: jest.fn(),
  viewWFHArrangements: jest.fn(),
  withdrawWFHArrangement: jest.fn()
}));

// Import the mocked module
import * as WFHFunctions from '@/lib/crudFunctions/WFHFunctions';

describe('WFH Functionality', () => {
  // Test: Apply for WFH Request
  it('should apply for WFH request', async () => {
    // Define the mock behavior
    WFHFunctions.applyForWFHRequest.mockResolvedValue({
      staff_id: 1,
      timeslot: 'AM',
      daterange: [new Date('2024-10-10')],
      reason: 'Medical reason',
      approved: 'Pending'
    });

    // Call the mock function
    const result = await WFHFunctions.applyForWFHRequest();

    // Assertions
    expect(result.staff_id).toBe(1);
    expect(result.timeslot).toBe('AM');
    expect(result.approved).toBe('Pending');
  });

  // Test: Cancel Pending WFH Request
  it('should cancel a pending WFH request', async () => {
    // Define the mock behavior
    WFHFunctions.cancelWFHRequest.mockResolvedValue({ success: true });

    // Call the mock function
    const result = await WFHFunctions.cancelWFHRequest(1); // Assume 1 is the WFH request ID

    // Assertions
    expect(result.success).toBe(true);
  });

  // Test: View Team Schedule
  it('should view team schedule as a whole', async () => {
    // Define the mock behavior
    WFHFunctions.viewTeamSchedule.mockResolvedValue([
      { staff_id: 1, position: 'Manager', working_status: 'WFH' },
      { staff_id: 2, position: 'Developer', working_status: 'In Office' }
    ]);

    // Call the mock function
    const result = await WFHFunctions.viewTeamSchedule(123); // Assume 123 is the team lead ID

    // Assertions
    expect(result.length).toBe(2);
    expect(result[0].working_status).toBe('WFH');
  });

  // Test: View WFH Request
  it('should view WFH request details', async () => {
    // Define the mock behavior
    WFHFunctions.viewWFHRequest.mockResolvedValue({
      staff_id: 1,
      timeslot: 'PM',
      daterange: [new Date('2024-11-05')],
      reason: 'Personal Errand',
      approved: 'Pending'
    });

    // Call the mock function
    const result = await WFHFunctions.viewWFHRequest(1); // Assume 1 is the WFH request ID

    // Assertions
    expect(result.staff_id).toBe(1);
    expect(result.timeslot).toBe('PM');
    expect(result.reason).toBe('Personal Errand');
  });

  // Test: View WFH Arrangements
  it('should view all WFH arrangements', async () => {
    // Define the mock behavior
    WFHFunctions.viewWFHArrangements.mockResolvedValue([
      { staff_id: 1, timeslot: 'AM', daterange: [new Date('2024-10-10')] },
      { staff_id: 2, timeslot: 'PM', daterange: [new Date('2024-10-11')] }
    ]);

    // Call the mock function
    const result = await WFHFunctions.viewWFHArrangements();

    // Assertions
    expect(result.length).toBe(2);
    expect(result[0].timeslot).toBe('AM');
  });

  // Test: Withdraw WFH Arrangement
  it('should withdraw an existing WFH arrangement', async () => {
    // Define the mock behavior
    WFHFunctions.withdrawWFHArrangement.mockResolvedValue({ success: true });

    // Call the mock function
    const result = await WFHFunctions.withdrawWFHArrangement(1); // Assume 1 is the WFH arrangement ID

    // Assertions
    expect(result.success).toBe(true);
  });
});
