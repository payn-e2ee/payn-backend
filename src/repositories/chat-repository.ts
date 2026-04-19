import { eq, and } from "drizzle-orm";
import { db } from "../database/index.ts";
import { chatMembers } from "../database/schema.ts";

export async function listChats(userId: string, deviceId: string, offset: number, limit: number) {
    return await db.query.chats.findMany({
        offset: offset,
        limit: limit,
        where: (chats, { exists }) =>
            exists(
                db.select()
                    .from(chatMembers)
                    .where(
                        and(
                            eq(chatMembers.chat_id, chats.id),
                            eq(chatMembers.user_id, userId)
                        )
                    )
            ),
        with: {
            chatMembers: {
                with: {
                    user: {
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
            },
            messages: {
                columns: {
                    id: true,
                    chat_id: true,
                    user_id: true,
                    device_id: true,
                    status: true,
                    created_at: true,
                },
                with: {
                    messageDevliveries: {
                        columns: {
                            id: true,
                            message_id: true,
                            device_id: true,
                            user_id: true,
                            cipthertext: true,
                            auth_tag: true,
                            ephemeral_public_key: true,
                            type: true,
                            attachment_id: true,
                            created_at: true,
                        },
                        where: (messageDevliveries, { and, eq }) =>
                            and(
                                eq(messageDevliveries.user_id, userId),
                                eq(messageDevliveries.device_id, deviceId)
                            ),
                        orderBy: (messageDevliveries, { desc }) => [desc(messageDevliveries.created_at)],
                        limit: 1,
                    },
                },
            },
        },
    });
}