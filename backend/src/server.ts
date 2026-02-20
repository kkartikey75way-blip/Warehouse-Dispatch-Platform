import app from "./app";
import { connectDatabase } from "./config/db";
import { env } from "./config/env";
import "./services/notification.service";
import mongoose from "mongoose";
import { redisClient } from "./config/redis";
import { createServer } from "http";
import { initializeSocket } from "./config/socket.config";
import { SocketHandlers } from "./services/socket.handlers";

const startServer = async (): Promise<void> => {
    await connectDatabase();

    
    const httpServer = createServer(app);
    initializeSocket(httpServer);

    
    const socketHandlers = new SocketHandlers();
    socketHandlers.initialize();

    const server = httpServer.listen(Number(env.PORT), () => {
        console.log(`Server running on port ${env.PORT}`);
    });

    const shutdown = async (): Promise<void> => {
        console.log("Graceful shutdown initiated");

        server.close(async () => {
            await mongoose.connection.close();
            await redisClient.quit();
            process.exit(0);
        });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
};

startServer();
