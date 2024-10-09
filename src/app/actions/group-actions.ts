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
    const existingGroup = await db
      .select()
      .from(groups)
      .where(eq(groups.name, groupName))
      .limit(1);

    if (existingGroup.length > 0) {
      return { success: false, error: "A group with this name already exists" };
    }

    return await db.transaction(async (tx) => {
      const [insertedGroup] = await tx
        .insert(groups)
        .values({ name: groupName })
        .returning();

      if (categoryNames.length > 0) {
        await tx
          .insert(categories)
          .values(
            categoryNames.map((name) => ({ name, groupId: insertedGroup.id }))
          );
      }

      return { success: true, groupId: insertedGroup.id };
    });
  } catch (error) {
    console.error("Failed to create group:", error);
    return { success: false, error: "Failed to create group" };
  }
}

export async function updateGroup(
  groupId: string,
  groupName: string,
  categoryNames: string[]
): Promise<GroupResult> {
  try {
    const existingGroup = await db
      .select()
      .from(groups)
      .where(eq(groups.name, groupName))
      .where(eq(groups.id, groupId).not())
      .limit(1);

    if (existingGroup.length > 0) {
      return { success: false, error: "A group with this name already exists" };
    }

    return await db.transaction(async (tx) => {
      await tx
        .update(groups)
        .set({ name: groupName })
        .where(eq(groups.id, groupId));

      await tx.delete(categories).where(eq(categories.groupId, groupId));

      if (categoryNames.length > 0) {
        await tx
          .insert(categories)
          .values(categoryNames.map((name) => ({ name, groupId })));
      }

      return { success: true, groupId };
    });
  } catch (error) {
    console.error("Failed to update group:", error);
    return { success: false, error: "Failed to update group" };
  }
}

export async function deleteGroup(groupId: string): Promise<GroupResult> {
  try {
    await db.transaction(async (tx) => {
      await tx.delete(categories).where(eq(categories.groupId, groupId));
      await tx.delete(groups).where(eq(groups.id, groupId));
    });
    return { success: true, groupId };
  } catch (error) {
    console.error("Failed to delete group:", error);
    return { success: false, error: "Failed to delete group" };
  }
}
