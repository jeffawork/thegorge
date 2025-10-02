'use client';
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { useForm } from 'react-hook-form';
import { signInformSchema } from '@/lib/utils';
import { Button } from '../ui/button';
import z from 'zod';
import Link from 'next/dist/client/link';
import { useLogin } from '@/hooks/useAuth';
import { Spinner } from '../ui/spinner';
import { Mail } from 'lucide-react';

const ForgotPasswordForm = () => {
  const { mutate: login, isPending } = useLogin();

  const form = useForm<z.infer<typeof signInformSchema>>({
    mode: 'onChange',
    resolver: zodResolver(signInformSchema),
    defaultValues: {
      email: '',
    },
  });
  const {
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = (data: loginCredentials) => {
    login(data);
  };

  return (
    <section>
      <div>
        <div className="mb-2">
          <h1 className="text-gradient mb-2 text-center text-3xl font-bold">
            Forgot Password
          </h1>
          <p className="text-center font-medium text-primary-foreground/45">
            Enter your email for the verification process, we will send a
            4-digit code to your email.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <div>
                    <div className="mb-1">
                      <FormLabel className="text-primary-foreground/45">
                        Email
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Input
                        icon={<Mail className="h-5 w-5" />}
                        type="email"
                        placeholder="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="mt-2" />
                  </div>
                )}
              />
            </div>
            <Button
              className="mt-2 block w-full cursor-pointer"
              disabled={isPending}
            >
              {isPending ? <Spinner className="h-4 w-4" /> : 'Enter'}
            </Button>
          </form>
        </Form>
        <footer className="mt-3 flex justify-center gap-1">
          <Link
            className="hover:text-gradient cursor-pointer text-sm font-medium text-primary-foreground"
            href="/sign-in"
          >
            Go back
          </Link>
        </footer>
      </div>
    </section>
  );
};

export default ForgotPasswordForm;
