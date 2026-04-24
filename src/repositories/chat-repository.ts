import { eq, and } from "drizzle-orm";
import { db } from "../database/index.ts";
import { chats, chatMembers, type Chat, type ChatMember } from "../database/schema.ts";

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
                            created_at: true,
                        }
                    },
                },
            },
        },
    });
}

export async function createOneChat(): Promise<Chat | undefined> {
    const result = await db.insert(chats).values({}).returning();
    return result[0];
}

export async function addChatMembers(chatId: string, userIds: string[]): Promise<ChatMember[]> {
    const members = userIds.map(userId => ({
        chat_id: chatId,
        user_id: userId,
    }));
    return await db.insert(chatMembers).values(members).returning();
}

export async function getChatById(chatId: string): Promise<Chat | undefined> {
    return await db.query.chats.findFirst({
        where: (chats, { eq }) => eq(chats.id, chatId),
    });
}

export async function getChatMembers(chatId: string): Promise<ChatMember[]> {
    return await db.query.chatMembers.findMany({
        where: (chatMembers, { eq }) => eq(chatMembers.chat_id, chatId),
    });
}

export async function getChatByMemberIds(memberIds: string[]): Promise<Chat | undefined> {
    const chat = await db.query.chats.findFirst({
        where: (chats, { eq, and, exists }) =>
            and(
                exists(
                    db.select()
                        .from(chatMembers)
                        .where(
                            and(
                                eq(chatMembers.chat_id, chats.id),
                                eq(chatMembers.user_id, memberIds[0])
                            )
                        )
                ),
                exists(
                    db.select()
                        .from(chatMembers)
                        .where(
                            and(
                                eq(chatMembers.chat_id, chats.id),
                                eq(chatMembers.user_id, memberIds[1])
                            )
                        )
                )
            ),
    });

    return chat || undefined;
}