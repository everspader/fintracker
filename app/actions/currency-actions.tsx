"use server";

import { db } from "@/db/db";
import { currencies } from "@/db/schema";
import { eq } from "drizzle-orm";

export type Currency = {
  id: string;
  code: string;
  name: string;
};

export async function getCurrencies(): Promise<Currency[]> {
  try {
    return await db.select().from(currencies);
  } catch (error) {
    console.error("Failed to fetch currencies:", error);
    throw new Error("Failed to fetch currencies");
  }
}

export async function addCurrency(
  currency: Omit<Currency, "id">
): Promise<Currency> {
  try {
    const [insertedCurrency] = await db
      .insert(currencies)
      .values(currency)
      .returning();
    return insertedCurrency;
  } catch (error) {
    console.error("Failed to add currency:", error);
    throw new Error("Failed to add currency");
  }
}

export async function updateCurrency(currency: Currency): Promise<Currency> {
  try {
    const [updatedCurrency] = await db
      .update(currencies)
      .set(currency)
      .where(eq(currencies.id, currency.id))
      .returning();
    return updatedCurrency;
  } catch (error) {
    console.error("Failed to update currency:", error);
    throw new Error("Failed to update currency");
  }
}

export async function deleteCurrency(id: string): Promise<void> {
  try {
    await db.delete(currencies).where(eq(currencies.id, id));
  } catch (error) {
    console.error("Failed to delete currency:", error);
    throw new Error("Failed to delete currency");
  }
}
