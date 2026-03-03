'use client';

import { useState } from 'react';
import { useCall } from '@/providers/CallProvider';
import { useAuthStore } from '@/store/authStore';

export default function CommunicationPage() {
    const { user } = useAuthStore();
    const { callUser, callState, endCall } = useCall();
    const [targetId, setTargetId] = useState('');

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Secure Communication (SRTP)</h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Demonstration of Secure Real-time Transport Protocol (SRTP) via WebRTC.
                    All calls are end-to-end encrypted by default.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Your Identity Card */}
                <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        My Identity
                    </h2>
                    <div className="space-y-4">
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                            <label className="text-xs text-slate-500 uppercase font-medium">My User ID</label>
                            <div className="font-mono text-sm mt-1 select-all break-all">{user?.id}</div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                            <label className="text-xs text-slate-500 uppercase font-medium">Name</label>
                            <div className="font-medium mt-1">{user?.name}</div>
                        </div>
                    </div>
                </div>

                {/* Make a Call Card */}
                <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        Start Secure Call
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Target User ID</label>
                            <input
                                type="text"
                                value={targetId}
                                onChange={(e) => setTargetId(e.target.value)}
                                placeholder="Paste ID here..."
                                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => callUser(targetId)}
                                disabled={!targetId || callState !== 'idle'}
                                className={`flex-1 py-2 px-4 rounded-lg font-medium text-white shadow-lg transition-all ${!targetId || callState !== 'idle'
                                        ? 'bg-slate-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700 active:scale-95'
                                    }`}
                            >
                                {callState === 'idle' ? 'Start Encrypted Call' : 'Call in Progress...'}
                            </button>
                        </div>

                        {callState !== 'idle' && (
                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm flex items-center gap-2">
                                <span className="animate-spin">   </span> Status: {callState}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 p-6 bg-slate-900 rounded-xl text-slate-300">
                <h3 className="text-white font-semibold mb-2">How SRTP is Integrated</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>This module uses <strong>WebRTC</strong> (Web Real-Time Communication).</li>
                    <li>WebRTC mandates <strong>SRTP (Secure Real-time Transport Protocol)</strong> for all audio and video streams.</li>
                    <li>Currently using public STUN servers (Google/Twilio) for NAT traversal.</li>
                    <li>Signaling is handled securely via your existing Websocket infrastructure.</li>
                    <li>Keys are exchanged via DTLS-SRTP handshake automatically.</li>
                </ul>
            </div>
        </div>
    );
}
