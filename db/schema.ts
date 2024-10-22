import {
  pgTable,
  uuid,
  text,
  timestamp,
  decimal,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const transactionTypeEnum = pgEnum("transaction_type", [
  "expense",
  "income",
]);
export const accountTypeEnum = pgEnum("account_type", [
  "credit",
  "debit",
  "investment",
]);

export type AccountType = (typeof accountTypeEnum.enumValues)[number];

// Helper Tables
export const groups = pgTable("groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  type: accountTypeEnum("type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const currencies = pgTable("currencies", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
});

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
  groupId: uuid("group_id").references(() => groups.id), // Remove .notNull()
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const accountCurrencies = pgTable(
  "account_currencies",
  {
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id),
    currencyId: uuid("currency_id")
      .notNull()
      .references(() => currencies.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.accountId, table.currencyId] }),
  })
);

// Relations
export const groupsRelations = relations(groups, ({ many }) => ({
  categories: many(categories),
}));

export const categoriesRelations = relations(categories, ({ one }) => ({
  group: one(groups, {
    fields: [categories.groupId],
    references: [groups.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ many }) => ({
  currencies: many(accountCurrencies),
  transactions: many(transactions),
}));

export const currenciesRelations = relations(currencies, ({ many }) => ({
  accounts: many(accountCurrencies),
  transactions: many(transactions),
}));

export const accountCurrenciesRelations = relations(
  accountCurrencies,
  ({ one }) => ({
    account: one(accounts, {
      fields: [accountCurrencies.accountId],
      references: [accounts.id],
    }),
    currency: one(currencies, {
      fields: [accountCurrencies.currencyId],
      references: [currencies.id],
    }),
  })
);

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
}));

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").unique().notNull(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires").notNull(),
});
