import type { InferInsertModel } from "drizzle-orm";
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export type User = InferInsertModel<typeof users>;
export const users = pgTable("users", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    username: varchar({ length: 255 }).notNull(),
});
