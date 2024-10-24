import {
  pgTable,
  uuid,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { workspaces } from "./workspaces";
import { transactions } from "./transactions";
import { accountCurrencies } from "./accounts";

export const currencies = pgTable(
  "currencies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      codeWorkspaceUnique: uniqueIndex("code_workspace_unique").on(
        table.code,
        table.workspaceId
      ),
    };
  }
);

export const currenciesRelations = relations(currencies, ({ many, one }) => ({
  workspace: one(workspaces, {
    fields: [currencies.workspaceId],
    references: [workspaces.id],
  }),
  transactions: many(transactions),
  accountCurrencies: many(accountCurrencies),
}));
