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
        }
    });
}

export async function getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    return await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.phone_number, phoneNumber),
    });
}

export async function updateUserById(userId: string, updateUserForm: UpdateUserForm): Promise<Array<User>> {
    return await db.update(users).set({
        firstname: updateUserForm.firstname,
        lastname: updateUserForm.lastname,
        phone_number: updateUserForm.phone_number,
        username: updateUserForm.username,
    }).where(eq(users.id, userId)).returning();
}