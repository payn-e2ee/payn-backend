import { db } from "../database/index.ts";

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
                }
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
