"use client"

import api from "@/lib/api"
import { CheckCircle, Cloud, HardDrive, Loader2, Save } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function ExportSettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [orgId, setOrgId] = useState<string | null>(null)
    const [settings, setSettings] = useState({
        exportStorage: 'local' as 'local' | 'google_drive',
        googleDriveFolderId: '',
        googleDriveRefreshToken: ''
    })

    useEffect(() => {
        const fetchOrg = async () => {
            try {
                const res: any = await api.get('/organizations')
                if (res?.organizations?.length > 0) {
                    const org = res.organizations[0]
                    setOrgId(org._id)
                    setSettings({
                        exportStorage: org.settings?.exportStorage || 'local',
                        googleDriveFolderId: org.settings?.googleDriveFolderId || '',
                        googleDriveRefreshToken: org.settings?.googleDriveRefreshToken || ''
                    })
                }
            } catch (err) {
                toast.error("Impossible de charger les param  tres")
            } finally {
                setLoading(false)
            }
        }
        fetchOrg()
    }, [])

    const handleSave = async () => {
        if (!orgId) return
        setSaving(true)
        try {
            await api.patch(`/organizations/${orgId}`, { settings })
            toast.success("Param  tres sauvegard  s avec succ  s !")
        } catch (err: any) {
            toast.error(err?.message || "Erreur lors de la sauvegarde")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-8 bg-slate-950 min-h-screen">
            <div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tight">Param  tres d'Export</h1>
                <p className="text-slate-500 text-sm mt-1">Choisissez o   les fichiers Excel seront sauvegard  s lors d'un export.</p>
            </div>

            {/* Storage Mode Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => setSettings(s => ({ ...s, exportStorage: 'local' }))}
                    className={`relative p-6 rounded-2xl border-2 text-left transition-all flex flex-col gap-3 ${
                        settings.exportStorage === 'local'
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-white/5 bg-slate-900 hover:border-white/10'
                    }`}
                >
                    {settings.exportStorage === 'local' && (
                        <CheckCircle className="absolute top-4 right-4 w-5 h-5 text-blue-500" />
                    )}
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-500/20 p-3 rounded-xl">
                            <HardDrive className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="font-black text-white">Serveur Local</p>
                            <p className="text-[11px] text-slate-500 font-medium">Stockage dans /exports sur le serveur</p>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400">
                        Les fichiers seront sauvegard  s sur le serveur backend et accessibles via un lien de t  l  chargement direct.
                    </p>
                </button>

                <button
                    onClick={() => setSettings(s => ({ ...s, exportStorage: 'google_drive' }))}
                    className={`relative p-6 rounded-2xl border-2 text-left transition-all flex flex-col gap-3 ${
                        settings.exportStorage === 'google_drive'
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-white/5 bg-slate-900 hover:border-white/10'
                    }`}
                >
                    {settings.exportStorage === 'google_drive' && (
                        <CheckCircle className="absolute top-4 right-4 w-5 h-5 text-green-500" />
                    )}
                    <div className="flex items-center gap-3">
                        <div className="bg-green-500/20 p-3 rounded-xl">
                            <Cloud className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <p className="font-black text-white">Google Drive</p>
                            <p className="text-[11px] text-slate-500 font-medium">Stockage cloud automatique</p>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400">
                        Les fichiers seront envoy  s automatiquement dans le dossier Google Drive configur  .
                    </p>
                </button>
            </div>

            {/* Google Drive Config (shown only when google_drive selected) */}
            {settings.exportStorage === 'google_drive' && (
                <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 space-y-4 animate-in fade-in duration-300">
                    <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Cloud className="w-4 h-4 text-green-500" />
                        Configuration Google Drive
                    </h2>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">ID du Dossier Drive (optionnel)</label>
                        <input
                            type="text"
                            value={settings.googleDriveFolderId}
                            onChange={(e) => setSettings(s => ({ ...s, googleDriveFolderId: e.target.value }))}
                            placeholder="ex: 1A2B3C4D5E6F7G8H..."
                            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-green-500 transition-colors"
                        />
                        <p className="text-[10px] text-slate-600">Laissez vide pour sauvegarder dans le Drive racine.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Refresh Token OAuth2</label>
                        <input
                            type="password"
                            value={settings.googleDriveRefreshToken}
                            onChange={(e) => setSettings(s => ({ ...s, googleDriveRefreshToken: e.target.value }))}
                            placeholder="Obtenez-le via Google OAuth2 Playground"
                            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-green-500 transition-colors"
                        />
                        <p className="text-[10px] text-slate-600">
                            Requis. Obtenez-le depuis{" "}
                            <a href="https://developers.google.com/oauthplayground" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline">
                                Google OAuth Playground
                            </a>.
                        </p>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-400">
                        <strong>Variables d'environnement requises</strong> sur le serveur backend : <code>GOOGLE_CLIENT_ID</code>, <code>GOOGLE_CLIENT_SECRET</code>, <code>GOOGLE_REDIRECT_URI</code>.
                    </div>
                </div>
            )}

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white px-8 py-3 rounded-xl font-black text-sm transition-all shadow-lg shadow-blue-900/30"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Sauvegarder les param  tres
                </button>
            </div>
        </div>
    )
}
