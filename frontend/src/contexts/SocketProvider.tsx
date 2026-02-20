import React, { useEffect, useState, useMemo, type ReactNode } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { SocketContext } from './socket';

interface SocketProviderProps {
    children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const { accessToken } = useSelector((state: RootState) => state.auth);

    const socket = useMemo(() => {
        if (!accessToken) return null;

        const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        return io(socketUrl, {
            auth: {
                token: accessToken
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            autoConnect: false
        });
    }, [accessToken]);

    useEffect(() => {
        if (!socket) return;

        socket.on('connect', () => {
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        socket.on('connect_error', () => {
            setIsConnected(false);
        });

        socket.connect();

        return () => {
            socket.disconnect();
            socket.off('connect');
            socket.off('disconnect');
            socket.off('connect_error');
        };
    }, [socket]);

    
    const effectiveIsConnected = socket ? isConnected : false;

    const contextValue = useMemo(() => ({
        socket,
        isConnected: effectiveIsConnected
    }), [socket, effectiveIsConnected]);

    return (
        <SocketContext.Provider value={contextValue}>
            {children}
        </SocketContext.Provider>
    );
};
