"use client";

import * as z from "zod";
import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/ui/icons";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { SignInSchema, SignUpSchema } from "@/lib/schemas";

interface AuthFormProps {
  type: "signin" | "signup";
  action: (values: any) => Promise<{ error?: string; success?: string }>;
}

export function AuthForm({ type, action }: AuthFormProps) {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const schema = type === "signin" ? SignInSchema : SignUpSchema;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      ...(type === "signup" ? { name: "" } : {}),
    },
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      action(values).then((data) => {
        setError(data.error);
        setSuccess(data.success);
      });
    });
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gray-900 p-12 text-white">
        <div className="flex items-center space-x-2">
          <Icons.creditCard className="h-8 w-8" />
          <Link href="/">
            <span className="text-2xl font-bold">FinanceTrack</span>
          </Link>
        </div>
        <div>
          <blockquote className="text-xl italic">
            &quot;This app has saved me countless hours of work and helped me
            manage my finances better than ever before.&quot;
          </blockquote>
          <p className="mt-4 font-semibold">Sofia Davis</p>
        </div>
      </div>
      <div className="flex flex-col justify-center w-full lg:w-1/2 p-8">
        <div className="max-w-sm mx-auto w-full">
          <Card className="w-[350px]">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">
                {type === "signin" ? "Sign In" : "Create an Account"}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  {type === "signup" && (
                    <div className="grid gap-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="John Doe"
                                disabled={isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <div className="grid gap-2 mt-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="john.doe@example.com"
                              type="email"
                              disabled={isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-2 mt-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder="******"
                              disabled={isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormError message={error} />
                  <FormSuccess message={success} />

                  {type === "signin" && (
                    <Button
                      variant="link"
                      className="px-0 text-sm text-muted-foreground"
                    >
                      <Link href="/forgot-password">Forgot your password?</Link>
                    </Button>
                  )}

                  <Button
                    className="w-full mt-6"
                    type="submit"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    ) : type === "signin" ? (
                      "Sign In"
                    ) : (
                      "Create Account"
                    )}
                  </Button>

                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    {type === "signin"
                      ? "Don't have an account? "
                      : "Already have an account? "}
                    <Link
                      href={type === "signin" ? "/auth/signup" : "/auth/signin"}
                      className="underline underline-offset-4 hover:text-primary"
                    >
                      {type === "signin" ? "Sign up" : "Sign in"}
                    </Link>
                  </p>
                </form>
              </Form>
            </CardContent>

            {type === "signup" && (
              <CardFooter>
                <p className="px-8 text-center text-sm text-muted-foreground">
                  By clicking continue, you agree to our{" "}
                  <Link
                    href="/terms"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
