'use client'

import { useState } from 'react'

export default function MailboxPage() {
    const [syncAttachments, setSyncAttachments] = useState(true)
    const [realtimeNotifications, setRealtimeNotifications] = useState(false)
    const [sameAsIncoming, setSameAsIncoming] = useState(true)

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen font-display">
            {/* Navigation / Header */}
            <nav className="border-b border-primary/10 bg-white/50 dark:bg-background-dark/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-white">mail</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight">Mailbox Configuration</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Manage your incoming and outgoing mail servers
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 px-4 py-2 bg-primary/5 dark:bg-primary/10 rounded-full border border-primary/20">
                            <div className="relative flex h-3 w-3">
                                <span className="pulse-indicator absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </div>
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                Connection Active
                            </span>
                        </div>
                        <button className="text-slate-400 hover:text-white transition-colors">
                            <span className="material-symbols-outlined">help_outline</span>
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-12 gap-8">
                    {/* Left Column: Auto-Detect & General */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">
                        <div className="bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/10 rounded-xl p-6">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
                                Quick Setup
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                Select your provider for automatic configuration of server settings.
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                {['Gmail', 'Outlook', 'iCloud', 'Custom'].map((provider, idx) => (
                                    <button
                                        key={provider}
                                        className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${idx === 1
                                                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                                : 'border-slate-200 dark:border-primary/20 bg-slate-50 dark:bg-background-dark hover:border-primary'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-2xl mb-2">
                                            {provider === 'Custom' ? 'settings_ethernet' : 'mail'}
                                        </span>
                                        <span className="text-xs font-medium">{provider}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-primary/10">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-medium">Sync Attachments</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={syncAttachments}
                                            onChange={(e) => setSyncAttachments(e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Real-time Notifications</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={realtimeNotifications}
                                            onChange={(e) => setRealtimeNotifications(e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="bg-primary/5 border border-primary/10 rounded-xl p-6">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary">info</span>
                                <div>
                                    <h3 className="text-sm font-semibold mb-1">Security Recommendation</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        We recommend using App Passwords if you have Two-Factor Authentication enabled on
                                        your provider account.
                                    </p>
                                    <a
                                        href="#"
                                        className="text-xs text-primary font-medium mt-2 inline-block hover:underline"
                                    >
                                        Learn more about security
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Form Sections */}
                    <div className="col-span-12 lg:col-span-8 space-y-6">
                        {/* IMAP Settings */}
                        <div className="bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/10 rounded-xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-primary/10 bg-slate-50 dark:bg-primary/10 flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">south_west</span>
                                <h2 className="font-bold">IMAP Configuration (Incoming)</h2>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Server Hostname</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        defaultValue="imap-mail.outlook.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Port</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        defaultValue="993"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Security Encryption</label>
                                    <select className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all">
                                        <option>SSL / TLS</option>
                                        <option>STARTTLS</option>
                                        <option>None</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Authentication Method</label>
                                    <select className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all">
                                        <option>Password / OAuth2</option>
                                        <option>CRAM-MD5</option>
                                        <option>NTLM</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Username</label>
                                    <input
                                        type="email"
                                        className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        defaultValue="alex.rivera@outlook.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Password</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                            defaultValue="                                    "
                                        />
                                        <button className="absolute right-3 top-2.5 text-slate-400 hover:text-primary">
                                            <span className="material-symbols-outlined text-xl">visibility_off</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SMTP Settings */}
                        <div className="bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/10 rounded-xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-primary/10 bg-slate-50 dark:bg-primary/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">north_east</span>
                                    <h2 className="font-bold">SMTP Configuration (Outgoing)</h2>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="rounded border-primary text-primary focus:ring-primary bg-background-dark"
                                        checked={sameAsIncoming}
                                        onChange={(e) => setSameAsIncoming(e.target.checked)}
                                    />
                                    <span className="text-xs font-medium text-slate-400">Same as Incoming</span>
                                </label>
                            </div>
                            <div
                                className={`p-6 grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity ${sameAsIncoming ? 'opacity-60 pointer-events-none' : ''
                                    }`}
                            >
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Server Hostname</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        defaultValue="smtp-mail.outlook.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Port</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        defaultValue="587"
                                    />
                                </div>
                            </div>
                            {sameAsIncoming && (
                                <div className="px-6 pb-6">
                                    <div className="flex items-center gap-3 p-4 bg-primary/5 border border-dashed border-primary/30 rounded-lg">
                                        <span className="material-symbols-outlined text-primary">link</span>
                                        <p className="text-sm text-slate-400 italic">
                                            SMTP is currently linked to IMAP credentials. To use different credentials,
                                            uncheck &quot;Same as Incoming&quot; above.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Bar */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-primary/10">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-green-500 text-sm">history</span>
                                <span className="text-xs text-slate-500">
                                    Last successful connection: Today at 09:42 AM
                                </span>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg border border-primary/30 text-primary font-semibold hover:bg-primary/5 transition-colors">
                                    Test Connection
                                </button>
                                <button className="flex-1 sm:flex-none px-8 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95">
                                    Save & Sync
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Background Decoration */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full"></div>
            </div>
        </div>
    )
}
