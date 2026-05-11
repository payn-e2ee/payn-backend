import type { Request, Response } from "express";
import { minioClient } from "../storage/minio-storage.ts";
import { createAttachment, getAttachmentById } from "../repositories/attachment-repository.ts";
import { uploadAttachmentForm } from "../zod-schema/upload-attachment-form.ts";

export async function uploadAttachmentHandler(req: Request, res: Response): Promise<void> {
    const result = uploadAttachmentForm.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({
            message: "Invalid request data",
            errors: result.error.flatten(),
        });
        return;
    }

    const files = req.files;
    const file = files?.file;
    if (!files || !file) {
        res.status(400).json({ message: "file field is required." });
        return;
    }

    if (Array.isArray(file)) {
        res.status(400).json({ message: "Only one file can be uploaded." });
        return;
    }

    const {
        original_file_name: originalFileName,
        original_file_size: originalFileSize,
    } = result.data;
    const bucketName = process.env.BUCKET_NAME as string;
    const objectName = crypto.randomUUID();

    await minioClient.putObject(
        bucketName,
        objectName,
        file.data,
    );

    const attachement = await createAttachment(
        bucketName,
        objectName,
        originalFileName,
        originalFileSize
    );
    if (!attachement) {
        console.error("Failed to create attachement.");
        res.status(500).json({
            message: "An unexpected error occurred. Please try again later.",
        });
        return;
    }

    res.status(200).json({
        message: "attachement uploded successfully",
        data: attachement,
    });
}

export async function getAttachmentByIdHandler(
    req: Request,
    res: Response
): Promise<void> {
    const attachmentId = req.params.id as string;

    const attachment = await getAttachmentById(attachmentId);

    if (!attachment) {
        res.status(404).json({
            message:
                "The requested attachment does not exist or you are not authorized to access it.",
        });
        return;
    }

    const stream = await minioClient.getObject(
        attachment.bucket_name,
        attachment.object_name
    );

    stream.pipe(res);

    stream.on("error", (error) => {
        console.error("Failed to stream attachment:", error);

        if (!res.headersSent) {
            res.status(500).json({
                message: "Failed to retrieve attachment.",
            });
        } else {
            res.end();
        }
    });
}