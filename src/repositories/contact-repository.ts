import { and, eq } from "drizzle-orm";
import { db } from "../database/index.ts";
import { contacts, chatMembers, type Contact } from "../database/schema.ts";

export async function listContacts(userId: string, offset: number, limit: number) {
    return await db.query.contacts.findMany({
        offset,
        limit,
        where: (contacts, { eq }) => eq(contacts.user_id, userId),
        with: {
            contactUser: {
                columns: {
                    id: true,
                    username: true,
                    firstname: true,
                    lastname: true,
                    phone_number: true,
                    created_at: true,
                },
                with: {
                    chatMembers: {
                        where: (_chatMembers, { exists, and, eq }) => exists(
                            db.select().from(chatMembers).where(
                                and(
                                    eq(chatMembers.user_id, userId),
                                    eq(chatMembers.chat_id, _chatMembers.chat_id)
                                )
                            )
                        ),
                    },
                },
            },
        },
    })
}

export async function getContactForUserById(contactId: string, userId: string) {
    return await db.query.contacts.findFirst({
        where: (contacts, { and, eq }) => and(eq(contacts.id, contactId), eq(contacts.user_id, userId)),
        with: {
            contactUser: {
                columns: {
                    id: true,
                    username: true,
                    firstname: true,
                    lastname: true,
                    phone_number: true,
                    created_at: true,
                }
            },
        },
    });
}

export async function addContact(contactData: Contact) {
    return await db.insert(contacts).values(contactData).returning();
}

export async function getContactByUserIdAndContactUserId(userId: string, contactUserId: string) {
    return await db.query.contacts.findFirst({
        where: (contacts, { and, eq }) => and(eq(contacts.user_id, userId), eq(contacts.contact_user_id, contactUserId)),
    });
}

export async function deleteContact(contactId: string, userId: string) {
    return await db.delete(contacts).where(and(eq(contacts.id, contactId), eq(contacts.user_id, userId))).returning();
}
