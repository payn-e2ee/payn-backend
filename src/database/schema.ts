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

export type Attachments = InferInsertModel<typeof attachments>;
export const attachments = pgTable("attachments", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    bucket: varchar({ length: 255 }).notNull(),
    object_id: varchar({ length: 255 }).notNull(),
    created_at: timestamp().defaultNow(),
});

export type Devices = InferInsertModel<typeof devices>;
export const devices = pgTable("devices", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    user_id: uuid().references(() => users.id),
    identity_key: varchar({ length: 255 }).notNull(),
    created_at: timestamp().defaultNow(),
});

export type Chats = InferInsertModel<typeof chats>;
export const chats = pgTable("chats", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    created_at: timestamp().defaultNow(),
});

export type Messages = InferInsertModel<typeof messages>;
export const messages = pgTable("messages", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    chat_id: uuid().references(() => chats.id),
    encrypted_content: varchar({ length: 255 }).notNull(),
    tag: varchar({ length: 255 }).notNull(),
    type: varchar({ length: 255 }).notNull(),
    status: varchar({ length: 255 }).notNull(),
    attachment_id: varchar({ length: 255 }).notNull(),
    created_at: timestamp().defaultNow(),
});

export type DeviceMessages = InferInsertModel<typeof device_messages>;
export const device_messages = pgTable("device_messages", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    message_id: uuid().references(() => messages.id),
    device_id: uuid().references(() => devices.id),
    created_at: timestamp().defaultNow(),
});

export type Notifications = InferInsertModel<typeof notifications>;
export const notifications = pgTable("notifications", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    user_id: uuid().references(() => users.id),
    title: varchar({ length: 255 }).notNull(),
    description: varchar({ length: 255 }).notNull(),
    status: varchar({ length: 255 }),
    created_at: timestamp().defaultNow(),
});