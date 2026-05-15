import { relations, type InferInsertModel } from "drizzle-orm";
import { pgTable, uuid, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export type User = InferInsertModel<typeof users>;
export const users = pgTable("users", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    username: varchar({ length: 255 }).notNull().unique(),
    firstname: varchar(),
    lastname: varchar(),
    password: varchar().notNull(),
    phone_number: varchar().notNull(),
    profile_image_id: uuid().references(() => attachments.id),
    is_verified: boolean().default(false),
    created_at: timestamp(),
});

export type Attachment = InferInsertModel<typeof attachments>;
export const attachments = pgTable("attachments", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    bucket_name: varchar().notNull(),
    object_name: varchar().notNull(),
    original_file_name: varchar().notNull(),
    original_file_size: integer().default(0),
    created_at: timestamp().defaultNow(),
});

export type Device = InferInsertModel<typeof devices>;
export const devices = pgTable("devices", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    user_id: uuid().references(() => users.id),
    identity_key: varchar({ length: 255 }).notNull().unique(),
    fcm_token: varchar({ length: 255 }),
    created_at: timestamp().defaultNow(),
});

export type Chat = InferInsertModel<typeof chats>;
export const chats = pgTable("chats", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    created_at: timestamp().defaultNow(),
});

export type ChatMember = InferInsertModel<typeof chatMembers>;
export const chatMembers = pgTable("chat_members", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    chat_id: uuid().references(() => chats.id),
    user_id: uuid().references(() => users.id),
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

export type MessageDelivery = InferInsertModel<typeof messageDeliveries>;
export const messageDeliveries = pgTable("message_deliveries", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    message_id: uuid().references(() => messages.id),
    sender_device_id: uuid().references(() => devices.id),
    sender_user_id: uuid().references(() => users.id),
    recipient_device_id: uuid().references(() => devices.id),
    recipient_user_id: uuid().references(() => users.id),
    ciphertext: varchar({ length: 255 }).notNull(),
    auth_tag: varchar({ length: 255 }).notNull(),
    ephemeral_public_key: varchar({ length: 255 }).notNull(),
    identity_key: varchar().notNull(),
    message_counter: integer().notNull(),
    type: varchar({ length: 255 }).notNull(),
    attachment_id: uuid().references(() => attachments.id),
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

export type Contact = InferInsertModel<typeof contacts>;
export const contacts = pgTable("contacts", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    user_id: uuid().references(() => users.id), // the owner of the contact
    firstname: varchar(),
    lastname: varchar(),
    contact_user_id: uuid().references(() => users.id),
    created_at: timestamp().defaultNow(),
});

// Relations
export const messagesRelations = relations(messages, ({ one, many }) => ({
    chat: one(chats, {
        fields: [messages.chat_id],
        references: [chats.id],
    }),
    messageDeliveries: many(messageDeliveries),
}));

export const chatsRelations = relations(chats, ({ many }) => ({
    chatMembers: many(chatMembers),
    messages: many(messages),
}));

export const chatMembersRelations = relations(chatMembers, ({ one }) => ({
    chat: one(chats, {
        fields: [chatMembers.chat_id],
        references: [chats.id],
    }),
    user: one(users, {
        fields: [chatMembers.user_id],
        references: [users.id],
    }),
}));

export const messageDeliveriesRelations = relations(messageDeliveries, ({ one }) => ({
    message: one(messages, {
        fields: [messageDeliveries.message_id],
        references: [messages.id],
    }),
    attachment: one(attachments, {
        fields: [messageDeliveries.attachment_id],
        references: [attachments.id],
    }),
}));

export const contactsRelations = relations(contacts, ({ one }) => ({
    user: one(users, {
        fields: [contacts.user_id],
        references: [users.id],
    }),
    contactUser: one(users, {
        fields: [contacts.contact_user_id],
        references: [users.id],
    }),
}));

export const usersRelations = relations(users, ({ many, one }) => ({
    devices: many(devices),
    chatMembers: many(chatMembers),
    profileImage: one(attachments, {
        fields: [users.profile_image_id],
        references: [attachments.id],
    }),
}));

export const devicesRelations = relations(devices, ({ one }) => ({
    user: one(users, {
        fields: [devices.user_id],
        references: [users.id],
    }),
}));

