import { db } from "../database/index.ts";
import { users, type User } from "../database/schema.ts";
import type { CreateUserForm } from "../zod-schema/create-user-form.ts";

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

export async function getUserById(userId: string): Promise<User | undefined> {
    return await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, userId),
    });
}