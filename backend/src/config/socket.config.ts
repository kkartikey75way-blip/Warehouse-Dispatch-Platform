import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { env } from './env';

let io: Server;

export const initSocket = (server: HttpServer): Server => {
    io = new Server(server, {
        cors: {
            origin: env.FRONTEND_URL,
            methods: ['GET', 'POST', 'PATCH', 'DELETE'],
            credentials: true
        },
        pingTimeout: 60000,
        pingInterval: 25000
    });

    return io;
};

export const getIO = (): Server => {
    if (!io) throw new Error('Socket.io not initialized!');
    return io;
};
