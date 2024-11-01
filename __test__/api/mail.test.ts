// First, declare the mock function
const mockSendEmail = jest.fn();

// Then use it in the mocks
jest.mock('../../emails', () => ({
  __esModule: true,
  default: jest.fn(() => 'Mocked Email Template')
}));

jest.mock('resend', () => ({
  Resend: jest.fn(() => ({
    emails: { send: mockSendEmail }
  }))
}));

// Finally, import the route handler
import { POST } from '@/app/api/mail/route';

describe('Mail API', () => {
  const validBody = {
    email: 'test@example.com',
    requesterName: 'Test User',
    emailSubject: 'Test Subject'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function createRequest(body: any) {
    return new Request('http://localhost/api/mail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  }

  test('sends email successfully', async () => {
    const mockResponse = { id: '123' };
    mockSendEmail.mockResolvedValueOnce({ data: mockResponse, error: null });

    const response = await POST(createRequest(validBody));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockResponse);
    expect(mockSendEmail).toHaveBeenCalledWith({
      from: 'Test',
      to: [validBody.email],
      subject: validBody.emailSubject,
      react: 'Mocked Email Template'
    });
  });

  test('handles missing fields', async () => {
    const invalidBodies = [
      { requesterName: 'Test', emailSubject: 'Test' },
      { email: 'test@test.com', emailSubject: 'Test' },
      { email: 'test@test.com', requesterName: 'Test' },
      {}
    ];

    for (const body of invalidBodies) {
      const response = await POST(createRequest(body));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Missing required fields' });
    }
  });

  test('handles Resend API error', async () => {
    mockSendEmail.mockResolvedValueOnce({
      data: null,
      error: { message: 'Failed to send' }
    });

    const response = await POST(createRequest(validBody));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Failed to send' });
  });

  test('handles unexpected errors', async () => {
    mockSendEmail.mockRejectedValueOnce(new Error('Network error'));

    const response = await POST(createRequest(validBody));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to send email' });
  });

  test('handles invalid JSON', async () => {
    const request = new Request('http://localhost/api/mail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json'
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to send email' });
  });
});
