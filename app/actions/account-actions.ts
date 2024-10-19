"use server";

import { db } from "@/db/db";
import { accounts, accountCurrencies, transactions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export type Account = {
  id: string;
  name: string;
  type: "credit" | "debit" | "investment";
  currencyIds: string[];
};

export async function getAccounts(): Promise<Account[]> {
  try {
    const accountsData = await db.select().from(accounts);
    const accountCurrenciesData = await db.select().from(accountCurrencies);

    const accountsWithCurrencies = accountsData.map((account) => ({
      ...account,
      currencyIds: accountCurrenciesData
        .filter((ac) => ac.accountId === account.id)
        .map((ac) => ac.currencyId),
    }));

    // Sort accounts by name
    return accountsWithCurrencies.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Failed to fetch accounts:", error);
    throw new Error(`Failed to fetch accounts: ${error}`);
  }
}

export async function addAccount(
  account: Omit<Account, "id">
): Promise<Account> {
  try {
    if (!account.name.trim()) {
      throw new Error("Account name cannot be empty");
    }
    if (account.currencyIds.length === 0) {
      throw new Error("At least one currency must be selected");
    }

    const [insertedAccount] = await db
      .insert(accounts)
      .values({
        name: account.name,
        type: account.type,
      })
      .returning();

    await db.insert(accountCurrencies).values(
      account.currencyIds.map((currencyId) => ({
        accountId: insertedAccount.id,
        currencyId,
      }))
    );

    return { ...insertedAccount, currencyIds: account.currencyIds };
  } catch (error) {
    let errorMessage = "Failed to add account:";
    if (
      error instanceof Error &&
      error.message.includes("accounts_name_unique")
    ) {
      errorMessage += " Account name must be unique";
    }
    console.error(errorMessage, error);
    throw new Error(errorMessage);
  }
}

export async function updateAccount(account: Account): Promise<Account> {
  try {
    if (!account.name.trim()) {
      throw new Error("Account name cannot be empty");
    }
    if (account.currencyIds.length === 0) {
      throw new Error("At least one currency must be selected");
    }

    const [updatedAccount] = await db
      .update(accounts)
      .set({ name: account.name, type: account.type })
      .where(eq(accounts.id, account.id))
      .returning();

    await db
      .delete(accountCurrencies)
      .where(eq(accountCurrencies.accountId, account.id));
    await db.insert(accountCurrencies).values(
      account.currencyIds.map((currencyId) => ({
        accountId: account.id,
        currencyId,
      }))
    );

    return { ...updatedAccount, currencyIds: account.currencyIds };
  } catch (error) {
    console.error("Failed to update account:", error);
    throw new Error(`Failed to update account: ${error}`);
  }
}

export async function getAccountTransactionCount(
  accountId: string
): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(eq(transactions.accountId, accountId));
  return result[0].count;
}

export async function deleteAccount(accountId: string): Promise<void> {
  try {
    await db.delete(transactions).where(eq(transactions.accountId, accountId));

    await db
      .delete(accountCurrencies)
      .where(eq(accountCurrencies.accountId, accountId));

    await db.delete(accounts).where(eq(accounts.id, accountId));
  } catch (error) {
    console.error("Failed to delete account:", error);
    throw new Error(`Failed to delete account: ${error}`);
  }
}
