import type { Request, Response } from "express";
import { getContactByUserIdAndContactUserId, getContactForUserById, listContacts, addContact } from "../repositories/contact-repository.ts";
import { getUserByPhoneNumber } from "../repositories/user-repository.ts";
import { addContactForm } from "../zod-schema/add-contact-form.ts";

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

export async function addContactHandler(req: Request, res: Response): Promise<void> {
    const authSession = req.authSession!;
    const { user_id: userId } = authSession;

    const validatedBody = addContactForm.safeParse(req.body);

    if (!validatedBody.success) {
        res.status(400).json({
            message: "Validation failed",
            errors: validatedBody.error.flatten(),
        });
        return;
    }

    const { phone_number, firstname, lastname } = validatedBody.data;

    const user = await getUserByPhoneNumber(phone_number);
    if (!user) {
        res.status(404).json({
            message: "The user you are trying to add does not exist",
        });
        return;
    }

    if (userId === user.id!) {
        res.status(400).json({
            message: "You cannot add yourself as a contact",
        });
        return;
    }

    const existingContact = await getContactByUserIdAndContactUserId(userId, user.id!);
    if (existingContact) {
        res.status(409).json({
            message: "This user is already in your contacts",
        });
        return;
    }

    const newContact = await addContact({
        user_id: userId,
        contact_user_id: user.id!,
        firstname: firstname || user.firstname || null,
        lastname: lastname || user.lastname || null,
    });

    res.status(201).json({
        message: "Contact added successfully",
        data: newContact[0],
    });
}
