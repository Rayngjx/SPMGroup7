export const NextResponse = {
  json: jest.fn((body, { status } = { status: 200 }) => ({
    json: body,
    status
  }))
  // Add any additional properties here if needed
};
