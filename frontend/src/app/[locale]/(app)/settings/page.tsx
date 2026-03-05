'use client';

import React, { useState } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { useCurrencyStore, CURRENCIES, CurrencyCode } from '@/store/currencyStore';
import { 
    Settings, 
    Users, 
    Bell, 
    Shield, 
    CreditCard, 
    Palette, 
    Sun, 
    Moon, 
    Laptop,
    Save,
    Globe,
    Building2,
    Check,
    DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

const SETTINGS_TABS = [
    { id: 'profile',    label: 'Organisation',  icon: Building2,  labelFull: 'Organisation & Profil' },
    { id: 'currency',   label: 'Devise',         icon: DollarSign, labelFull: 'Devise & Locale' },
    { id: 'appearance', label: 'Apparence',       icon: Palette,    labelFull: 'Apparence' },
    { id: 'users',      label: 'Utilisateurs',   icon: Users,      labelFull: 'Utilisateurs & Rôles' },
    { id: 'notifications', label: 'Notifications', icon: Bell,     labelFull: 'Notifications' },
    { id: 'security',   label: 'Sécurité',        icon: Shield,    labelFull: 'Sécurité' },
    { id: 'billing',    label: 'Facturation',     icon: CreditCard, labelFull: 'Facturation' },
];

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text3)]">{label}</label>
            {children}
        </div>
    );
}

function SettingsInput({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-3 px-4 text-sm focus:border-[var(--gold)] outline-none transition-all text-[var(--text)]"
        />
    );
}

function SettingsSelect({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select
            {...props}
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-3 px-4 text-sm focus:border-[var(--gold)] outline-none transition-all text-[var(--text)] appearance-none"
        >
            {children}
        </select>
    );
}

export default function SettingsPage() {
    const [activeTab, setActiveTab]   = useState('profile');
    const { theme, setTheme }         = useTheme();
    const { currency, setCurrency, format } = useCurrencyStore();
    const [loading, setLoading]       = useState(false);

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success('Paramètres sauvegardés avec succès');
        }, 800);
    };

    const currentTab = SETTINGS_TABS.find(t => t.id === activeTab);

    return (
        <div className="page active" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div className="page-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Settings size={13} style={{ color: 'var(--gold)' }} />
                        Administration
                    </div>
                    <h1 className="page-title">Paramètres Généraux</h1>
                    <p className="page-sub" style={{ fontSize: '13px', opacity: 0.7 }}>Contrôlez l'écosystème de votre domaine agricole</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="btn btn-accent"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    {loading 
                        ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        : <Save size={16} />
                    }
                    Enregistrer
                </button>
            </div>

            {/* Tab nav — horizontal scrollable on mobile */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', flexWrap: 'nowrap' }} className="no-scrollbar">
                {SETTINGS_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '8px 14px', borderRadius: '12px', whiteSpace: 'nowrap',
                                fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer',
                                flexShrink: 0, transition: 'all 0.2s',
                                background: active ? 'var(--gold)' : 'var(--bg3)',
                                color: active ? 'white' : 'var(--text2)',
                                boxShadow: active ? '0 4px 12px var(--gold)/20' : 'none',
                            }}
                        >
                            <Icon size={15} />
                            <span className="hidden sm:inline">{tab.labelFull}</span>
                            <span className="sm:hidden">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Content Card */}
            <div style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                padding: '28px',
                minHeight: '360px'
            }}>
                <h3 style={{ fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: '28px' }}>
                    {currentTab?.labelFull}
                </h3>

                {/* ── PROFILE ─────────────────────────── */}
                {activeTab === 'profile' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                            <FieldGroup label="Nom de l'exploitation">
                                <SettingsInput type="text" defaultValue="Domaine Al Baraka" />
                            </FieldGroup>
                            <FieldGroup label="ID Légal / SIRET">
                                <SettingsInput type="text" defaultValue="MA-992-12345" />
                            </FieldGroup>
                            <FieldGroup label="Langue système">
                                <SettingsSelect>
                                    <option>Français (FR)</option>
                                    <option>Arabe (AR)</option>
                                    <option>Anglais (EN)</option>
                                </SettingsSelect>
                            </FieldGroup>
                            <FieldGroup label="Fuseau horaire">
                                <SettingsSelect>
                                    <option>Africa/Casablanca (UTC+1)</option>
                                    <option>Europe/Paris (UTC+2)</option>
                                    <option>UTC</option>
                                </SettingsSelect>
                            </FieldGroup>
                        </div>
                        <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', gap: '12px', color: '#d97706', fontSize: '12px' }}>
                            <Globe size={16} />
                            Ces modifications affecteront tous les utilisateurs du domaine.
                        </div>
                    </div>
                )}

                {/* ── CURRENCY ────────────────────────── */}
                {activeTab === 'currency' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                            {CURRENCIES.map((c) => {
                                const active = c.code === currency.code;
                                return (
                                    <button
                                        key={c.code}
                                        onClick={() => { setCurrency(c.code as CurrencyCode); toast.success(`Devise changée: ${c.label}`); }}
                                        style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                                            gap: '8px', padding: '16px', borderRadius: '16px', cursor: 'pointer',
                                            border: `2px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
                                            background: active ? 'rgba(255,140,58,0.08)' : 'var(--bg)',
                                            transition: 'all 0.2s', position: 'relative',
                                        }}
                                    >
                                        {active && (
                                            <div style={{ position: 'absolute', top: 10, right: 10, width: 18, height: 18, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Check size={11} color="white" />
                                            </div>
                                        )}
                                        <span style={{ fontSize: '28px' }}>{c.flag}</span>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '15px', color: active ? 'var(--gold)' : 'var(--text)' }}>{c.code}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{c.label}</div>
                                        </div>
                                        <div style={{ fontSize: '20px', fontWeight: 900, color: active ? 'var(--gold)' : 'var(--text2)' }}>{c.symbol}</div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Live preview */}
                        <div style={{ padding: '20px', borderRadius: '16px', background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text3)', marginBottom: '12px' }}>Aperçu du formatage</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                                {[150000, 50000, 1234.56, 9.99].map(n => (
                                    <div key={n} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{ fontSize: '10px', color: 'var(--text3)' }}>{n.toLocaleString()}</span>
                                        <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--gold)' }}>{format(n)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── APPEARANCE ──────────────────────── */}
                {activeTab === 'appearance' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
                            {([
                                { id: 'light',  label: 'Mode Clair',  IconComp: Sun,    bg: '#fef3c7', fg: '#d97706' },
                                { id: 'dark',   label: 'Mode Sombre', IconComp: Moon,   bg: '#1e293b', fg: '#94a3b8' },
                                { id: 'system', label: 'Système',     IconComp: Laptop, bg: '#e0e7ff', fg: '#4f46e5' },
                            ] as const).map(({ id, label, IconComp, bg, fg }) => (
                                <button
                                    key={id}
                                    onClick={() => setTheme(id)}
                                    style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
                                        padding: '24px 12px', borderRadius: '16px', cursor: 'pointer',
                                        border: `2px solid ${theme === id ? 'var(--gold)' : 'var(--border)'}`,
                                        background: theme === id ? 'rgba(255,140,58,0.06)' : 'var(--bg)',
                                        transition: 'all 0.2s',
                                        transform: theme === id ? 'scale(1.03)' : 'scale(1)',
                                    }}
                                >
                                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <IconComp size={24} />
                                    </div>
                                    <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: theme === id ? 'var(--gold)' : 'var(--text2)' }}>{label}</span>
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                            {[
                                { label: 'Mode Haute Performance', desc: 'Désactive les effets de flou (Glassmorphism) pour plus de fluidité.', active: false },
                                { label: "Animations d'interface", desc: 'Micro-interactions lors du survol et des clics.', active: true },
                            ].map(item => (
                                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{item.label}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>{item.desc}</div>
                                    </div>
                                    <div style={{ width: 44, height: 24, borderRadius: '99px', background: item.active ? 'var(--gold)' : 'var(--bg3)', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                                        <div style={{ position: 'absolute', top: 4, left: item.active ? 22 : 4, width: 16, height: 16, borderRadius: '50%', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── PLACEHOLDER TABS ────────────────── */}
                {!['profile', 'currency', 'appearance'].includes(activeTab) && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '240px', gap: '16px', textAlign: 'center' }}>
                        <div style={{ padding: '16px', borderRadius: '50%', background: 'var(--bg)', color: 'var(--text3)' }}>
                            <Settings size={36} style={{ opacity: 0.4 }} />
                        </div>
                        <h3 style={{ fontWeight: 700, color: 'var(--text2)', fontSize: '15px' }}>Section en cours de migration</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text3)', maxWidth: '360px' }}>
                            Nous migrons actuellement toutes les fonctionnalités vers le nouveau moteur AgroMaître v2. Cette section sera disponible sous peu.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
