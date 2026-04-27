import { db } from "../database/index.ts";
import { chatMembers } from "../database/schema.ts";

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