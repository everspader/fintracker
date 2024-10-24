import { pgTable, uuid, text } from "drizzle-orm/pg-core";

export const currencies = pgTable("currencies", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
});
