import { db } from "../database/index.ts";
import { devices, type Device } from "../database/schema.ts";

export async function createDevice(userId: string, identityKey: string, fcmToken?: string): Promise<Device | undefined> {
    const newDevices = await db
        .insert(devices)
        .values({ identity_key: identityKey, user_id: userId, fcm_token: fcmToken })
        .onConflictDoUpdate({
            target: devices.identity_key,
            set: {
                identity_key: identityKey,
                fcm_token: fcmToken,
            },
        })
        .returning();
    if (newDevices.length == 0) {
        return undefined;
    } else {
        return newDevices[0];
    }
}