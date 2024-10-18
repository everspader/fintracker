"use server";

import { db } from "@/db/db";
import { groups, categories, transactions } from "@/db/schema";
import { eq, sql, and, isNull } from "drizzle-orm";

export interface Group {
  id: string;
  name: string;
  categories: string[];
}

export async function getGroups(): Promise<Group[]> {
  const groupsData = await db.select().from(groups);
  const groupsWithCategories = await Promise.all(
    groupsData.map(async (group) => {
      const groupCategories = await db
        .select()
        .from(categories)
        .where(eq(categories.groupId, group.id));
      return {
        ...group,
        categories: groupCategories
          .map((c) => c.name)
          .sort((a, b) => a.localeCompare(b)),
      };
    })
  );
  return groupsWithCategories.sort((a, b) => a.name.localeCompare(b.name));
}

export async function addGroup(
  groupName: string,
  categoryNames: string[]
): Promise<void> {
  try {
    if (!groupName.trim()) {
      throw new Error("Group name cannot be empty");
    }
    if (categoryNames.length === 0) {
      throw new Error("At least one category must be added");
    }

    const existingGroup = await db
      .select()
      .from(groups)
      .where(eq(groups.name, groupName))
      .limit(1);

    if (existingGroup.length > 0) {
      throw new Error("Group with the same name already exists");
    }

    const [insertedGroup] = await db
      .insert(groups)
      .values({ name: groupName })
      .returning();

    await db
      .insert(categories)
      .values(
        categoryNames.map((name) => ({ name, groupId: insertedGroup.id }))
      );
  } catch (error) {
    console.error("Failed to create group:", error);
    throw new Error("Failed to create group: " + error);
  }
}

export async function updateGroup(
  groupId: string,
  groupName: string,
  categoryNames: string[]
): Promise<void> {
  try {
    if (!groupName.trim()) {
      throw new Error("Group name cannot be empty");
    }
    if (categoryNames.length === 0) {
      throw new Error("At least one category must be added");
    }

    // Update group name
    await db
      .update(groups)
      .set({ name: groupName })
      .where(eq(groups.id, groupId));

    // Get existing categories for the group
    const existingCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.groupId, groupId));

    // Determine categories to add, update, and remove
    const existingCategoryNames = existingCategories.map((c) => c.name);
    const categoriesToAdd = categoryNames.filter(
      (name) => !existingCategoryNames.includes(name)
    );
    const categoriesToRemove = existingCategories.filter(
      (c) => !categoryNames.includes(c.name)
    );

    // Add new categories
    if (categoriesToAdd.length > 0) {
      await db
        .insert(categories)
        .values(categoriesToAdd.map((name) => ({ name, groupId })));
    }

    // Remove categories that are no longer needed and not referenced by transactions
    for (const categoryToRemove of categoriesToRemove) {
      const transactionsUsingCategory = await db
        .select()
        .from(transactions)
        .where(eq(transactions.categoryId, categoryToRemove.id))
        .limit(1);

      if (transactionsUsingCategory.length === 0) {
        await db
          .delete(categories)
          .where(eq(categories.id, categoryToRemove.id));
      }
    }
  } catch (error) {
    console.error("Failed to update group:", error);
    throw new Error(`Failed to update group: ${error}`);
  }
}

export async function getGroupTransactionCount(
  groupId: string
): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(eq(transactions.groupId, groupId));
  return result[0].count;
}

export async function deleteGroup(
  groupId: string,
  action: "cancel" | "setNull" | "deleteAll"
): Promise<void> {
  const transactionCount = await getGroupTransactionCount(groupId);

  if (transactionCount > 0 && action === "cancel") {
    return;
  }

  try {
    if (action === "setNull") {
      // Update transactions to set groupId and categoryId to null
      await db
        .update(transactions)
        .set({ groupId: null, categoryId: null })
        .where(eq(transactions.groupId, groupId));
    } else if (action === "deleteAll") {
      // Delete all transactions associated with the group
      await db.delete(transactions).where(eq(transactions.groupId, groupId));
    }

    // Delete all categories associated with the group
    await db.delete(categories).where(eq(categories.groupId, groupId));

    // Delete the group
    const deletedGroup = await db
      .delete(groups)
      .where(eq(groups.id, groupId))
      .returning();

    if (deletedGroup.length === 0) {
      throw new Error("Failed to delete group");
    }
  } catch (error) {
    console.error("Failed to delete group:", error);
    throw new Error(`Failed to delete group: ${error}`);
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
