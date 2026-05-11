import { db } from "../database/index.ts";
import { messages } from "../database/schema.ts";

export async function listMessages(chatId: string, deviceId: string, offset: number, limit: number) {
    return await db.query.messages.findMany({
        offset: offset,
        limit: limit,
        orderBy: (messages, { desc }) => desc(messages.created_at),
        where: (messages, { and, eq }) =>
            and(
                eq(messages.chat_id, chatId),
            ),
        with: {
            messageDeliveries: {
                where: (messageDeliveries, { eq, or }) => or(
                    eq(messageDeliveries.sender_device_id, deviceId),
                    eq(messageDeliveries.recipient_device_id, deviceId)
                ),
                with: {
                    attachment: true,
                },
            },
        },
    });
}

export async function createMessage(chatId: string, userId: string, deviceId: string) {
    const newMessages = await db
        .insert(messages)
        .values({ user_id: userId, device_id: deviceId, chat_id: chatId, status: "sent" })
        .returning();
    if (newMessages.length == 0) {
        return undefined;
    } else {
        return newMessages[0];
    }
}
