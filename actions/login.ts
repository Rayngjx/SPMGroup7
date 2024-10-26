'use server';

import { signIn } from '@/auth';
import { loginSchema } from '@/schemas';
import { z } from 'zod';
// import { DEFAULT_LOGIN_REDIRECT } from '@/routes';
import { AuthError } from 'next-auth';
import { getUserById } from '@/services/user';
// // import bcrypt from "bcryptjs";
// import { generateTwoFactorToken } from '@/services/two-factor-token';
// import { sendTwoFactorEmail } from '@/services/mail';
// import { cookies } from 'next/headers';
// import {
//   getTwoFactorConfirmationByUserId,
//   deleteTwoFactorConfirmationById
// } from '@/services/two-factor-confirmation';
import { response } from '@/lib/utils';

export const login = async (payload: z.infer<typeof loginSchema>) => {
  console.log('Login function called with payload:', payload); // Log the incoming payload

  const validatedFields = loginSchema.safeParse(payload);
  if (!validatedFields.success) {
    console.log('Validation failed:', validatedFields.error); // Log validation errors
    return response(null, 'Invalid fields', 442, new Error('Invalid Fields'));
  }

  const { staff_id, password } = validatedFields.data;

  // Check if user exists
  const existingUser = await getUserById(Number(staff_id));
  if (!existingUser || !existingUser.staff_id) {
    console.log('User not found for staff_id:', staff_id); // Log user not found
    return response(
      null,
      'Invalid credentials.',
      401,
      new Error('Invalid credentials.')
    );
  }

  // Check if the staff_id matches the password (since they're the same)
  if (staff_id.toString() !== password) {
    console.log('StaffID does not match the password for staff_id:', staff_id); // Log mismatch
    return response(
      null,
      'Invalid credentials.',
      401,
      new Error('Invalid credentials.')
    );
  }

  // If everything is correct, proceed to sign in
  const signInResult = (await signInCredentials(
    existingUser.staff_id.toString(),
    password
  )) || { success: false };
  console.log('SignIn Result:', signInResult); // Log the sign-in result
  if (signInResult.success) {
    console.log('Login successful, returning response.'); // Log successful login
    return response(
      { userId: existingUser.staff_id.toString() },
      'User fetched successfully',
      200
    );
  }
  console.log('Login failed, returning error response.'); // Log failed login
  return signInResult; // Return the error response from signInCredentials
};

// Sign in credentials from next-auth
export const signInCredentials = async (staff_id: string, password: string) => {
  try {
    const result = await signIn('credentials', {
      staff_id,
      password,
      redirect: false // Prevent the automatic redirect
    });

    if (result?.error) {
      return response({
        success: false,
        error: {
          code: 401,
          message: 'Invalid credentials.'
        }
      });
    }

    return response({ success: true }); // Sign-in successful
  } catch (error) {
    console.error('SignIn error:', error);
    // Handle different AuthError cases
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return response({
            success: false,
            error: {
              code: 401,
              message: 'Invalid credentials.'
            }
          });
        case 'OAuthAccountNotLinked':
          return response({
            success: false,
            error: {
              code: 403,
              message:
                'Another account already registered with the same Email Address.'
            }
          });
        case 'Verification':
          return response({
            success: false,
            error: {
              code: 422,
              message: 'Verification failed. Please try again.'
            }
          });
        case 'AuthorizedCallbackError':
          return response({
            success: false,
            error: {
              code: 422,
              message: 'Authorization failed. Please try again.'
            }
          });
        default:
          return response({
            success: false,
            error: {
              code: 500,
              message: 'Something went wrong.'
            }
          });
      }
    }

    throw error;
  }
};
