"use server";

import { AuthError } from "next-auth";
import * as z from "zod";
import bcrypt from "bcryptjs";

import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { db } from "@/db";
import { users } from "@/db/schema";
import { SignUpSchema, SignInSchema } from "@/schemas";
import { getUserByEmail } from "@/db/queries";
import { generateVerificationToken } from "@/db/queries";

import { redirect } from "next/navigation";

export const signUp = async (values: z.infer<typeof SignUpSchema>) => {
  const validatedFields = SignUpSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { email, password, name } = validatedFields.data;
  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "Email already in use" };
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    email,
    name,
    passwordHash: hashedPassword,
  });

  const verificationToken = await generateVerificationToken(email);
  console.log(verificationToken);
  // TODO: Send verification token email

  return { success: "Confirmation e-mail sent!" };
};

export const login = async (values: z.infer<typeof SignInSchema>) => {
  const validatedFields = SignInSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { email, password } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.passwordHash) {
    return { error: "User does not exist" };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
    redirect("/dashboard");
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin": {
          return { error: "Invalid credentials!" };
        }
        default:
          return { error: "Something went wrong" };
      }
    }

    throw error;
  }
};
