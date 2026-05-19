import type { AedesPublishPacket, AuthenticateError, Client, PublishPacket, Subscription } from "aedes";
import { createMessage } from "../repositories/message-repository.ts";
import { createMessageDelivery } from "../repositories/message-delivery-repository.ts";
import { verifyToken } from "../helpers/jwt-helpers.ts";
import { getChatForUserById } from "../repositories/chat-repository.ts";
import { sendNotificationToToken } from "../helpers/notification-helper.ts";
import { getUserById } from "../repositories/user-repository.ts";
import { db } from "../database/index.ts";
import { devices } from "../database/schema.ts";
import { eq } from "drizzle-orm";


export async function authenticateHandler(
    client: Client,
    username: Readonly<string | undefined>,
    password: Readonly<Buffer | undefined>,
    done: (error: AuthenticateError | null, success: boolean | null) => void
): Promise<void> {
    if (!username || !password) {
        done({
            name: "Unauthenticated",
            message: "Unauthenticated",
            returnCode: 4
        }, false);
        return;
    }

    const accessToken = password.toString().slice("Bearer ".length);
    const payload = verifyToken(accessToken);
    if (!payload) {
        console.error("authenticateHandler: Unauthenticated");
        done({
            name: "Unauthenticated",
            message: "Unauthenticated",
            returnCode: 4
        }, false);
        return;
    }
    client.authSession = payload as AuthSession;
    done(null, true);
}

export async function authorizePublishHandler(
    client: Client | null,
    packet: PublishPacket,
    callback: (error?: Error | null) => void
): Promise<void> {

    if (packet.topic.startsWith("chat/")) {
        const chatId = packet.topic.slice(5);

        const messageFrames = JSON.parse(packet.payload.toString()) as MessageFrameDTO[];
        if (messageFrames.length == 0) {
            console.error("authorizePublishHandler: [Error] message frame is empty");
            callback(new Error("Must provide at least one frame"));
            return;
        }

        // Create Message
        const {
            chat_id, sender_device_id, sender_user_id,
        } = messageFrames[0]!.header;
        const newMessage = await createMessage(
            chat_id,
            sender_user_id,
            sender_device_id
        );

        if (!newMessage) {
            console.error("authorizePublishHandler: [Error] Failed to create new message");
            callback(new Error("Internal Server Error"));
            return;
        }

        for (let i = 0; i < messageFrames.length; i++) {
            const messageFrame = messageFrames[i]!;
            const newMessageDelivery = await createMessageDelivery(
                newMessage?.id,
                sender_user_id,
                sender_device_id,
                messageFrame.header.recipient_user_id,
                messageFrame.header.recipient_device_id,
                messageFrame.header.attachment?.id || null,
                messageFrame.auth_tag,
                messageFrame.ciphertext,
                messageFrame.header.sender_ephemeral_public_key,
                messageFrame.header.sender_identity_key,
                messageFrame.header.message_counter,
                messageFrame.header.message_type,
            );
            if (!newMessageDelivery) {
                console.error("authorizePublishHandler: [Error] Failed to create new messageDelivery");
                callback(new Error("Internal Server Error"));
                return;
            }

            messageFrame.header.message_id = newMessage.id;
        }
        packet.payload = Buffer.from(JSON.stringify(messageFrames));

        const sender = await getUserById(sender_user_id);
        const senderName = sender ? (sender.firstname ? `${sender.firstname} ${sender.lastname}` : sender.username) : "Someone";

        for (const frame of messageFrames) {
            if (frame.header.recipient_user_id === sender_user_id) {
                continue;
            }

            const device = await db.query.devices.findFirst({
                where: eq(devices.id, frame.header.recipient_device_id),
            });

            if (device && device.fcm_token) {
                await sendNotificationToToken(
                    device.fcm_token,
                    senderName,
                    "New Message",
                    {
                        chat_id,
                        type: "message",
                        ciphertext: frame.ciphertext,
                        ephemeral_public_key: frame.header.sender_ephemeral_public_key,
                        message_counter: frame.header.message_counter.toString(),
                        sender_user_id: frame.header.sender_user_id,
                        sender_device_id: frame.header.sender_device_id,
                    },
                    true, 
                    //mobile app's background service decrypts it before displaying!
                );
            }
        }
    }


    callback(null);

}

export async function authorizeSubscribeHandler(
    client: Client,
    subscription: Subscription,
    callback: (error: Error | null, subscription?: Subscription | null) => void
): Promise<void> {

    if (subscription.topic.startsWith("chat/")) {
        const chatId = subscription.topic.slice(5);

        const chat = await getChatForUserById(chatId, client.authSession.user_id);
        if (!chat) {
            console.error("authorizeSubscribeHandler: [Error] The requested chat does not exist or you are not authorized to access it.");
            callback(new Error("The requested chat does not exist or you are not authorized to access it."), subscription);
            return;
        }

    }

    callback(null, subscription);
}

export function authorizeForwardHandler(
    client: Client,
    packet: AedesPublishPacket
): AedesPublishPacket | null | void {
    if (packet.topic.startsWith("chat/")) {
        const chatId = packet.topic.slice(5);
        let messageFrames = JSON.parse(packet.payload.toString()) as MessageFrameDTO[];
        messageFrames = messageFrames.filter((messageFrame) => {
            return messageFrame.header.recipient_user_id == client.authSession.user_id &&
                messageFrame.header.recipient_device_id == client.authSession.device_id
        });
        if (messageFrames.length == 0) {
            return null;
        }
        const messageFrame = messageFrames[0];
        packet.payload = Buffer.from(JSON.stringify(messageFrame));
    }
    return packet;
}