'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

// WebRTC Configuration using public STUN servers
const RTC_CONFIG = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
    ]
};

interface CallContextType {
    callUser: (userId: string) => void;
    answerCall: () => void;
    rejectCall: () => void;
    endCall: () => void;
    callState: 'idle' | 'calling' | 'incoming' | 'connected';
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    callerInfo: { id: string; name: string } | null;
}

const CallContext = createContext<CallContextType | null>(null);

export const useCall = () => {
    const context = useContext(CallContext);
    if (!context) throw new Error('useCall must be used within a CallProvider');
    return context;
};

export const CallProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuthStore();
    // Use underscore to indicate unused variable, or remove it. Keeping it for potential socket state access.
    const [_socket, setSocket] = useState<Socket | null>(null);
    const [callState, setCallState] = useState<'idle' | 'calling' | 'incoming' | 'connected'>('idle');
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [callerInfo, setCallerInfo] = useState<{ id: string; name: string } | null>(null);
    const [incomingCallData, setIncomingCallData] = useState<{ from: string; signal: RTCSessionDescriptionInit } | null>(null);

    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const targetUserIdRef = useRef<string | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    const endCall = useCallback(() => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        if (remoteStream) {
            setRemoteStream(null);
        }
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
        setCallState('idle');
        setIncomingCallData(null);
        setCallerInfo(null);
        targetUserIdRef.current = null;
    }, [localStream, remoteStream]);

    // Initialize Socket Connection
    useEffect(() => {
        if (!user) return;

        const URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        // Remove /api if present for socket connection
        const socketUrl = URL.replace(/\/api\/?$/, '');

        const newSocket = io(socketUrl, {
            path: '/socket.io/',
            withCredentials: true,
            transports: ['websocket']
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('     Call Socket Connected');
            newSocket.emit('join-rooms', [`user:${user.id}`]);
        });

        newSocket.on('call-made', (data: { signal: RTCSessionDescriptionInit; from: string; fromName?: string }) => {
            console.log('     Incoming Call from:', data.from);
            setIncomingCallData(data);
            setCallerInfo({ id: data.from, name: data.fromName || 'Unknown Caller' });
            setCallState('incoming');
        });

        newSocket.on('call-answered', async (data: { signal: RTCSessionDescriptionInit; from: string }) => {
            console.log('     Call Answered by:', data.from);
            if (peerConnection.current) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.signal));
                setCallState('connected');
            }
        });

        newSocket.on('ice-candidate', async (data: { candidate: RTCIceCandidateInit }) => {
            if (peerConnection.current) {
                try {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (e) {
                    console.error('Error adding received ice candidate', e);
                }
            }
        });

        newSocket.on('call-rejected', () => {
            alert('Call was rejected');
            endCall();
        });

        return () => {
            newSocket.disconnect();
        };
    }, [user, endCall]);

    const initializePeerConnection = useCallback(() => {
        const pc = new RTCPeerConnection(RTC_CONFIG);

        pc.onicecandidate = (event) => {
            if (event.candidate && socketRef.current && targetUserIdRef.current) {
                socketRef.current.emit('ice-candidate', {
                    to: targetUserIdRef.current,
                    candidate: event.candidate
                });
            }
        };

        pc.ontrack = (event) => {
            console.log('     Received Remote Stream', event.streams[0]);
            setRemoteStream(event.streams[0]);
        };

        return pc;
    }, []);

    const callUser = async (userId: string) => {
        if (!socketRef.current) return;
        setCallState('calling');
        setCallerInfo({ id: userId, name: 'Calling...' });
        targetUserIdRef.current = userId;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);

            const pc = initializePeerConnection();
            peerConnection.current = pc;

            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socketRef.current.emit('call-user', {
                userToCall: userId,
                signalData: offer,
                from: user?.id,
                fromName: user?.name
            });
        } catch (err) {
            console.error('Error starting call:', err);
            endCall();
        }
    };

    const answerCall = async () => {
        if (!incomingCallData || !socketRef.current) return;
        setCallState('connected');
        targetUserIdRef.current = incomingCallData.from;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);

            const pc = initializePeerConnection();
            peerConnection.current = pc;

            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            await pc.setRemoteDescription(new RTCSessionDescription(incomingCallData.signal));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socketRef.current.emit('answer-call', {
                signal: answer,
                to: incomingCallData.from
            });
        } catch (err) {
            console.error('Error answering call:', err);
            endCall();
        }
    };

    const rejectCall = () => {
        if (incomingCallData && socketRef.current) {
            socketRef.current.emit('reject-call', { to: incomingCallData.from });
        }
        endCall();
    };

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    return (
        <CallContext.Provider value={{ callUser, answerCall, rejectCall, endCall, callState, localStream, remoteStream, callerInfo }}>
            {children}
            {(callState !== 'idle') && (
                <div className="fixed bottom-4 right-4 w-96 bg-white dark:bg-slate-800 shadow-2xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 z-[9999] animate-in slide-in-from-bottom-10 fade-in zoom-in-95 duration-300">
                    {/* Header */}
                    <div className="p-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex justify-between items-center shadow-sm">
                        <div className="flex flex-col">
                            <span className="font-bold text-sm">
                                {callState === 'incoming' ? 'Appel Entrant...' :
                                    callState === 'calling' ? 'Appel en cours...' :
                                        'Connect  '}
                            </span>
                            {callerInfo && <span className="text-xs opacity-90">{callerInfo.name}</span>}
                        </div>
                        <div className="flex gap-2">
                            <span className="animate-pulse w-2 h-2 bg-green-400 rounded-full"></span>
                        </div>
                    </div>

                    {/* Video Area */}
                    <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group">
                        {(remoteStream || callState === 'connected') ? (
                            <video
                                autoPlay
                                playsInline
                                ref={remoteVideoRef}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                                <span className="text-xs">En attente de vid  o...</span>
                            </div>
                        )}

                        {/* Local Video Picture-in-Picture */}
                        {localStream && (
                            <div className="absolute bottom-3 right-3 w-28 aspect-video bg-slate-900 rounded-lg border border-white/10 shadow-lg overflow-hidden transition-transform group-hover:scale-105">
                                <video
                                    autoPlay
                                    playsInline
                                    muted
                                    ref={localVideoRef}
                                    className="w-full h-full object-cover transform scale-x-[-1]"
                                />
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="p-4 flex justify-center gap-6 bg-slate-50 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800">
                        {callState === 'incoming' ? (
                            <>
                                <button
                                    onClick={answerCall}
                                    className="flex flex-col items-center gap-1 group"
                                >
                                    <div className="p-3 bg-green-500 group-hover:bg-green-600 rounded-full text-white shadow-lg shadow-green-500/30 transition-all transform group-hover:scale-110">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    </div>
                                    <span className="text-[10px] font-medium text-green-600 dark:text-green-400">Accepter</span>
                                </button>

                                <button
                                    onClick={rejectCall}
                                    className="flex flex-col items-center gap-1 group"
                                >
                                    <div className="p-3 bg-red-500 group-hover:bg-red-600 rounded-full text-white shadow-lg shadow-red-500/30 transition-all transform group-hover:scale-110">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </div>
                                    <span className="text-[10px] font-medium text-red-600 dark:text-red-400">Refuser</span>
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={endCall}
                                className="flex items-center gap-2 px-6 py-2 bg-red-500 hover:bg-red-600 rounded-full text-white shadow-lg shadow-red-500/20 font-medium text-sm transition-all transform hover:scale-105"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2 2m7.5 12.5a14.5 14.5 0 01-21.49-3.35L4.5 12l2.5-2.5 14.5 14.5z" /></svg>
                                Raccrocher
                            </button>
                        )}
                    </div>
                </div>
            )}
        </CallContext.Provider>
    );
};
