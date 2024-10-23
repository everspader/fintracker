import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { verificationTokens } from "@/db/schema";

export async function getUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });
}

export async function getUserById(id: string) {
  return db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, id),
  });
}

export const getVerificationTokenByEmail = async (email: string) => {
  try {
    const verificationToken = await db.query.verificationTokens.findFirst({
      where: eq(verificationTokens.email, email),
    });
    return verificationToken;
  } catch (error) {
    console.error(error);
  }
};

export const getVerificationTokenByToken = async (token: string) => {
  try {
    const verificationToken = await db.query.verificationTokens.findFirst({
      where: eq(verificationTokens.token, token),
    });
    return verificationToken;
  } catch (error) {
    console.error(error);
  }
};

export const generateVerificationToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000); // expires in one hour

  const existingToken = await getVerificationTokenByEmail(email);

  if (existingToken) {
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.id, existingToken.id));
  }

  const [verificationToken] = await db
    .insert(verificationTokens)
    .values({
      email,
      token,
      expires,
    })
    .returning();

  return verificationToken;
};
