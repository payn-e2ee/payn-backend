import { and, eq, or, ilike } from "drizzle-orm";
import { db } from "../database/index.ts";
import { contacts, users, type Contact } from "../database/schema.ts";

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

export async function searchContacts(userId: string, keyword: string) {
    const searchPattern = `%${keyword}%`;
    
    return await db.select({
        id: contacts.id,
        user_id: contacts.user_id,
        firstname: contacts.firstname,
        lastname: contacts.lastname,
        contact_user_id: contacts.contact_user_id,
        created_at: contacts.created_at,
        contactUser: {
            id: users.id,
            username: users.username,
            firstname: users.firstname,
            lastname: users.lastname,
            phone_number: users.phone_number,
            created_at: users.created_at,
        }
    })
    .from(contacts)
    .innerJoin(users, eq(contacts.contact_user_id, users.id))
    .where(
        and(
            eq(contacts.user_id, userId),
            or(
                ilike(contacts.firstname, searchPattern),
                ilike(contacts.lastname, searchPattern),
                ilike(users.phone_number, searchPattern)
            )
        )
    );
}
