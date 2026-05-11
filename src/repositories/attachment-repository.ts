import { db } from "../database/index.ts";
import { attachments } from "../database/schema.ts";

export async function createAttachment(bucketName: string, objectName: string, originalFileName: string, originalFileSize: number) {
    const newAttachments = await db
        .insert(attachments)
        .values({
            bucket_name: bucketName,
            object_name: objectName,
            original_file_name: originalFileName,
            original_file_size: originalFileSize,
        })
        .returning();
    if (newAttachments.length == 0) {
        return undefined;
    } else {
        return newAttachments[0];
    }
}

export async function getAttachmentById(attachmentId: string) {
    return await db.query.attachments.findFirst({
        where: (attachments, { eq }) => eq(attachments.id, attachmentId)
    });
}