import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { currencies } from "./currencies";
import { transactions } from "./transactions";

export const accountTypeEnum = pgEnum("account_type", [
  "credit",
  "debit",
  "investment",
]);

export type AccountType = (typeof accountTypeEnum.enumValues)[number];

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  type: accountTypeEnum("type").notNull(),
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
