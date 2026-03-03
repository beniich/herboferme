'use client';

export default function LandingPage() {
    return (
        <iframe
            src="/agrosync.html"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                border: 'none',
                zIndex: 9999,
                background: '#1a1209',
            }}
            title="AgroSync     Farm Intelligence Platform"
        />
    );
}
