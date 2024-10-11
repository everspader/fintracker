"use server";

import { db } from "@/db/db";
import { accounts, accountCurrencies } from "@/db/schema";
import { eq } from "drizzle-orm";

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

    return accountsData.map((account) => ({
      ...account,
      currencyIds: accountCurrenciesData
        .filter((ac) => ac.accountId === account.id)
        .map((ac) => ac.currencyId),
    }));
  } catch (error) {
    console.error("Failed to fetch accounts:", error);
    throw new Error("Failed to fetch accounts");
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
    console.error("Failed to add account:", error);
    throw error;
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
    throw error;
  }
}

export async function deleteAccount(id: string): Promise<void> {
  try {
    // await db
    //   .delete(accountCurrencies)
    //   .where(eq(accountCurrencies.accountId, id));
    await db.delete(accounts).where(eq(accounts.id, id));
  } catch (error) {
    console.error("Failed to delete account:", error);
    throw new Error("Failed to delete account");
  }
}
