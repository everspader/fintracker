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
