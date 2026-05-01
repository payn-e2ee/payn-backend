import { db } from "../database/index.ts";
import { messageDeliveries } from "../database/schema.ts";

export async function createMessageDelivery(
    messageId: string,
    senderUserId: string,
    senderDeviceId: string,
    recipientUserId: string,
    recipientDeviceId: string,
    attachmentId: string,
    authTag: string,
    ciphertext: string,
    ephemeralPublicKey: string,
    identityKey: string,
    messageCounter: number,
    type: string,
) {
    const newMessageDeliveries = await db
        .insert(messageDeliveries)
        .values({
            message_id: messageId,
            sender_user_id: senderUserId,
            sender_device_id: senderDeviceId,
            recipient_user_id: recipientUserId,
            recipient_device_id: recipientDeviceId,
            attachment_id: attachmentId,
            auth_tag: authTag,
            ephemeral_public_key: ephemeralPublicKey,
            identity_key: identityKey,
            message_counter: messageCounter,
            ciphertext,
            type,
        })
        .returning();
    if (newMessageDeliveries.length == 0) {
        return undefined;
    } else {
        return newMessageDeliveries[0];
    }
}
