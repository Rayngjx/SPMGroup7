import { getUserById } from '@/services/user';

// Define a type for the credentials
interface Credentials {
  staff_id: string;
  password: string;
}

// Define a type for the user object
interface User {
  staff_id: number;
  password?: string; // Make password optional
  staff_fname: string;
  staff_lname: string;
  department: string;
  position: string;
  country: string;
  email: string | null;
  reporting_manager: number | null;
  role_id: number;
  temp_replacement: number | null;
}

// Mock the getUserById function
jest.mock('@/services/user', () => ({
  getUserById: jest.fn()
}));

describe('NextAuth credentials provider authorization', () => {
  // Define the type for the authorize function
  let authorizeFunction: (credentials: Credentials) => Promise<User | null>;

  beforeAll(() => {
    // Mock the authorize function
    authorizeFunction = async (credentials: Credentials) => {
      const user = await getUserById(Number(credentials.staff_id));

      // Ensure the user object includes the password for type compatibility
      if (user) {
        const { password, ...userWithoutPassword } = user as User; // Cast user to User type
        if (credentials.password === password) {
          // Compare password directly
          return { ...userWithoutPassword }; // Return user without password
        }
      }
      return null; // Failed login
    };
  });

  it('should return user on successful login', async () => {
    // Mock user data
    const mockUser: User = {
      staff_id: 140015,
      password: '140015', // Consider removing this if not needed
      staff_fname: 'John', // Add appropriate values
      staff_lname: 'Doe', // Add appropriate values
      department: 'IT', // Add appropriate values
      position: 'Developer', // Add appropriate values
      country: 'USA', // Add appropriate values
      email: null, // Add appropriate values
      reporting_manager: null, // Add appropriate values
      role_id: 1, // Add appropriate values
      temp_replacement: null // Add appropriate values
    };
    (getUserById as jest.Mock).mockResolvedValueOnce(mockUser);

    // Mock credentials
    const credentials: Credentials = { staff_id: '140015', password: '140015' };

    // Call the mocked authorize function
    const user = await authorizeFunction(credentials);

    // Assertions
    expect(user).toEqual(mockUser);
    expect(getUserById).toHaveBeenCalledWith(140015);
  });

  it('should return null if user is not found', async () => {
    (getUserById as jest.Mock).mockResolvedValueOnce(null);

    // Mock credentials
    const credentials: Credentials = { staff_id: '999999', password: '999999' };

    // Call the mocked authorize function
    const user = await authorizeFunction(credentials);

    // Assertions
    expect(user).toBeNull();
    expect(getUserById).toHaveBeenCalledWith(999999);
  });

  it('should return null if password does not match', async () => {
    const mockUser: User = {
      staff_id: 140015,
      password: '140015', // Consider removing this if not needed
      staff_fname: 'John',
      staff_lname: 'Doe',
      department: 'IT',
      position: 'Developer',
      country: 'USA',
      email: null,
      reporting_manager: null,
      role_id: 1,
      temp_replacement: null
    };
    (getUserById as jest.Mock).mockResolvedValueOnce(mockUser);

    // Mock credentials with incorrect password
    const credentials: Credentials = {
      staff_id: '140015',
      password: 'wrong_password'
    };

    // Call the mocked authorize function
    const user = await authorizeFunction(credentials);

    // Assertions
    expect(user).toBeNull();
    expect(getUserById).toHaveBeenCalledWith(140015);
  });
});
