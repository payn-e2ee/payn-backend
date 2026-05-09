import type { Request, Response } from "express";
import { createOneUser, getUserById, getUserByUsername, updateUserById } from "../repositories/user-repository.ts";
import { getPresignedUrl } from "../storage/minio-storage.ts";
import { createUserForm } from "../zod-schema/create-user-form.ts";
import bcrypt from "bcrypt";
import { updateUserForm } from "../zod-schema/update-user-form.ts";
import { uploadFile, bucketName } from "../storage/minio-storage.ts";
import { createAttachment } from "../repositories/attachment-repository.ts";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
export const profileImageUpload = upload.single("profile_image");

export async function getCurrentUserHandler(req: Request, res: Response): Promise<void> {
    const authSession = req.authSession!;
    const userId = authSession.user_id;

    const user = await getUserById(userId);
    if (!user) {
        res.status(401).json({
            message: "Unauthorized",
        });
        return;
    }

    let profileImageUrl = null;
    if (user.profileImage) {
        profileImageUrl = await getPresignedUrl(user.profileImage.object_id);
    }

    res.status(200).json({
        message: "user feteched successfully",
        data: {
            id: user.id,
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            phone_number: user.phone_number,
            devices: user.devices,
            profile_image: user.profileImage ? {
                ...user.profileImage,
                url: profileImageUrl
            } : null,
        },
    });
}

export async function getUserByIdHandler(req: Request, res: Response): Promise<void> {
    const userId = req.params.id as string;
    const user = await getUserById(userId);
    if (!user) {
        res.status(401).json({
            message: "Unauthorized",
        });
        return;
    }

    let profileImageUrl = null;
    if (user.profileImage) {
        profileImageUrl = await getPresignedUrl(user.profileImage.object_id);
    }

    res.status(200).json({
        message: "user feteched successfully",
        data: {
            id: user.id,
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            phone_number: user.phone_number,
            devices: user.devices,
            profile_image: user.profileImage ? {
                ...user.profileImage,
                url: profileImageUrl
            } : null,
            created_at: user.created_at,
        },
    });
}

export async function registerHandler(req: Request, res: Response): Promise<void> {
    const result = createUserForm.safeParse(req.body);

    if (!result.success) {
        res.status(400).json({
            message: "Invalid request data",
            errors: result.error.flatten(),
        });
        return;
    }

    const { phone_number, username, password, firstname, lastname, verification_token } = result.data;

    if (verification_token !== process.env.BYPASS_TOKEN) {
        //soon: verify the token with registered tokens in the database after implementing sms provider
        res.status(400).json({
            message: "Invalid verification token",
        });
        return;
    }

    try {
        const existingUser = await getUserByUsername(username);
        if (existingUser) {
            res.status(400).json({
                message: "Username already exists",
            });
            return;
        }

        const salt = bcrypt.genSaltSync();
        const hashedPassword = bcrypt.hashSync(password, salt);

        const newUser = await createOneUser({
            phone_number,
            username,
            password: hashedPassword,
            firstname,
            lastname,
            is_verified: true,
        });

        const user = newUser[0];
        if (!user) {
            console.log(newUser);
            res.status(500).json({ message: "Internal Server Error" });
            return;
        }

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user.id,
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                phone_number: user.phone_number,
            },
        });
    } catch (error: any) {
        console.error(error);
        if (error.code === "23505") {
            res.status(400).json({
                message: "Username already exists",
            });
            return;
        }
        res.status(500).json({
            message: "An unexpected error occurred. Please try again later.",
        });
    }
}

export async function updateCurrentUserHandler(req: Request, res: Response): Promise<void> {
    const authSession = req.authSession!;
    const userId = authSession.user_id;

    // For multipart/form-data, the fields are in req.body
    const result = updateUserForm.safeParse(req.body);

    if (!result.success) {
        res.status(400).json({
            message: "Invalid request data",
            errors: result.error.flatten(),
        });
        return;
    }

    try {
        let profile_image_id: string | undefined = undefined;

        if (req.file) {
            const file = req.file;
            const objectName = `profiles/${userId}/${Date.now()}-${file.originalname}`;
            
            await uploadFile(objectName, file.buffer, file.mimetype);

            const attachment = await createAttachment({
                bucket: bucketName,
                object_id: objectName,
            });

            if (attachment && attachment[0]) {
                profile_image_id = attachment[0].id;
            }
        }

        const updatedUsers = await updateUserById(userId, {
            ...result.data,
            profile_image_id,
        });

        if (updatedUsers.length > 0) {
            const user = updatedUsers[0];
            let profileImageUrl = null;
            
            const fullUser = await getUserById(userId);
            if (fullUser?.profileImage) {
                profileImageUrl = await getPresignedUrl(fullUser.profileImage.object_id);
            }

            res.status(200).json({
                message: "user updated successfully",
                data: {
                    ...user,
                    profile_image: fullUser?.profileImage ? {
                        ...fullUser.profileImage,
                        url: profileImageUrl
                    } : null
                },
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "An unexpected error occurred. Please try again later.",
        });
    }
}
