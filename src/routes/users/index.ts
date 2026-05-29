import { Router } from "express";
import { getCurrentUserHandler, getUserByIdHandler, searchUsersHandler, updateCurrentUserHandler, updateFcmTokenHandler } from "../../handlers/users-handlers.ts";

const router = Router();

router.get("/", (req, res) => {
    if (req.query.query !== undefined) {
        return searchUsersHandler(req, res);
    }
    return getCurrentUserHandler(req, res);
});
router.patch("/fcm-token", updateFcmTokenHandler);
router.get("/:id", getUserByIdHandler);
router.patch("/", updateCurrentUserHandler);

export default router;