"use server";

import { db } from "@/db/db";
import { groups, categories } from "@/db/schema";
import { eq } from "drizzle-orm";

type GroupResult =
  | { success: true; groupId: string }
  | { success: false; error: string };

export async function getGroups() {
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

export async function createGroup(
  groupName: string,
  categoryNames: string[]
): Promise<GroupResult> {
  try {
    if (!groupName.trim()) {
      return { success: false, error: "Group name cannot be empty" };
    }
    if (categoryNames.length === 0) {
      return { success: false, error: "At least one category must be added" };
    }

    const existingGroup = await db
      .select()
      .from(groups)
      .where(eq(groups.name, groupName))
      .limit(1);

    if (existingGroup.length > 0) {
      return { success: false, error: "A group with this name already exists" };
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

    return { success: true, groupId: insertedGroup.id };
  } catch (error) {
    console.error("Failed to create group:", error);
    return { success: false, error: "Failed to create group" };
  }
}

export async function updateGroup(
  groupId: string,
  groupName: string,
  categoryNames: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!groupName.trim()) {
      return { success: false, error: "Group name cannot be empty" };
    }
    if (categoryNames.length === 0) {
      return { success: false, error: "At least one category must be added" };
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

    return { success: true };
  } catch (error) {
    console.error("Failed to update group:", error);
    return { success: false, error: "Failed to update group" };
  }
}

export async function deleteGroup(groupId: string): Promise<GroupResult> {
  try {
    await db.delete(categories).where(eq(categories.groupId, groupId));
    await db.delete(groups).where(eq(groups.id, groupId));
    return { success: true, groupId };
  } catch (error) {
    console.error("Failed to delete group:", error);
    return { success: false, error: "Failed to delete group" };
  }
}
