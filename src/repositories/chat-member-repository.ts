import { db } from "../database/index.ts";
import { chatMembers } from "../database/schema.ts";

export async function createChatMembers(chatId: string, userId: string) {
    const newChatMembers = await db
        .insert(chatMembers)
        .values({
            user_id: userId,
            chat_id: chatId,
        })
        .returning();
    if (newChatMembers.length == 0) {
        return undefined;
    } else {
        return newChatMembers[0];
    }
}
