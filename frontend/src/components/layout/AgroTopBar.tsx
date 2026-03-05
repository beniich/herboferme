'use client';

import React, { useEffect, useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useOrgStore } from '@/store/orgStore';
import { 
  Bell, 
  Plus, 
  ChevronRight, 
  Sprout, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { CurrencySelector } from '@/components/ui/CurrencySelector';

const routeLabels: Record<string, string> = {
  '/dashboard': 'Vue Générale',
  '/analytics': 'Analytics & KPIs',
  '/map': 'Carte Interactive',
  '/meteo': 'Météo & Environnement',
  '/elevage': 'Élevage Bovin/Ovin',
  '/volaille': 'Ferme Avicole',
  '/parcelles': 'Parcelles & Cultures',
  '/herbes': 'Herbes & Aromates',
  '/legumes': 'Légumes & Fruits',
  '/pepiniere': 'Pépinière',
  '/irrigation': 'Irrigation & Eau',
  '/foret': 'Gestion Forestière',
  '/domaine': 'Domaine & Infrastructure',
  '/fleet': 'Équipements & Flotte',
  '/comptabilite': 'Comptabilité',
  '/budget': 'Budget & Finance',
  '/teams': 'Équipes',
  '/roster': 'Planning RH',
  '/tasks': 'Tâches',
  '/planning': 'Calendrier',
  '/messages': 'Messages',
  '/reports': 'Rapports & Export',
  '/inventory': 'Inventaire',
  '/knowledge': 'Base de Connaissance',
  '/complaints': 'Réclamations',
  '/feedback': 'Feedback',
  '/audit-logs': "Journaux d'Audit",
  '/settings': 'Paramètres',
  '/it-admin': 'Admin IT',
  '/admin': 'Administration',
  '/super-admin': 'Super Admin',
  '/citizen': 'Citoyens',
  '/technician': 'Techniciens',
};

export default function AgroTopBar() {
  const { user, logout } = useAuth();
  const { activeOrganization } = useOrgStore();
  const pathname = usePathname();
  const [currentDate, setCurrentDate] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    );
  }, []);

  const getBreadcrumb = () => {
    if (!pathname) return 'Vue Générale';
    const segments = pathname.split('/').filter(Boolean);
    for (let i = segments.length - 1; i >= 0; i--) {
      const key = '/' + segments[i];
      if (routeLabels[key]) return routeLabels[key];
    }
    return 'Vue Générale';
  };

  const userInitials = user
    ? `${user.prenom ? user.prenom[0] : ''}${user.nom ? user.nom[0] : ''}`.toUpperCase()
    : 'A';

  return (
    <div className="topbar glass-effect" style={{
      height: '64px',
      background: 'var(--glass)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      gap: '12px',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <div className="logo-icon" style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, var(--green), var(--green2))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', flexShrink: 0
        }}>
          <Sprout size={18} />
        </div>
        <div className="hidden sm:block">
          <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', letterSpacing: '-0.02em' }}>AgroMaître</div>
          <div style={{ fontSize: '9px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Domaine Agricole</div>
        </div>
      </div>

      {/* Breadcrumb — hidden on small screens */}
      <div className="hidden md:flex" style={{ alignItems: 'center', gap: '6px', fontSize: '13px', flex: 1, overflow: 'hidden' }}>
        <Link href="/dashboard" style={{ color: 'var(--text3)', textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
          {activeOrganization?.name || 'AgroMaître'}
        </Link>
        <ChevronRight size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
        <span id="breadcrumb" style={{ color: 'var(--gold)', fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getBreadcrumb()}</span>
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        {/* Date — desktop only */}
        <div className="hidden lg:block" style={{ fontSize: '12px', color: 'var(--text3)', whiteSpace: 'nowrap' }}>{currentDate}</div>

        {/* Currency Selector */}
        <CurrencySelector compact />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Link href="/complaints" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ 
            cursor: 'pointer', padding: '7px', borderRadius: '8px',
            background: 'var(--bg3)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'var(--text2)', position: 'relative'
          }}>
            <Bell size={17} />
            <span style={{
              position: 'absolute', top: '-3px', right: '-3px',
              width: '15px', height: '15px',
              background: 'var(--red)', border: '2px solid var(--bg)',
              borderRadius: '50%', fontSize: '9px', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700'
            }}>2</span>
          </div>
        </Link>

        {/* User / Logout */}
        <div
          className="hidden sm:flex"
          onClick={logout}
          style={{
            alignItems: 'center', gap: '8px',
            padding: '4px 10px 4px 4px', borderRadius: '24px',
            background: 'var(--bg3)', cursor: 'pointer',
            border: '1px solid var(--border)'
          }}
        >
          <div style={{
            width: '26px', height: '26px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #215E61, #0a1a1b)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: '700', color: 'white'
          }}>
            {userInitials}
          </div>
          <span className="hidden md:inline" style={{ fontSize: '12px', color: 'var(--text2)', fontWeight: '500', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.prenom || 'Admin'}
          </span>
          <LogOut size={13} style={{ color: 'var(--text3)' }} />
        </div>

        {/* Quick Task button — desktop */}
        <Link href="/tasks" style={{ textDecoration: 'none' }} className="hidden lg:block">
          <button style={{
            padding: '7px 14px', borderRadius: '8px',
            background: 'var(--gold)', color: 'white',
            fontSize: '12px', fontWeight: '700', border: 'none',
            display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}>
            <Plus size={14} />
            <span>Tâche</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
