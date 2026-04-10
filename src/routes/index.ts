import { Router } from "express";

import usersRouter from "./users/index.ts";

const router = Router();

router.use("/users", usersRouter);

export default router;