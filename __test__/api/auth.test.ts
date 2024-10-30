import { getUserById } from '@/services/user';
import { authConfig } from '@/auth.config';
import { CredentialsConfig } from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';
import { AdapterUser, AdapterSession } from 'next-auth/adapters';
import 'whatwg-fetch';

// Mock getUserById function
jest.mock('@/services/user', () => ({
  getUserById: jest.fn()
}));

describe('Auth Config Tests', () => {
  const { providers, callbacks } = authConfig;

  // Find the credentials provider
  const credentialsProvider = providers.find(
    (provider): provider is CredentialsConfig => provider.id === 'credentials'
  );

  if (!credentialsProvider) {
    throw new Error('Credentials provider not found');
  }

  // Helper function to create a mock request
  function createMockRequest(credentials: Partial<Record<string, unknown>>) {
    return new Request('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(credentials)
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Credentials Provider - authorize function', () => {
    it('should return user on successful login', async () => {
      const mockUser = { staff_id: '140015', password: '140015' };
      (getUserById as jest.Mock).mockResolvedValueOnce(mockUser);

      // Mock credentials structure
      const credentials = { staff_id: '140015', password: '140015' };

      const req = createMockRequest(credentials);

      // Call the authorize function directly
      const user = await credentialsProvider.authorize(credentials, req);
      console.log(credentialsProvider.authorize(credentials, req));
      console.log(user);

      // Assertions
      expect(user).toEqual(mockUser);
      expect(getUserById).toHaveBeenCalledWith(140015);
    });

    it('should return null if user is not found', async () => {
      (getUserById as jest.Mock).mockResolvedValueOnce(null);

      const credentials = {
        staff_id: '999999',
        password: '999999'
      };

      const req = createMockRequest(credentials);

      // Call the authorize function directly
      const user = await credentialsProvider.authorize!(credentials, req);

      // Assertions
      expect(user).toBeNull();
      expect(getUserById).toHaveBeenCalledWith(999999);
    });

    it('should return null if password does not match', async () => {
      const mockUser = { staff_id: 140015, password: '140015' };
      (getUserById as jest.Mock).mockResolvedValueOnce(mockUser);

      const credentials = {
        staff_id: '140015',
        password: 'wrong_password'
      };

      const req = createMockRequest(credentials);

      // Call the authorize function directly
      const user = await credentialsProvider.authorize!(credentials, req);

      // Assertions
      expect(user).toBeNull();
      expect(getUserById).toHaveBeenCalledWith(140015);
    });
  });

  describe('JWT Callback', () => {
    it('should add user information to token', async () => {
      const user = {
        id: 'user-id',
        staff_id: 140015,
        staff_fname: 'Oliva',
        staff_lname: 'Lim',
        role_id: 2,
        reporting_manager: 140894,
        department: 'Sales',
        position: 'Account Manager',
        email: 'oliva.lim@example.com',
        emailVerified: null,
        country: 'CountryName'
      };
      const token: JWT = {};

      // Call the jwt callback
      const newToken = await callbacks.jwt!({
        token,
        user,
        account: null,
        profile: undefined,
        trigger: undefined,
        isNewUser: undefined
      });

      // Assertions
      expect(newToken).toMatchObject({
        id: 'user-id',
        staff_id: 140015,
        staff_fname: 'Oliva',
        staff_lname: 'Lim',
        role_id: 2,
        reporting_manager: 140894,
        department: 'Sales',
        position: 'Account Manager',
        email: 'oliva.lim@example.com',
        emailVerified: null,
        country: 'CountryName'
      });
    });
  });

  describe('Session Callback', () => {
    it('should add token information to session.user', async () => {
      const token = {
        id: 'user-id',
        staff_id: 140015,
        staff_fname: 'Oliva',
        staff_lname: 'Lim',
        role_id: 2,
        reporting_manager: 140894,
        department: 'Sales',
        position: 'Account Manager'
      };

      const mockUser: AdapterUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        image: null,
        staff_id: 140015,
        staff_fname: 'Oliva',
        staff_lname: 'Lim',
        role_id: 2,
        reporting_manager: 140894,
        department: 'Sales',
        position: 'Account Manager',
        country: '',
        emailVerified: null
      };

      const mockSession: { user: AdapterUser } & AdapterSession & Session = {
        user: mockUser,
        expires: new Date() as unknown as Date & string,
        sessionToken: 'mock-session-token',
        userId: 'user-id'
      };

      const newSession = await callbacks.session!({
        session: mockSession,
        user: mockUser,
        token,
        newSession: mockSession
      });

      // Assertions
      expect(newSession.user).toMatchObject({
        id: 'user-id',
        staff_id: 140015,
        staff_fname: 'Oliva',
        staff_lname: 'Lim',
        role_id: 2,
        reporting_manager: 140894,
        department: 'Sales',
        position: 'Account Manager'
      });
    });

    it('should keep session unchanged if token is not provided', async () => {
      const mockUser: AdapterUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        image: null,
        staff_id: 140015,
        staff_fname: 'Oliva',
        staff_lname: 'Lim',
        role_id: 2,
        reporting_manager: 140894,
        department: 'Sales',
        position: 'Account Manager',
        country: '',
        emailVerified: null
      };

      const mockSession: { user: AdapterUser } & AdapterSession & Session = {
        user: mockUser,
        expires: new Date() as unknown as Date & string,
        sessionToken: 'mock-session-token',
        userId: 'user-id'
      };

      const newSession = await callbacks.session!({
        session: mockSession,
        user: mockUser,
        token: {} as JWT, // Empty token
        newSession: mockSession
      });

      // Assertions
      expect(newSession).toEqual(mockSession);
    });
  });
});
