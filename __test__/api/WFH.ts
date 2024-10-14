import { db } from '@/lib/db';
import { withdrawWFHRequest } from '@/lib/crudFunctions/WFH'; // Assuming you have a function like this

describe('Withdrawing WFH Rearrangement', () => {
  const testStaffId = 1;
  const testWithdrawRequestId = 100;

  beforeEach(async () => {
    // Clean the database
    await db.withdraw_requests.deleteMany();
    await db.users.deleteMany();
    await db.requests.deleteMany();

    // Seed required data
    await db.users.create({
      data: {
        Staff_ID: testStaffId,
        Staff_Fname: 'John',
        Staff_Lname: 'Doe',
        Department: 'HR',
        Position: 'Manager',
        Country: 'USA',
        Role_ID: 1
      }
    });

    await db.withdraw_requests.create({
      data: {
        Withdraw_Request_ID: testWithdrawRequestId,
        Staff_ID: testStaffId,
        Timeslot: 'AM',
        Date: new Date('2023-10-01'),
        Reason: 'Personal reasons',
        Approved: 'Pending'
      }
    });
  });

  it('should withdraw the WFH request successfully', async () => {
    const result = await withdrawWFHRequest(testWithdrawRequestId);

    expect(result.success).toBe(true);

    // Verify the request is withdrawn in the database
    const withdrawnRequest = await db.withdraw_requests.findUnique({
      where: { Withdraw_Request_ID: testWithdrawRequestId }
    });

    expect(withdrawnRequest).toBeNull(); // Request should be removed after withdrawal
  });
});
