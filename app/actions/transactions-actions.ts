"use server";

import { db } from "@/db/db";
import {
  transactions,
  categories,
  accounts,
  currencies,
  groups,
} from "@/db/schema";
import { Transaction } from "@/components/transactions/columns";
import { eq, inArray, sql } from "drizzle-orm";

export async function getGroups() {
  try {
    return await db.select().from(groups);
  } catch (error) {
    console.error("Failed to fetch groups:", error);
    throw new Error("Failed to fetch groups");
  }
}

export async function getCategories() {
  try {
    return await db.select().from(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw new Error("Failed to fetch categories");
  }
}

export async function getAccounts() {
  try {
    return await db.select().from(accounts);
  } catch (error) {
    console.error("Failed to fetch accounts:", error);
    throw new Error("Failed to fetch accounts");
  }
}

export async function getCurrencies() {
  try {
    return await db.select().from(currencies);
  } catch (error) {
    console.error("Failed to fetch currencies:", error);
    throw new Error("Failed to fetch currencies");
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const result = await db
      .select({
        id: transactions.id,
        entryDate: transactions.entryDate,
        type: transactions.type,
        categoryId: transactions.categoryId,
        accountId: transactions.accountId,
        currencyId: transactions.currencyId,
        amount: transactions.amount,
        description: transactions.description,
        categoryName: categories.name,
        accountName: accounts.name,
        currencyCode: currencies.code,
        groupName: groups.name,
        groupId: transactions.groupId,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .leftJoin(accounts, eq(transactions.accountId, accounts.id))
      .leftJoin(currencies, eq(transactions.currencyId, currencies.id))
      .leftJoin(groups, eq(transactions.groupId, groups.id));

    return result.map((row) => ({
      id: row.id,
      entryDate: row.entryDate?.toISOString().split("T")[0] ?? "",
      type: row.type ?? "expense",
      category: row.categoryName ?? "",
      account: row.accountName ?? "",
      currency: row.currencyCode ?? "",
      amount: row.amount ? parseFloat(row.amount.toString()) : 0,
      description: row.description ?? "",
      group: row.groupName ?? "",
      groupId: row.groupId ?? "",
      categoryId: row.categoryId ?? "",
      accountId: row.accountId ?? "",
      currencyId: row.currencyId ?? "",
    }));
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    throw new Error("Failed to fetch transactions");
  }
}

export async function addTransaction(
  transactionData: Omit<
    Transaction,
    "id" | "category" | "account" | "currency" | "group"
  >
) {
  try {
    const [insertedTransaction] = await db
      .insert(transactions)
      .values({
        entryDate: new Date(transactionData.entryDate),
        type: transactionData.type,
        categoryId: transactionData.categoryId,
        accountId: transactionData.accountId,
        amount: sql`${transactionData.amount}::decimal(10,2)`, // Convert to decimal
        currencyId: transactionData.currencyId,
        description: transactionData.description,
        groupId: transactionData.groupId,
      })
      .returning();

    return insertedTransaction;
  } catch (error) {
    console.error("Failed to add transaction:", error);
    throw new Error("Failed to add transaction");
  }
}

export async function deleteTransactions(ids: string[]) {
  try {
    await db.delete(transactions).where(inArray(transactions.id, ids));
  } catch (error) {
    console.error("Failed to delete transactions:", error);
    throw new Error("Failed to delete transactions");
  }
}