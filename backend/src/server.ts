import app from "./app";
import { connectDatabase } from "./config/db";
import { env } from "./config/env";
import "./services/notification.service";
import mongoose from "mongoose";
import { redisClient } from "./config/redis";
import { createServer, Server as HttpServer } from "http";
import { initializeSocket } from "./config/socket.config";
import { SocketHandlers } from "./services/socket.handlers";

let server: HttpServer;

const startServer = async (): Promise<void> => {
    await connectDatabase();

    const httpServer: HttpServer = createServer(app);

    initializeSocket(httpServer);

    const socketHandlers = new SocketHandlers();
    socketHandlers.initialize();

    server = httpServer.listen(Number(env.PORT), () => {
        console.log(`Server running on port ${env.PORT}`);
    });

    server.on("error", (err: NodeJS.ErrnoException) => {
        if (err.code === "EADDRINUSE") {
            console.error(`Port ${env.PORT} already in use`);
            process.exit(1);
        }
    });
};

startServer();

const shutdown = async (signal: string): Promise<void> => {
    console.log(`Graceful shutdown initiated (${signal})`);

    try {
        await new Promise<void>((resolve, reject) => {
            server.close((err?: Error) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        console.log("HTTP server closed");

        await mongoose.connection.close();
        console.log("MongoDB connection closed");

        await redisClient.quit();
        console.log("Redis client closed");

        process.exit(0);
    } catch (error) {
        console.error("Shutdown error:", error);
        process.exit(1);
    }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));