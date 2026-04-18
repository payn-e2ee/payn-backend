import type { Request, Response } from "express";
import { listChats } from "../repositories/chat-repository.ts";

export async function listChatsHandler(req: Request, res: Response): Promise<void> {
    const authSession = req.authSession!;
    const { user_id: userId, device_id: deviceId } = authSession;

    const chats = await listChats(userId, deviceId);

    res.status(200).json({
        message: "chats feteched successfully",
        data: chats,
    });
}
