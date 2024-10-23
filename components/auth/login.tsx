"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signUp } from "@/app/actions/auth-actions";
import { signUpSchema } from "@/schemas";

export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: any; // This allows for additional properties
};

export function Login({ mode = "signin" }: { mode?: "signin" | "signup" }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    signUp,
    { error: "" }
  );

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
                {mode === "signin" ? "Sign In" : "Create an Account"}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <form action={formAction}>
                {mode === "signup" && (
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Your Name"
                      autoCapitalize="none"
                      autoComplete="name"
                      autoCorrect="off"
                      maxLength={50}
                      disabled={pending}
                    />
                  </div>
                )}
                <div className="grid gap-2 mt-4">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    maxLength={50}
                    disabled={pending}
                  />
                </div>
                <div className="grid gap-2 mt-4">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    disabled={pending}
                    autoComplete={
                      mode === "signin" ? "current-password" : "new-password"
                    }
                  />
                </div>
                {mode === "signin" && (
                  <Button
                    variant="link"
                    className="px-0 text-sm text-muted-foreground"
                  >
                    <Link href="/forgot-password">Forgot your password?</Link>
                  </Button>
                )}
                {state?.error && (
                  <p className="text-sm text-red-500 mt-2">{state.error}</p>
                )}
                {state?.success && (
                  <p className="text-sm text-green-500 mt-2">{state.success}</p>
                )}
                <Button
                  className="w-full mt-6"
                  type="submit"
                  disabled={pending}
                >
                  {pending ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  ) : mode === "signin" ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </Button>

                {mode === "signin" ? (
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/auth/signup"
                      className="underline underline-offset-4 hover:text-primary"
                    >
                      Sign up
                    </Link>
                  </p>
                ) : (
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                      href="/signin"
                      className="underline underline-offset-4 hover:text-primary"
                    >
                      Sign in
                    </Link>
                  </p>
                )}
              </form>
            </CardContent>
            {mode === "signup" && (
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
