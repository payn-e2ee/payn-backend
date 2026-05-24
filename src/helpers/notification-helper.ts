import admin from 'firebase-admin';
import { db } from '../database/index.ts';
import { devices } from '../database/schema.ts';
import { eq } from 'drizzle-orm';
import path from 'path';

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

const absolutePath = serviceAccountPath
    ? path.isAbsolute(serviceAccountPath)
        ? serviceAccountPath
        : path.resolve(process.cwd(), serviceAccountPath)
    : undefined;

export const firebaseApp = absolutePath
    ? admin.initializeApp({
          credential: admin.credential.cert(absolutePath),
      })
    : undefined;

export async function sendNotificationToToken(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
    sendAsDataOnly: boolean = false
) {
    if (!firebaseApp) return;

    try {
        const message: admin.messaging.Message = {
            token,
            data: {
                ...data,
                ...(sendAsDataOnly ? { title, body } : {}),
            },
            ...(sendAsDataOnly ? {} : {
                notification: {
                    title,
                    body,
                }
            }),
        };

        await admin.messaging().send(message);
        console.log(`Successfully sent notification`);
    } catch (error: any) {
        console.error(`Failed to send notification:`, error);
        if (
            error?.code === 'messaging/registration-token-not-registered' ||
            error?.code === 'messaging/invalid-registration-token'
        ) {
            console.log(`Removing invalid token ${token} from database.`);
            await db.update(devices).set({ fcm_token: null }).where(eq(devices.fcm_token, token));
        }
    }
}
