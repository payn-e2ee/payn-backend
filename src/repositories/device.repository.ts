import { db } from "../database/index.ts";
import { devices, users, type Device } from "../database/schema.ts";
import type { CreateUserForm } from "../zod-schema/create-user-form.ts";

export async function createDevice(userId: string, identityKey: string): Promise<Device | undefined> {
    const newDevices = await db.insert(devices).values({ identity_key: identityKey, user_id: userId, }).returning();
    if (newDevices.length == 0) {
        return undefined;
    } else {
        return newDevices[0];
    }
}