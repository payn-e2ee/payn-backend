import type { Request, Response } from "express";
import { createChat, getChatForUserById, listChats } from "../repositories/chat-repository.ts";
import { createMessage, listMessages, updateMessagesByIds } from "../repositories/message-repository.ts";
import { initChatForm } from "../zod-schema/init-chat-form.ts";
import { createMessageDelivery } from "../repositories/message-delivery-repository.ts";
import { createChatMembers } from "../repositories/chat-member-repository.ts";
import { updateMessagesBatchForm } from "../zod-schema/update-messages-batch-form.ts";

export async function listChatsHandler(req: Request, res: Response): Promise<void> {
    const authSession = req.authSession!;
    const { user_id: userId, device_id: deviceId } = authSession;

    const offset = parseInt(req.query.offset?.toString() || "0") || 0;
    const limit = parseInt(req.query.offset?.toString() || "10") || 10;
    const chats = await listChats(userId, deviceId, offset, limit);

    res.status(200).json({
        message: "chats feteched successfully",
        data: chats,
    });
}

export async function getChatByIdHandler(req: Request, res: Response): Promise<void> {
    const authSession = req.authSession!;
    const { user_id: userId } = authSession;
    const chatId = req.params.id as string;

    const chat = await getChatForUserById(chatId, userId);
    if (!chat) {
        res.status(401).json({
            message: "The requested chat does not exist or you are not authorized to access it.",
        });
        return;
    }

    res.status(200).json({
        message: "chat fetched successfully",
        data: chat,
    });
}

export async function listMessagesHandler(req: Request, res: Response): Promise<void> {
    const authSession = req.authSession!;
    const { device_id: deviceId } = authSession;
    const id = req.params.id as string;

    const offset = parseInt(req.query.offset?.toString() || "0") || 0;
    const limit = parseInt(req.query.offset?.toString() || "10") || 10;
    const messages = await listMessages(id, deviceId, offset, limit);

    res.status(200).json({
        message: "messages feteched successfully",
        data: messages,
    });
}

export async function initChatHandler(req: Request, res: Response): Promise<void> {
    const result = initChatForm.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({
            message: "Invalid request data",
            errors: result.error.flatten(),
        });
        return;
    }

    const { message_frames } = result.data;

    // Create Chat
    const chat = await createChat();
    if (!chat) {
        console.error("Failed to create chat.");
        res.status(500).json({
            message: "An unexpected error occurred. Please try again later.",
        });
        return;
    }

    // Create Message
    const {
        sender_device_id, sender_user_id,
        recipient_user_id,
    } = message_frames[0]!.header;
    const newMessage = await createMessage(
        chat.id,
        sender_user_id,
        sender_device_id
    );

    if (!newMessage) {
        console.error("Failed to create messages.");
        res.status(500).json({
            message: "An unexpected error occurred. Please try again later.",
        });
        return;
    }

    // Add members
    await createChatMembers(chat.id, sender_user_id);
    await createChatMembers(chat.id, recipient_user_id);

    for (let i = 0; i < message_frames.length; i++) {
        const messageFrame = message_frames[i]!;
        const newMessageDelivery = await createMessageDelivery(
            newMessage.id,
            sender_user_id,
            sender_device_id,
            messageFrame.header.recipient_user_id,
            messageFrame.header.recipient_device_id,
            "", // FIXME: Update when you handle attachments
            messageFrame.auth_tag,
            messageFrame.ciphertext,
            messageFrame.header.sender_ephemeral_public_key,
            messageFrame.header.sender_identity_key,
            messageFrame.header.message_counter,
            "text"
        );
        if (!newMessageDelivery) {
            console.error("Failed to create messages delivery.");
            res.status(500).json({
                message: "An unexpected error occurred. Please try again later.",
            });
            return;
        }
    }

    res.status(200).json({
        message: "chat created successfully",
        data: chat,
    });
}

export async function updateMessagesBatchHandler(req: Request, res: Response): Promise<void> {
    const result = updateMessagesBatchForm.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({
            message: "Invalid request data",
            errors: result.error.flatten(),
        });
        return;
    }

    const { user_id } = req.authSession!;
    const chatId = req.params.id as string;
    const { message_ids, status } = result.data;

    const messages = await updateMessagesByIds(chatId, user_id, message_ids, status);
    if (messages.length == 0) {
        res.status(401).json({
            message: "you are not authorized to access it.",
        });
        return;
    }

    res.status(200).json({
        message: "messages updated successfully",
    });
}
