import { db } from "../database/index.ts";
import { attachments, type Attachment } from "../database/schema.ts";
import { eq } from "drizzle-orm";

export async function createAttachment(data: Attachment) {
    return await db.insert(attachments).values(data).returning();
}

export async function getAttachmentById(id: string) {
    const result = await db.select().from(attachments).where(eq(attachments.id, id));
    return result[0];
}

export async function deleteAttachmentById(id: string) {
    return await db.delete(attachments).where(eq(attachments.id, id)).returning();
}
