"use server";

import { db } from "@/db/db";
import { groups, categories } from "@/db/schema";

type CreateGroupResult =
  | { success: true; groupId: string }
  | { success: false; error: string };

export async function createGroup(
  groupName: string,
  categoryNames: string[]
): Promise<CreateGroupResult> {
  try {
    // Start a transaction
    const result = await db.transaction(async (tx) => {
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

      return { success: true, groupId: insertedGroup.id } as const;
    });

    return result;
  } catch (error) {
    console.error("Failed to create group:", error);
    return { success: false, error: "Failed to create group" };
  }
}
