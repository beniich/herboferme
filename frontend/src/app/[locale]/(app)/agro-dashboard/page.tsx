'use client';

export default function AgroDashboardPage() {
    return (
        <iframe
            src="/agro-dashboard.html"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                border: 'none',
                zIndex: 9999,
                background: '#0b0f0a',
            }}
            title="AgroMa  tre     Tableau de Bord Agricole"
        />
    );
}
