import type { Request, Response } from "express";
import { getContactForUserById, listContacts } from "../repositories/contact-repository.ts";

export async function listContactsHandler(req: Request, res: Response): Promise<void> {
    const authSession = req.authSession!;
    const { user_id: userId } = authSession;

    const offset = parseInt(req.query.offset?.toString() || "0") || 0;
    const limit = parseInt(req.query.offset?.toString() || "10") || 10;
    const contacts = await listContacts(userId, offset, limit);

    res.status(200).json({
        message: "contacts feteched successfully",
        data: contacts,
    });
}

export async function getContactByIdHandler(req: Request, res: Response): Promise<void> {
    const authSession = req.authSession!;
    const { user_id: userId } = authSession;
    const contactId = req.params.id as string;

    const contact = await getContactForUserById(contactId, userId);
    if (!contact) {
        res.status(401).json({
            message: "The requested contact does not exist or you are not authorized to access it.",
        });
        return;
    }

    res.status(200).json({
        message: "contact fetched successfully",
        data: contact,
    });
}
