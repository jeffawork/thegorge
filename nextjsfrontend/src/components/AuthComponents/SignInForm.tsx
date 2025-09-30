'use client';
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormItem, FormField, FormLabel, FormControl } from '../ui/form';
import { Input } from '../ui/input';
import { useForm } from 'react-hook-form';
import { signInformSchema } from '@/lib/utils';
const SignInForm = () => {
  const form = useForm({
    mode: 'onChange',
    resolver: zodResolver(signInformSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: any) => {
    // handle sign in
    console.log(data);
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    variant="password"
                    type="password"
                    placeholder="password"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};

export default SignInForm;
