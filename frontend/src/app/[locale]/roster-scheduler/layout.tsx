import React from 'react';
import { ReactNode } from 'react';

export default function RosterLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans antialiased">
            {/* On surcharge le layout global ici potentiellement, mais comme on est d  ja dans RootLayout,
                on doit s'assurer que Sidebar globale ne g  ne pas.
                Si RosterFlow a son propre header/sidebar full screen, on peut avoir besoin
                de masquer la navigation globale via une prop ou un context, ou simplement l'afficher dedans.
                Pour l'instant, on assume qu'on rend le contenu dans la zone principale.
            */}
            <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
                {children}
            </div>
        </div>
    );
}
