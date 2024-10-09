"use server";

import { db } from "@/db/db";
import { groups, categories } from "@/db/schema";
import { eq } from "drizzle-orm";

type CreateGroupResult =
  | { success: true; groupId: string }
  | { success: false; error: string };

export async function createGroup(
  groupName: string,
  categoryNames: string[]
): Promise<CreateGroupResult> {
  try {
    // Check if the group already exists
    const existingGroup = await db
      .select()
      .from(groups)
      .where(eq(groups.name, groupName))
      .limit(1);

    if (existingGroup.length > 0) {
      return { success: false, error: "A group with this name already exists" };
    }

    // Start a transaction
    return await db.transaction(async (tx) => {
      // Insert the group
      const [insertedGroup] = await tx
        .insert(groups)
        .values({ name: groupName })
        .returning();

      // Insert categories
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

    // Check if the error is due to a unique constraint violation
    if (
      error instanceof Error &&
      error.message.includes("duplicate key value violates unique constraint")
    ) {
      return { success: false, error: "A group with this name already exists" };
    }

    return { success: false, error: "Failed to create group" };
  }
}
