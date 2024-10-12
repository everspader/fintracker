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
    throw new Error(`Failed to get currency ${error}`);
  }
}

export async function addCurrency(
  currency: Omit<Currency, "id">
): Promise<Currency> {
  try {
    if (!currency.code.trim()) {
      throw new Error("Currency code cannot be empty");
    }

    const upperCaseCode = currency.code.toUpperCase();
    const existingCurrency = await db
      .select()
      .from(currencies)
      .where(eq(currencies.code, upperCaseCode));

    if (existingCurrency.length > 0) {
      throw new Error(`Currency with code ${upperCaseCode} already exists`);
    }

    const [insertedCurrency] = await db
      .insert(currencies)
      .values({
        ...currency,
        code: upperCaseCode,
      })
      .returning();
    return insertedCurrency;
  } catch (error) {
    console.error("Failed to add currency:", error);
    throw new Error(`Failed to add currency ${error}`);
  }
}

export async function updateCurrency(currency: Currency): Promise<Currency> {
  try {
    if (!currency.code.trim()) {
      throw new Error("Currency code cannot be empty");
    }

    const upperCaseCode = currency.code.toUpperCase();
    const existingCurrency = await db
      .select()
      .from(currencies)
      .where(eq(currencies.code, upperCaseCode));

    if (existingCurrency.length > 0 && existingCurrency[0].id !== currency.id) {
      throw new Error(`Currency with code ${upperCaseCode} already exists`);
    }

    const [updatedCurrency] = await db
      .update(currencies)
      .set({
        ...currency,
        code: upperCaseCode,
      })
      .where(eq(currencies.id, currency.id))
      .returning();
    return updatedCurrency;
  } catch (error) {
    console.error("Failed to update currency:", error);
    throw new Error(`Failed to update currency ${error}`);
  }
}

export async function deleteCurrency(id: string): Promise<void> {
  try {
    await db.delete(currencies).where(eq(currencies.id, id));
  } catch (error) {
    console.error("Failed to delete currency:", error);
    throw new Error(`Failed to delete currency ${error}`);
  }
}
