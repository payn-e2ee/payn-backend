import { eq, and, or } from "drizzle-orm";
import { db } from "../database/index.ts";
import { chatMembers, chats, messageDeliveries } from "../database/schema.ts";

export async function listChats(userId: string, deviceId: string, offset: number, limit: number) {
    return await db.query.chats.findMany({
        offset: offset,
        limit: limit,
        orderBy: (chats, { desc }) => desc(chats.created_at),
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
                            profile_image_id: true,
                            created_at: true,
                        }
                    },
                },
            },
            messages: {
                limit: 1,
                orderBy: (messages, { desc }) => [desc(messages.created_at)],
                columns: {
                    id: true,
                    chat_id: true,
                    user_id: true,
                    device_id: true,
                    status: true,
                    created_at: true,
                },
                where: (messages, { exists }) => exists(
                    db.select()
                        .from(messageDeliveries)
                        .where(
                            and(
                                eq(messageDeliveries.message_id, messages.id),
                                or(
                                    eq(messageDeliveries.sender_device_id, deviceId),
                                    eq(messageDeliveries.recipient_device_id, deviceId)
                                )
                            )
                        )
                ),
                with: {
                    messageDeliveries: {
                        limit: 1,
                        orderBy: (messageDeliveries, { desc }) => [desc(messageDeliveries.created_at)],
                        where: (messageDeliveries, { eq, or }) => or(
                            eq(messageDeliveries.sender_device_id, deviceId),
                            eq(messageDeliveries.recipient_device_id, deviceId)
                        ),
                        columns: {
                            id: true,
                            message_id: true,
                            sender_device_id: true,
                            sender_user_id: true,
                            recipient_device_id: true,
                            recipient_user_id: true,
                            ciphertext: true,
                            auth_tag: true,
                            ephemeral_public_key: true,
                            type: true,
                            attachment_id: true,
                            identity_key: true,
                            message_counter: true,
                            created_at: true,
                        },
                        with: {
                            attachment: true,
                        }
                    },
                },
            },
        },
    });
}

export async function getChatForUserById(chatId: string, userId: string) {
    return await db.query.chats.findFirst({
        where: (chats, { eq, and, exists }) =>
            and(
                eq(chats.id, chatId),
                exists(
                    db.select()
                        .from(chatMembers)
                        .where(
                            and(
                                eq(chatMembers.chat_id, chats.id),
                                eq(chatMembers.user_id, userId)
                            )
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
                            profile_image_id: true,
                            created_at: true,
                        },
                        with: {
                            devices: true,
                        }
                    },
                },
            },
        },
    });
}

export async function createChat() {
    const newChats = await db
        .insert(chats)
        .values({})
        .returning();
    if (newChats.length == 0) {
        return undefined;
    } else {
        return newChats[0];
    }
}
