import { db } from "@/lib/db";
import {
  groups,
  categories,
  accounts,
  currencies,
  transactions,
} from "@/lib/db/schema";

async function seed() {
  try {
    // Seed Groups
    const groupIds = await db
      .insert(groups)
      .values([
        { name: "Food & Drinks" },
        { name: "Transportation" },
        { name: "House" },
      ])
      .returning({ id: groups.id });

    // Seed Categories
    const categoryIds = await db
      .insert(categories)
      .values([
        { name: "Groceries", groupId: groupIds[0].id },
        { name: "Restaurants", groupId: groupIds[0].id },
        { name: "Trains", groupId: groupIds[1].id },
        { name: "Car Rental", groupId: groupIds[1].id },
        { name: "Internet", groupId: groupIds[2].id },
        { name: "Rent", groupId: groupIds[2].id },
        { name: "Energy & Gas", groupId: groupIds[2].id },
      ])
      .returning({ id: categories.id });

    // Seed Accounts
    const accountIds = await db
      .insert(accounts)
      .values([
        { name: "Cash", type: "debit" },
        { name: "Amex", type: "credit" },
        { name: "Bunq", type: "debit" },
        { name: "Bunq-savings", type: "debit" },
      ])
      .returning({ id: accounts.id });

    // Seed Currencies
    const currencyIds = await db
      .insert(currencies)
      .values([
        { code: "USD", name: "US Dollar" },
        { code: "EUR", name: "Euro" },
        { code: "BRL", name: "Brazilian Real" },
      ])
      .returning({ id: currencies.id });

    // Seed Transactions
    await db.insert(transactions).values([
      {
        entryDate: new Date(),
        type: "expense",
        categoryId: categoryIds[0].id,
        accountId: accountIds[0].id,
        amount: "100.00",
        currencyId: currencyIds[0].id,
        description: "Transaction description",
        groupId: groupIds[0].id,
        createdAt: new Date(),
      },
      {
        entryDate: new Date("2023-05-15"),
        type: "income",
        categoryId: categoryIds[1].id,
        accountId: accountIds[2].id,
        amount: "2500.00",
        currencyId: currencyIds[1].id,
        description: "Monthly salary",
        groupId: groupIds[1].id,
      },
      {
        entryDate: new Date("2023-05-20"),
        type: "expense",
        categoryId: categoryIds[2].id,
        accountId: accountIds[1].id,
        amount: "50.00",
        currencyId: currencyIds[1].id,
        description: "Groceries",
        groupId: groupIds[2].id,
      },
      {
        entryDate: new Date("2023-05-25"),
        type: "expense",
        categoryId: categoryIds[3].id,
        accountId: accountIds[1].id,
        amount: "30.00",
        currencyId: currencyIds[1].id,
        description: "Internet bill",
        groupId: groupIds[2].id,
      },
      {
        entryDate: new Date("2023-05-28"),
        type: "income",
        categoryId: categoryIds[4].id,
        accountId: accountIds[2].id,
        amount: "500.00",
        currencyId: currencyIds[1].id,
        description: "Transfer to savings",
        groupId: groupIds[0].id,
      },
      {
        entryDate: new Date("2023-06-01"),
        type: "expense",
        categoryId: categoryIds[5].id,
        accountId: accountIds[2].id,
        amount: "800.00",
        currencyId: currencyIds[1].id,
        description: "Rent payment",
        groupId: groupIds[2].id,
      },
    ]);

    console.log("Data seeded successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
}

seed()
  .catch((error) => {
    console.error("Seed process failed:", error);
    process.exit(1);
  })
  .finally(() => {
    console.log("Seed process finished. Exiting...");
    process.exit(0);
  });
