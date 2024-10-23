"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { users, NewUser } from "@/db/schema";
import { signUpSchema } from "@/schemas";
import { getUserByEmail } from "@/db/queries";
import { generateVerificationToken } from "@/db/queries";
import { validatedAction } from "@/lib/auth/middleware";
import { hashPassword } from "@/lib/auth/session";
import { redirect } from "next/navigation";

// export const signUp = async (values: z.infer<typeof RegisterSchema>) => {
//   const validatedFields = RegisterSchema.safeParse(values);

//   if (!validatedFields.success) {
//     return { error: "Invalid fields" };
//   }

//   const { email, password, name } = validatedFields.data;
//   const hashedPassword = await bcrypt.hash(password, 10);

//   const existingUser = await getUserByEmail(email);

//   if (existingUser) {
//     return { error: "Email already in use" };
//   }

//   await db.insert(users).values({
//     email,
//     name,
//     passwordHash: hashedPassword,
//   });

// const verificationToken = await generateVerificationToken(email);
//   console.log(verificationToken);
//   // TODO: Send verification token email

//   return { success: "Confirmation e-mail sent!" };
// };

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password, name } = data;

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return { error: "Failed to create user. Please try again." };
  }

  const passwordHash = await hashPassword(password);

  const newUser: NewUser = {
    name,
    email,
    passwordHash,
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();

  const verificationToken = await generateVerificationToken(email);
  console.log(verificationToken);

  if (!createdUser) {
    return { error: "Failed to create user. Please try again." };
  }

  // Create a new group if there's no invitation
  // await logActivity(groupId, createdUser.id, ActivityType.CREATE_TEAM);

  // await Promise.all([
  //   logActivity(groupId, createdUser.id, ActivityType.SIGN_UP),
  //   setSession(createdUser),
  // ]);

  redirect("/dashboard");
});
