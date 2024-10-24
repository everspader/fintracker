import { pgTable, pgEnum, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { accounts } from "./accounts";
import { currencies } from "./currencies";
import { groups } from "./groups";
import { transactions } from "./transactions";
import { users } from "./users";

export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const workspaceRole = pgEnum("workspace_role", ["owner"]);

export const userWorkspaces = pgTable("user_workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id),
  role: workspaceRole("role").notNull().default("owner"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  userWorkspaces: many(userWorkspaces),
  transactions: many(transactions),
  groups: many(groups),
  accounts: many(accounts),
  currencies: many(currencies), // Add this line
}));

export const userWorkspacesRelations = relations(userWorkspaces, ({ one }) => ({
  user: one(users, {
    fields: [userWorkspaces.userId],
    references: [users.id],
  }),
  workspace: one(workspaces, {
    fields: [userWorkspaces.workspaceId],
    references: [workspaces.id],
  }),
}));
