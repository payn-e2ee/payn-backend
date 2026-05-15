import admin from 'firebase-admin';
import { db } from '../database/index.ts';
import { devices } from '../database/schema.ts';
import { eq } from 'drizzle-orm';
import path from 'path';

let isFirebaseInitialized = false;

function initializeFirebase() {
    if (isFirebaseInitialized) return;

    try {
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
        if (serviceAccountPath) {
            const absolutePath = path.isAbsolute(serviceAccountPath) 
                ? serviceAccountPath 
                : path.resolve(process.cwd(), serviceAccountPath);
            
            admin.initializeApp({
                credential: admin.credential.cert(absolutePath),
            });
            isFirebaseInitialized = true;
            console.log('Firebase Admin initialized successfully');
        } else {
            console.warn('FIREBASE_SERVICE_ACCOUNT_PATH not provided. Notifications will not be sent.');
        }
    } catch (error) {
        console.error('Error initializing Firebase Admin:', error);
    }
}

export async function sendNotificationToUser(userId: string, title: string, body: string, data?: Record<string, string>) {
    initializeFirebase();

    if (!isFirebaseInitialized) return;

    try {
        const userDevices = await db.query.devices.findMany({
            where: eq(devices.user_id, userId),
        });

        const tokens = userDevices
            .map((d) => d.fcm_token)
            .filter((t): t is string => !!t);

        if (tokens.length === 0) {
            console.log(`No FCM tokens found for user ${userId}`);
            return;
        }

        const message: admin.messaging.MulticastMessage = {
            tokens,
            notification: {
                title,
                body,
            },
            data,
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`Successfully sent ${response.successCount} notifications to user ${userId}`);
        
        if (response.failureCount > 0) {
            const failedTokens: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(tokens[idx]!);
                    console.error(`Failed to send notification to token ${tokens[idx]}:`, resp.error);
                }
            });
        }
    } catch (error) {
        console.error(`Error sending notification to user ${userId}:`, error);
    }
}
