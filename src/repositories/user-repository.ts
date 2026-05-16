import { eq } from "drizzle-orm";
import { db } from "../database/index.ts";
import { users, type User } from "../database/schema.ts";
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