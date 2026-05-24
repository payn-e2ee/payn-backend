import { Router } from "express";
import { getCurrentUserHandler, getUserByIdHandler, updateCurrentUserHandler, updateFcmTokenHandler } from "../../handlers/users-handlers.ts";

const router = Router();

router.get("/", getCurrentUserHandler);
router.patch("/fcm-token", updateFcmTokenHandler);
router.get("/:id", getUserByIdHandler);
router.patch("/", updateCurrentUserHandler);

export default router;