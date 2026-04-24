import type { Request, Response } from "express";
import { getChatByMemberIds, getChatForUserById, getChatMembers, listChats } from "../repositories/chat-repository.ts";
import { createChatForm } from "../zod-schema/create-chat-form.ts";
import { createOneChat, addChatMembers } from "../repositories/chat-repository.ts";
import { getUserById } from "../repositories/user-repository.ts";
import { get } from "node:http";
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

export async function createChatHandler(req: Request, res: Response): Promise<void> {
    const authSession = req.authSession!;
    const userId = authSession.user_id;

    const result = createChatForm.safeParse(req.body);

    if (!result.success) {
        res.status(400).json({
            message: "Invalid request data",
            errors: result.error.flatten(),
        });
        return;
    }

    const { participant_id } = result.data;

    const participant_ids = [participant_id, userId];

    try {
        const user = await getUserById(participant_id);
        if (!user) {
            res.status(404).json({
                message: `User with ID ${participant_id} not found`,
            });
            return;
        }

        const existingChat = await getChatByMemberIds(participant_ids);
        if (existingChat) {
            res.status(400).json({
                message: "A chat with the specified participant already exists",
            });
            return;
        }

        const chat = await createOneChat();
        if (!chat) {
            res.status(500).json({
                message: "Failed to create chat",
            });
            return;
        }

        await addChatMembers(chat.id!, participant_ids);

        const members = await getChatMembers(chat.id!);

        res.status(201).json({
            message: "Chat created successfully",
            data: {
                id: chat.id,
                created_at: chat.created_at,
                members_count: members.length,
                participant_ids: participant_ids,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "An unexpected error occurred. Please try again later.",
        });
    }
}
