import type { Request, Response } from "express";
import { listChats } from "../repositories/chat-repository.ts";

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
