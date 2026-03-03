// useSocket     Adapt   aux cookies HttpOnly (pas de token en localStorage)
import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/providers/AuthProvider';

let socket: Socket | null = null;

export const useSocket = () => {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:2065';
        socket = io(URL, {
            withCredentials: true, // Envoie les cookies HttpOnly
        });

        socket.on('connect', () => console.log('     WebSocket connect  '));
        socket.on('assignment-updated', (payload) => {
            console.log('     Assignment mis    jour', payload);
        });
        socket.on('new-complaint', (payload) => {
            console.log('     Nouvelle r  clamation', payload);
        });

        return () => {
            socket?.disconnect();
        };
    }, [user]);

    return socket;
};
