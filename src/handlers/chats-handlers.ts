import type { Request, Response } from "express";
import { getChatForUserById, listChats } from "../repositories/chat-repository.ts";

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
