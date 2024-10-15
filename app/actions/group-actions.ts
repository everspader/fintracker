"use server";

import { db } from "@/db/db";
import { groups, categories } from "@/db/schema";
import { eq } from "drizzle-orm";

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
        categories: groupCategories.map((c) => c.name),
      };
    })
  );
  return groupsWithCategories;
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

    // Delete existing categories
    await db.delete(categories).where(eq(categories.groupId, groupId));

    // Insert new categories
    await db
      .insert(categories)
      .values(categoryNames.map((name) => ({ name, groupId })));
  } catch (error) {
    console.error("Failed to update group:", error);
    throw new Error(`Failed to update group ${error}`);
  }
}

export async function deleteGroup(groupId: string): Promise<void> {
  try {
    await db.delete(categories).where(eq(categories.groupId, groupId));
    await db.delete(groups).where(eq(groups.id, groupId));
  } catch (error) {
    console.error("Failed to delete group:", error);
    throw new Error("Failed to delete group: " + error);
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
