import { Router } from "express";
import { getCurrentUserHandler, getUserByIdHandler, updateCurrentUserHandler, profileImageUpload } from "../../handlers/users-handlers.ts";

const router = Router();

router.get("/", getCurrentUserHandler);
router.get("/:id", getUserByIdHandler);
router.patch("/", profileImageUpload, updateCurrentUserHandler);

export default router;