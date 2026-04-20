import type { InferInsertModel } from "drizzle-orm";
import { pgTable, uuid, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export type User = InferInsertModel<typeof users>;
export const users = pgTable("users", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    username: varchar({ length: 255 }).notNull().unique(),
    firstname: varchar(),
    lastname: varchar(),
    password: varchar().notNull(),
    phone_number: varchar().notNull(),
    is_verified: boolean().default(false),
    created_at: timestamp(),
});

export type Attachment = InferInsertModel<typeof attachments>;
export const attachments = pgTable("attachments", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    bucket: varchar({ length: 255 }).notNull(),
    object_id: varchar({ length: 255 }).notNull(),
    created_at: timestamp().defaultNow(),
});

export type Device = InferInsertModel<typeof devices>;
export const devices = pgTable("devices", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    user_id: uuid().references(() => users.id),
    identity_key: varchar({ length: 255 }).notNull().unique(),
    created_at: timestamp().defaultNow(),
});

export type Chat = InferInsertModel<typeof chats>;
export const chats = pgTable("chats", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    created_at: timestamp().defaultNow(),
});

export type Message = InferInsertModel<typeof messages>;
export const messages = pgTable("messages", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    chat_id: uuid().references(() => chats.id),
    user_id: uuid().references(() => users.id),
    device_id: uuid().references(() => devices.id),
    status: varchar({ length: 255 }).notNull(),
    created_at: timestamp().defaultNow(),
});

export type MessageDelivery = InferInsertModel<typeof message_devliveries>;
export const message_devliveries = pgTable("message_devliveries", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    message_id: uuid().references(() => messages.id),
    device_id: uuid().references(() => devices.id),
    user_id: uuid().references(() => users.id),
    cipthertext: varchar({ length: 255 }).notNull(),
    auth_tag: varchar({ length: 255 }).notNull(),
    ephemeral_public_key: varchar({ length: 255 }).notNull(),
    type: varchar({ length: 255 }).notNull(),
    attachment_id: varchar({ length: 255 }).notNull(),
    created_at: timestamp().defaultNow(),
});

export type Notification = InferInsertModel<typeof notifications>;
export const notifications = pgTable("notifications", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    user_id: uuid().references(() => users.id),
    title: varchar({ length: 255 }).notNull(),
    description: varchar({ length: 255 }).notNull(),
    status: varchar({ length: 255 }),
    created_at: timestamp().defaultNow(),
});