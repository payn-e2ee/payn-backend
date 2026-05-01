import 'dotenv/config';

import express from "express";
import apiRouter from "./routes/index.ts";
import { initMinio } from './storage/minio-storage.ts';
import { Aedes, type AedesPublishPacket } from 'aedes';
import { createWebSocketStream, WebSocketServer } from 'ws';
import { authenticateHandler, authorizeForwardHandler, authorizePublishHandler, authorizeSubscribeHandler } from './handlers/mqtt-handlers.ts';
import { errorMiddleware } from './handlers/errors-handlers.ts';

async function main() {
    await initMinio();

    const app = express();
    const PORT = process.env.PORT || 3000;

    app.use(express.json());

    app.use('/api', apiRouter);
    app.use(errorMiddleware);

    const aedes = await Aedes.createBroker({
        authenticate: authenticateHandler,
        authorizeSubscribe: authorizeSubscribeHandler,
        authorizePublish: authorizePublishHandler,
        authorizeForward: authorizeForwardHandler,
    });

    aedes.on('connectionError', (client, error) => {
        console.error('Aedes error:', error);
    });

    aedes.on('clientError', (client, error) => {
        console.error('Aedes client error:', error);
    });

    const server = app.listen(PORT, () => {
        console.log("Server running on http://127.0.0.1:" + PORT);
    });

    const ws = new WebSocketServer({
        server,
        path: "/chat"
    });

    ws.on('error', console.error);
    ws.on("connection", (socket, request) => {
        socket.on("error", (err) => console.error("client error:", err));
        aedes.handle(createWebSocketStream(socket), request);
    });
}

main();