import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';

// Extend the `User` type to include custom fields like `staff_id`
declare module 'next-auth' {
  interface User extends DefaultUser {
    staff_id: number;
    staff_fname: string;
    staff_lname: string;
    dept_id: number | null;
    position: string | null;
    country: string | null;
    email: string;
    reporting_manager: number | null;
    role_id: number | null;
  }

  interface Session {
    user: {
      staff_id: number;
      staff_fname: string;
      staff_lname: string;
      dept_id: number | null;
      position: string | null;
      country: string | null;
      email: string;
      reporting_manager: number | null;
      role_id: number | null; // Add staff_id to Session's user object
    } & DefaultSession['user'];
  }

  interface JWT {
    staff_id: number;
    staff_fname: string;
    staff_lname: string;
    dept_id: number | null;
    position: string | null;
    country: string | null;
    email: string;
    reporting_manager: number | null;
    role_id: number | null; // Add staff_id to JWT token
  }
}
