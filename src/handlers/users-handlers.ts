import type { Request, Response } from "express";
import { verifyToken } from "../helpers/jwt-helpers.ts";
import { getUserById } from "../repositories/user-repository.ts";

export async function getCurrentUserHandler(req: Request, res: Response): Promise<void> {
    const accessToken = req.headers["authorization"]?.slice("Bearer ".length);
    if (!accessToken) {
        res.status(401).json({
            message: "Unauthorized",
        });
        return;
    }

    const jwtPayload = verifyToken(accessToken);
    if (!jwtPayload) {
        res.status(401).json({
            message: "Unauthorized",
        });
        return;
    }

    const userId = jwtPayload["user_id"];
    if (!userId) {
        res.status(401).json({
            message: "Unauthorized",
        });
        return;
    }

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
