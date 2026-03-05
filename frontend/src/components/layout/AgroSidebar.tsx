'use client';

import React, { useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';

import { 
  LayoutDashboard, 
  BarChart3, 
  Map as MapIcon, 
  CloudSun, 
  Beef, 
  Bird, 
  Navigation, 
  Leaf, 
  Sprout, 
  Flower2, 
  Droplets, 
  Trees, 
  Home, 
  Truck, 
  BookOpen, 
  Wallet, 
  Users, 
  CalendarCheck, 
  CheckSquare, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Package, 
  Library, 
  AlertCircle, 
  ThumbsUp, 
  Activity,
  Settings,
  Cpu,
  Ticket,
  Server
} from 'lucide-react';

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: string | number;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navConfig: NavSection[] = [
  {
    title: 'PILOTAGE & ANALYTICS',
    items: [
      { href: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Vue Générale' },
      { href: '/analytics', icon: <BarChart3 size={18} />, label: 'Analytics & KPIs' },
      { href: '/map', icon: <MapIcon size={18} />, label: 'Carte Interactive' },
      { href: '/iot', icon: <Cpu size={18} />, label: 'Dashboard IoT' },
      { href: '/meteo', icon: <CloudSun size={18} />, label: 'Météo & Environnement' },
    ],
  },
  {
    title: 'EXPLOITATION AGRICOLE',
    items: [
      { href: '/elevage', icon: <Beef size={18} />, label: 'Élevage Bovin/Ovin' },
      { href: '/volaille', icon: <Bird size={18} />, label: 'Ferme Avicole', badge: '!', badgeColor: 'red' },
      { href: '/parcelles', icon: <Navigation size={18} />, label: 'Parcelles & Cultures' },
      { href: '/herbes', icon: <Leaf size={18} />, label: 'Herbes & Aromates' },
      { href: '/legumes', icon: <Sprout size={18} />, label: 'Légumes & Fruits' },
      { href: '/pepiniere', icon: <Flower2 size={18} />, label: 'Pépinière' },
      { href: '/irrigation', icon: <Droplets size={18} />, label: 'Irrigation & Eau' },
    ],
  },
  {
    title: 'PATRIMOINE & FLOTTE',
    items: [
      { href: '/foret', icon: <Trees size={18} />, label: 'Gestion Forestière' },
      { href: '/domaine', icon: <Home size={18} />, label: 'Domaine & Infrastructure' },
      { href: '/fleet', icon: <Truck size={18} />, label: 'Équipements & Flotte' },
    ],
  },
  {
    title: 'ADMINISTRATION & RH',
    items: [
      { href: '/teams', icon: <Users size={18} />, label: 'Équipes' },
      { href: '/roster', icon: <CalendarCheck size={18} />, label: 'Planning RH' },
      { href: '/tasks', icon: <CheckSquare size={18} />, label: 'Tâches' },
      { href: '/planning', icon: <Calendar size={18} />, label: 'Calendrier' },
      { href: '/messages', icon: <MessageSquare size={18} />, label: 'Messages' },
    ],
  },
  {
    title: 'GESTION & RESSOURCES',
    items: [
      { href: '/comptabilite', icon: <BookOpen size={18} />, label: 'Comptabilité' },
      { href: '/budget', icon: <Wallet size={18} />, label: 'Budget & Finance' },
      { href: '/reports', icon: <FileText size={18} />, label: 'Rapports & Export' },
      { href: '/inventory', icon: <Package size={18} />, label: 'Inventaire' },
      { href: '/knowledge', icon: <Library size={18} />, label: 'Base de Connaissance' },
    ],
  },
  {
    title: 'IT & SUPPORT',
    items: [
      { href: '/it-admin', icon: <Server size={18} />, label: 'Admin IT' },
      { href: '/it-admin/glpi', icon: <Ticket size={18} />, label: 'GLPI — Tickets' },
      { href: '/complaints', icon: <AlertCircle size={18} />, label: 'Réclamations', badge: '2', badgeColor: 'gold' },
      { href: '/feedback', icon: <ThumbsUp size={18} />, label: 'Feedback' },
      { href: '/audit-logs', icon: <Activity size={18} />, label: 'Journaux d\'Audit' },
      { href: '/settings', icon: <Settings size={18} />, label: 'Paramètres' },
    ],
  },
];

export default function AgroSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/' || pathname?.endsWith('/dashboard');
    }
    return pathname?.includes(path) ? 'active' : '';
  };

  const getBadgeStyle = (color?: string) => {
    if (!color) return {};
    const map: Record<string, string> = {
      red: 'rgba(192,57,43,0.2)',
      gold: 'rgba(200,146,26,0.2)',
      green: 'rgba(90,158,69,0.2)',
      blue: 'rgba(58,122,184,0.2)',
    };
    const textMap: Record<string, string> = {
      red: 'var(--red)',
      gold: 'var(--gold2)',
      green: 'var(--green2)',
      blue: 'var(--blue)',
    };
    return { background: map[color] || map.red, color: textMap[color] || textMap.red };
  };

  return (
    <div className={`sidebar${collapsed ? ' sidebar-collapsed' : ''}`}>
      {/* Collapse toggle */}
      <button
        className="sidebar-collapse-btn"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Développer' : 'Réduire'}
      >
        {collapsed ? '›' : '‹'}
      </button>

      {navConfig.map((section) => (
        <React.Fragment key={section.title}>
          {!collapsed && (
            <div className="nav-section">{section.title}</div>
          )}
          {section.items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${active}`}
                title={collapsed ? item.label : undefined}
              >
                <span className="ni">{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="nav-label">{item.label}</span>
                    {item.badge && (
                      <span className="badge" style={getBadgeStyle(item.badgeColor)}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </React.Fragment>
      ))}

      <div className="sidebar-footer">
        {!collapsed ? (
          <div className="sidebar-farm">
            <div className="farm-icon">🏡</div>
            <div>
              <div className="farm-name">Al Baraka</div>
              <div className="farm-type">340 HA · MAROC</div>
            </div>
          </div>
        ) : (
          <div className="sidebar-farm" style={{ justifyContent: 'center' }}>
            <div className="farm-icon">🏡</div>
          </div>
        )}
      </div>
    </div>
  );
}
