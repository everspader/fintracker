"use server";

import { db } from "@/db/db";
import {
  transactions,
  categories,
  accounts,
  currencies,
  transactionTags,
  tags,
  groups,
} from "@/db/schema";
import { Transaction } from "@/components/transactions/columns";
import { eq, inArray } from "drizzle-orm";

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
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .leftJoin(accounts, eq(transactions.accountId, accounts.id))
      .leftJoin(currencies, eq(transactions.currencyId, currencies.id))
      .leftJoin(groups, eq(transactions.groupId, groups.id));

    const transactionIds = result.map((row) => row.id);
    const tagsResult = await db
      .select({
        transactionId: transactionTags.transactionId,
        tagName: tags.name,
      })
      .from(transactionTags)
      .leftJoin(tags, eq(transactionTags.tagId, tags.id))
      .where(inArray(transactionTags.transactionId, transactionIds));

    const tagMap = tagsResult.reduce((acc, { transactionId, tagName }) => {
      if (!acc[transactionId]) acc[transactionId] = [];
      if (tagName) acc[transactionId].push(tagName);
      return acc;
    }, {} as Record<string, string[]>);

    return result.map((row) => ({
      id: row.id,
      entryDate: row.entryDate?.toISOString().split("T")[0] ?? "",
      type: row.type ?? "",
      category: row.categoryName ?? "",
      account: row.accountName ?? "",
      currency: row.currencyCode ?? "",
      amount: row.amount ? parseFloat(row.amount.toString()) : 0,
      description: row.description ?? "",
      tags: tagMap[row.id] ?? [],
      group: row.groupName ?? "",
    }));
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    throw new Error("Failed to fetch transactions");
  }
}

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

export async function addTransaction(transactionData: Omit<Transaction, "id">) {
  try {
    const { tags: tagNames, ...transactionFields } = transactionData;

    // Insert the transaction
    const [insertedTransaction] = await db
      .insert(transactions)
      .values(transactionFields)
      .returning();

    // Handle tags
    if (tagNames && tagNames.length > 0) {
      for (const tagName of tagNames) {
        // Find or create the tag
        let [tag] = await db.select().from(tags).where(eq(tags.name, tagName));
        if (!tag) {
          [tag] = await db.insert(tags).values({ name: tagName }).returning();
        }

        // Create the transaction-tag association
        await db.insert(transactionTags).values({
          transactionId: insertedTransaction.id,
          tagId: tag.id,
        });
      }
    }

    return insertedTransaction;
  } catch (error) {
    console.error("Failed to add transaction:", error);
    throw new Error("Failed to add transaction");
  }
}

export async function deleteTransactions(ids: string[]) {
  try {
    // First, delete associated tags
    await db
      .delete(transactionTags)
      .where(inArray(transactionTags.transactionId, ids));

    // Then delete the transactions
    await db.delete(transactions).where(inArray(transactions.id, ids));
  } catch (error) {
    console.error("Failed to delete transactions:", error);
    throw new Error("Failed to delete transactions");
  }
}
