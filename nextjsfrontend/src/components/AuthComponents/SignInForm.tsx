'use client';
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormItem,
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
const SignInForm = () => {
  const form = useForm<z.infer<typeof signInformSchema>>({
    mode: 'onChange',
    resolver: zodResolver(signInformSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const {
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = (data: any) => {
    // handle sign in
    console.log(data);
  };

  return (
    <section>
      <div>
        <div className="mb-2">
          <h1 className="text-gradient mb-2 text-3xl font-bold">
            Welcome to The Gorge
          </h1>
          <p className="font-medium text-primary-foreground/45">
            Sign in to your RPC monitoring dashboard
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
                    <FormLabel className="text-primary-foreground/45">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="mt-2"
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
            <div className="mb-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <div>
                    <FormLabel className="text-primary-foreground/45">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="mt-2"
                        variant="password"
                        type="password"
                        placeholder="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="mt-2" />
                  </div>
                )}
              />
            </div>
            <Link
              href="/forgot-password"
              className="my-3 block cursor-pointer text-sm font-normal leading-6 text-primary-foreground underline"
            >
              Forgot Password?
            </Link>
            <Button className="block w-full cursor-pointer">Sign In</Button>
          </form>
        </Form>
        <footer className="mt-3 flex justify-between gap-1">
          <p className="text-sm font-normal text-primary-foreground/45">
            Don't have an account ?
          </p>
          <Link
            className="cursor-pointer text-sm font-medium text-primary-foreground"
            href="/sign-up"
          >
            Sign Up
          </Link>
        </footer>
      </div>
    </section>
  );
};

export default SignInForm;
