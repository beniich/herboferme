'use client';

import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface FirewallLog {
    timestamp: string;
    interface: string;
    action: 'pass' | 'block' | 'reject';
    protocol: string;
    srcIP: string;
    dstIP: string;
    srcPort?: number;
    dstPort?: number;
}

export interface SecurityAlert {
    timestamp: string;
    type: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
}

export const useSecuritySocket = () => {
    const { user } = useAuthStore();
    const [firewallLogs, setFirewallLogs] = useState<FirewallLog[]>([]);
    const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!user) return;

        const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        const socket: Socket = io(`${SOCKET_URL}/security`, {
            withCredentials: true,
            transports: ['websocket'],
        });

        socket.on('connect', () => {
            console.log('     Connected to Security WebSocket');
            setIsConnected(true);
            socket.emit('join-room', 'pfsense-logs');
        });

        socket.on('firewall:log', (log: FirewallLog) => {
            setFirewallLogs((prev) => [log, ...prev].slice(0, 100));
        });

        socket.on('security:alert', (alert: SecurityAlert) => {
            setSecurityAlerts((prev) => [alert, ...prev].slice(0, 50));
        });

        socket.on('disconnect', () => {
            console.log('     Disconnected from Security WebSocket');
            setIsConnected(false);
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    return { firewallLogs, securityAlerts, isConnected };
};
