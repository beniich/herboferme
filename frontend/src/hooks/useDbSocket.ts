import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export const useDbSocket = (namespace: string) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        // Le namespace doit commencer par /
        const nsp = namespace.startsWith('/') ? namespace : `/${namespace}`;
        // L'URL compl  te inclut le namespace pour socket.io client
        // ex: http://localhost:5001/logs
        // Mais attention, socket.io client g  re les namespaces diff  remment selon la version/config
        // Pour socket.io v4, on passe l'URL + le pathOptionnel si besoin, mais ici c'est un namespace

        // Si SOCKET_URL finit par /api, on doit probablement l'enlever pour avoir la racine
        const baseUrl = SOCKET_URL.replace(/\/api\/?$/, '');

        const socketInstance = io(`${baseUrl}${nsp}`, {
            transports: ['websocket'],
            path: '/socket.io/', // chemin par d  faut du serveur socket.io
        });

        socketRef.current = socketInstance;
        setSocket(socketInstance);

        socketInstance.on('connect', () => {
            console.log(`     Connect   au namespace ${nsp}`);
        });

        socketInstance.on('connect_error', (err) => {
            console.error(`    Erreur connexion ${nsp}:`, err);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                console.log(`     D  connect   du namespace ${nsp}`);
            }
        };
    }, [namespace]);

    return socket;
};
