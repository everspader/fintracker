import {
  pgTable,
  uuid,
  text,
  timestamp,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { accounts } from "./accounts";
import { currencies } from "./currencies";
import { groups, categories } from "./groups";
import { workspaces } from "./workspaces";

// Enums
export const transactionTypeEnum = pgEnum("transaction_type", [
  "expense",
  "income",
]);

// Main Transaction Log Table
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  entryDate: timestamp("entry_date").notNull().defaultNow(),
  type: transactionTypeEnum("type").notNull(),
  categoryId: uuid("category_id").references(() => categories.id),
  accountId: uuid("account_id").references(() => accounts.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currencyId: uuid("currency_id").references(() => currencies.id),
  description: text("description"),
  groupId: uuid("group_id").references(() => groups.id),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
  currency: one(currencies, {
    fields: [transactions.currencyId],
    references: [currencies.id],
  }),
  group: one(groups, {
    fields: [transactions.groupId],
    references: [groups.id],
  }),
  workspace: one(workspaces, {
    fields: [transactions.workspaceId],
    references: [workspaces.id],
  }),
}));
