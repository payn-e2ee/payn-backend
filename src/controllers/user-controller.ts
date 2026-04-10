import type { Request, Response } from "express";
import { createOneUser, getAllUsers } from "../repositories/user-repository.ts";
import type { User } from "../database/schema.ts";
import { createUserForm } from "../zod-schema/create-user-form.ts";

export async function getUsers(req: Request, res: Response): Promise<void> {
    const users: Array<User> = await getAllUsers();
    res.status(200).json({
        message: "users feteched successfully",
        data: users,
    });
}

export async function createUser(req: Request, res: Response): Promise<void> {
    const reuslt = createUserForm.safeParse(req.body);
    if (reuslt.error) {
        res.status(400).json({ error: reuslt.error.message });
        return;
    }

    try {
        const users: Array<User> = await createOneUser(reuslt.data);
        res.status(200).json({
            message: "users feteched successfully",
            data: users[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
}
