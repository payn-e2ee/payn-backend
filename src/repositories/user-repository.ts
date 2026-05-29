import { and, eq, ilike, inArray, ne, or } from "drizzle-orm";
import { db } from "../database/index.ts";
import { chatMembers, contacts, users, type User } from "../database/schema.ts";
import type { CreateUserForm } from "../zod-schema/create-user-form.ts";
import type { UpdateUserForm } from "../zod-schema/update-user-form.ts";

export async function getAllUsers(): Promise<Array<User>> {
    return await db.query.users.findMany();
}

export async function createOneUser(createUserForm: CreateUserForm & { is_verified: boolean }): Promise<Array<User>> {
    return await db.insert(users).values(createUserForm).returning();
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
    return await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.username, username),
    });
}

export async function getUserById(userId: string) {
    return await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, userId),
        with: {
            devices: true,
            profileImage: true,
        }
    });
}

export async function getUserByIdAndDeviceId(userId: string, deviceId: string) {
    return await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, userId),
        with: {
            devices: {
                where: (devices, { eq }) => eq(devices.id, deviceId),
            },
            profileImage: true,
        }
    });
}

export async function getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    return await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.phone_number, phoneNumber),
    });
}

export async function updateUserById(userId: string, updateUserForm: UpdateUserForm & { profile_image_id?: string | undefined }): Promise<Array<User>> {
    const updateData: any = {
        firstname: updateUserForm.firstname,
        lastname: updateUserForm.lastname,
        username: updateUserForm.username,
    };

    if (updateUserForm.profile_image_id) {
        updateData.profile_image_id = updateUserForm.profile_image_id;
    }

    return await db.update(users).set(updateData).where(eq(users.id, userId)).returning();
}

export async function searchUsersWithChatAndContactStatus(userId: string, query: string, limit: number) {
    const searchPattern = `%${query}%`;

    const matchedUsers = await db.query.users.findMany({
        limit,
        where: (users, { and, or, ilike, ne }) => and(
            ne(users.id, userId),
            or(
                ilike(users.firstname, searchPattern),
                ilike(users.lastname, searchPattern),
                ilike(users.username, searchPattern),
                ilike(users.phone_number, searchPattern),
            ),
        ),
        columns: {
            id: true,
            firstname: true,
            lastname: true,
            username: true,
            phone_number: true,
        },
        with: {
            chatMembers: {
                where: (_chatMembers, { exists, and, eq }) => exists(
                    db.select().from(chatMembers).where(
                        and(
                            eq(chatMembers.user_id, userId),
                            eq(chatMembers.chat_id, _chatMembers.chat_id)
                        )
                    )
                ),
                columns: {
                    id: true,
                    chat_id: true,
                    user_id: true,
                    created_at: true,
                },
            },
        },
    });

    if (matchedUsers.length === 0) {
        return [];
    }

    const resultUserIds = matchedUsers.map((u) => u.id!);

    const contactRows = await db.select({ contact_user_id: contacts.contact_user_id })
        .from(contacts)
        .where(
            and(
                eq(contacts.user_id, userId),
                inArray(contacts.contact_user_id, resultUserIds),
            ),
        );

    const isContactSet = new Set(contactRows.map((r) => r.contact_user_id!));

    return matchedUsers.map((u) => ({
        id: u.id!,
        firstname: u.firstname,
        lastname: u.lastname,
        username: u.username,
        phone_number: u.phone_number,
        has_chat: (u.chatMembers?.length ?? 0) > 0,
        is_contact: isContactSet.has(u.id!),
        chatMembers: u.chatMembers ?? [],
    }));
}