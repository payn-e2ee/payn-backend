import type { InferInsertModel } from "drizzle-orm";
import { pgTable, uuid, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export type User = InferInsertModel<typeof users>;
export const users = pgTable("users", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    username: varchar({ length: 255 }).notNull(),
    firstname: varchar(),
    lastname: varchar(),
    password: varchar().notNull(),
    phone_number: integer().notNull(),
    is_verified: boolean().default(false),
    created_at: timestamp(),
});
