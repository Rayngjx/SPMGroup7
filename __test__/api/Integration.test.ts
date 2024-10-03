import request from 'supertest'; // Supertest for making HTTP requests
import { GET, PUT, DELETE, OPTIONS } from '@/app/api/users/[staffId]/route'; // Import your API route handlers
import { db } from '@/lib/db'; // Changed to named import

describe('Integration Tests for User API Routes', () => {
  beforeAll(async () => {
    // Run any necessary setup for your database
    await db.$connect(); // Example: connect to your test database
  });

  afterAll(async () => {
    // Clean up and close the database connection
    await db.$disconnect();
  });

  afterEach(async () => {
    // Clean up test data after each test
    await db.users.deleteMany(); // This would clear your test database (depending on the db you're using)
  });

  // PUT (Update user)
  it('should update the user successfully (PUT /api/user/:staffId)', async () => {
    // Insert a test user to update
    await db.user.create({
      staff_id: 123,
      staff_fname: 'John',
      staff_lname: 'Doe'
    });

    // Call the PUT endpoint to update the user
    const response = await request(app)
      .put('/api/user/123')
      .send({ staff_fname: 'Jane', staff_lname: 'Smith' });

    // Verify the response
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Verify that the user was actually updated in the database
    const updatedUser = await db.getUser(123); // Fetch from real db
    expect(updatedUser.staff_fname).toBe('Jane');
    expect(updatedUser.staff_lname).toBe('Smith');
  });

  // DELETE (Delete user)
  it('should delete the user successfully (DELETE /api/user/:staffId)', async () => {
    // Insert a test user to delete
    await db.insert('users', {
      staff_id: 123,
      staff_fname: 'John',
      staff_lname: 'Doe'
    });

    // Call the DELETE endpoint to delete the user
    const response = await request(app).delete('/api/user/123');

    // Verify the response
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Verify that the user was actually deleted from the database
    const deletedUser = await db.getUser(123); // Should return null or undefined
    expect(deletedUser).toBeNull();
  });

  // More tests for failure scenarios (invalid staffId, user not found, etc.)
});
