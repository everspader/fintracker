"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import { db } from "@/db";
import { users } from "@/db/schema";
import { RegisterSchema } from "@/schemas";
import { getUserByEmail } from "@/db/queries";
import { generateVerificationToken } from "@/db/queries";

export const signUp = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { email, password, name } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "Email already in use" };
  }

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
