import type { Request, Response } from "express";
import { getUserById } from "../repositories/user-repository.ts";

export async function getCurrentUserHandler(req: Request, res: Response): Promise<void> {
    const authSession = req.authSession!;
    const userId = authSession.user_id;

    const user = await getUserById(userId);
    if (!user) {
        res.status(401).json({
            message: "Unauthorized",
        });
        return;
    }

    res.status(200).json({
        message: "user feteched successfully",
        data: {
            id: user.id,
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            phone_number: user.phone_number,
        },
    });
}
