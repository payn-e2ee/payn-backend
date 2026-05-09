import * as Minio from "minio";

const endPoint = process.env.MINIO_ENDPOINT as string;
const port = Number(process.env.MINIO_PORT as string);
const useSSL = false;
const accessKey = process.env.MINIO_ACCESS_KEY as string;
const secretKey = process.env.MINIO_SECRET_KEY as string;
export const bucketName = process.env.BUCKET_NAME as string;

export const minioClient = new Minio.Client({
    endPoint,
    port,
    useSSL,
    accessKey,
    secretKey,
});

export async function initMinio() {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
        await minioClient.makeBucket(bucketName);
    }
}

export async function uploadFile(objectName: string, buffer: Buffer, contentType: string) {
    return await minioClient.putObject(bucketName, objectName, buffer, buffer.length, {
        "Content-Type": contentType,
    });
}
