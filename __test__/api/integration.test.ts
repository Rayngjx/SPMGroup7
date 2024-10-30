import { POST, PUT } from '@/app/api/requests/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleData = [
  {
    staff_id: 140002,
    timeslot: 'AM',
    date: '2024-10-29T00:00:00.000Z',
    reason: 'This data is inserted from an integration testing',
    status: 'pending',
    document_url:
      'https://aeqhlmbevwopqhksicxn.supabase.co/storage/v1/object/public/testbucket/1729756879977-yk77y6_apple-touch-icon.png',
    processor_id: 140894
  }
];

describe('End-to-End: Insert and Approve Request', () => {
  let requestId: number;

  afterAll(async () => {
    await prisma.requests.deleteMany({
      where: {
        staff_id: 140002,
        timeslot: 'AM',
        date: new Date('2024-10-29T00:00:00.000Z')
      }
    });
    await prisma.$disconnect();
  });

  it('should insert a request and then approve it', async () => {
    const insertRequest = {
      json: jest.fn().mockResolvedValue(sampleData)
    } as unknown as Request;

    const postResponse = await POST(insertRequest);
    expect(postResponse.status).toBe(201);

    const postResponseBody = await postResponse.json();
    requestId = postResponseBody[0].request.request_id;

    const updateData = {
      request_id: requestId,
      status: 'approved',
      reason: 'Approved by manager through integration testing',
      processor_id: 140894
      //   new_date: '2024-11-01T00:00:00.000Z'
    };

    const approveRequest = {
      json: jest.fn().mockResolvedValue(updateData),
      url: `http://localhost:3000/api/requests?reportingManager=${updateData.processor_id}`
    } as unknown as Request;

    const putResponse = await PUT(approveRequest);
    expect(putResponse.status).toBe(200);

    const putResponseBody = await putResponse.json();
    console.log('PUT Response:', putResponseBody); // Debugging line

    expect(putResponseBody.updatedRequest).toEqual(
      expect.objectContaining({
        request_id: updateData.request_id,
        status: updateData.status,
        last_updated: expect.any(String)
      })
    );
    expect(putResponseBody.newLog).toEqual(
      expect.objectContaining({
        staff_id: sampleData[0].staff_id,
        request_id: updateData.request_id,
        processor_id: updateData.processor_id,
        reason: updateData.reason,
        action: 'approve'
      })
    );

    const updatedRequest = await prisma.requests.findUnique({
      where: { request_id: requestId }
    });

    expect(updatedRequest).not.toBeNull();
    expect(updatedRequest?.status).toBe(updateData.status);
  });
});
