"use server";

import { db } from "@/db/db";
import { accounts } from "@/db/schema";
import { eq } from "drizzle-orm";

export type Account = {
  id: string;
  name: string;
  type: "credit" | "debit" | "investment";
};

export async function getAccounts(): Promise<Account[]> {
  try {
    return await db.select().from(accounts);
  } catch (error) {
    console.error("Failed to fetch accounts:", error);
    throw new Error("Failed to fetch accounts");
  }
}

export async function addAccount(
  account: Omit<Account, "id">
): Promise<Account> {
  try {
    const [insertedAccount] = await db
      .insert(accounts)
      .values(account)
      .returning();
    return insertedAccount;
  } catch (error) {
    console.error("Failed to add account:", error);
    throw new Error("Failed to add account");
  }
}

export async function updateAccount(account: Account): Promise<Account> {
  try {
    const [updatedAccount] = await db
      .update(accounts)
      .set(account)
      .where(eq(accounts.id, account.id))
      .returning();
    return updatedAccount;
  } catch (error) {
    console.error("Failed to update account:", error);
    throw new Error("Failed to update account");
  }
}

export async function deleteAccount(id: string): Promise<void> {
  try {
    await db.delete(accounts).where(eq(accounts.id, id));
  } catch (error) {
    console.error("Failed to delete account:", error);
    throw new Error("Failed to delete account");
  }
}
