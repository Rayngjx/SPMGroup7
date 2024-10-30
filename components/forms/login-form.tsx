'use client';

import { CardWrapper } from '@/components/auth/card-wrapper';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { z } from 'zod';
import { loginSchema } from '@/schemas';
import { Button } from '@/components/ui/button';
import { useTransition } from 'react';
import { login } from '@/actions/login';
import { FormInput } from '@/components/auth/form-input';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export const LoginForm = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      staff_id: '',
      password: ''
    }
  });

  const handleSubmit = form.handleSubmit((values) => {
    startTransition(() => {
      login(values)
        .then((data) => {
          // Log the entire response
          if (!data) return toast.error('No response from server.');
          if (!data.success) {
            if ('error' in data && data.error) {
              return toast.error(data.error.message);
            }
            return toast.error('An unknown error occurred');
          }
          // Redirect to dashboard on successful login
          signIn('credentials', {
            staff_id: values.staff_id,
            password: values.password,
            redirect: false
          }).then((result) => {
            if (result && result.ok) {
              // Redirect to dashboard on successful login
              router.push('/dashboard');
            } else {
              // Handle errors
              toast.error('Invalid credentials');
            }
          });
        })
        .catch((error) => {
          console.error('Login error:', error); // Log the error
          toast.error('Something went wrong.');
        });
    });
  });

  return (
    <CardWrapper
      headerTitle="Login"
      headerDescription="Welcome back! Please fill out the form below before logging in to the website."
      // showSocial
    >
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <FormInput
              control={form.control}
              name="staff_id"
              label="Staff ID"
              type="number"
              placeholder="Enter your staff ID"
              isPending={isPending}
            />
            <div>
              <FormInput
                control={form.control}
                name="password"
                label="Password"
                type="password"
                placeholder="******"
                isPending={isPending}
              />
              <Button
                size="sm"
                variant="link"
                className="-mt-6 w-full justify-end p-0 text-xs text-blue-500"
                asChild
              >
                <Link href="/reset">Forgot password?</Link>
              </Button>
            </div>
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            Login
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

// Update the loginSchema to validate staff_id
