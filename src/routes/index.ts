import { Router } from "express";

import usersRouter from "./users/index.ts";
import authRouter from "./auth/index.ts";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);

export default router;