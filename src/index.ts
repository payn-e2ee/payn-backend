import 'dotenv/config';

import express from "express";
import apiRouter from "./routes/index.ts";
import { initMinio } from './storage/minio-storage.ts';
import { errorMiddleware } from './handlers/errors-handlers.ts';

async function main() {
    await initMinio();

    const app = express();
    const PORT = process.env.PORT || 3000;


    app.use(express.json());

    app.use('/api', apiRouter);

    app.use(errorMiddleware);

    app.listen(PORT, () => {
        console.log("Server is up running on http://127.0.0.1:" + PORT);
    });
}

main();