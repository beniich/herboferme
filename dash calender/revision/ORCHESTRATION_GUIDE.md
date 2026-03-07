# 🎭 Guide d'Orchestration FootballHub+ - Architecture Frontend Harmonieuse

## 📋 Table des Matières
1. [Vision d'Orchestration](#vision-dorchestration)
2. [Structure de l'Application](#structure-de-lapplication)
3. [Pages & Navigation](#pages--navigation)
4. [Composants Partagés](#composants-partagés)
5. [États Globaux](#états-globaux)
6. [Animations & Transitions](#animations--transitions)
7. [Guide d'Implémentation](#guide-dimplémentation)

---

## 🎯 Vision d'Orchestration

### Philosophie de Design

FootballHub+ suit une **approche holistique** où chaque page partage :
- **Design Tokens uniformes** (couleurs, espacements, typographie)
- **Composants UI réutilisables** (buttons, cards, badges)
- **Navigation cohérente** (bottom nav + header)
- **Animations synchronisées** (transitions de pages, micro-interactions)
- **Thème dark premium** avec or (#F2CC0D) comme accent signature

### Flux Utilisateur Principal

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  HOME → EVENTS → TICKETS → SHOP → PROFILE          │
│   ↓       ↓         ↓        ↓        ↓            │
│  Dashboard  Browse   My QR   Browse  Settings      │
│  Stats      Events   Codes   Merch   Account       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Structure de l'Application

### Architecture Complète

```
footballhub-frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx               # Layout global avec nav
│   │   ├── page.tsx                 # Home / Dashboard
│   │   │
│   │   ├── (public)/                # Routes publiques
│   │   │   ├── events/
│   │   │   │   ├── page.tsx         # Liste événements
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx     # Détail événement
│   │   │   │
│   │   │   └── shop/
│   │   │       ├── page.tsx         # Boutique
│   │   │       └── products/[id]/
│   │   │           └── page.tsx     # Détail produit
│   │   │
│   │   ├── (protected)/             # Routes protégées
│   │   │   ├── tickets/
│   │   │   │   ├── page.tsx         # Mes tickets
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx     # QR Code
│   │   │   │   └── scanner/
│   │   │   │       └── page.tsx     # Scanner (admin)
│   │   │   │
│   │   │   └── profile/
│   │   │       ├── page.tsx         # Profile
│   │   │       └── settings/
│   │   │           └── page.tsx     # Paramètres
│   │   │
│   │   └── (admin)/                 # Routes admin club
│   │       └── club/
│   │           ├── dashboard/
│   │           │   └── page.tsx     # Dashboard club
│   │           ├── members/
│   │           │   └── page.tsx     # Gestion membres
│   │           ├── events/
│   │           │   └── page.tsx     # Gestion événements
│   │           └── analytics/
│   │               └── page.tsx     # Analytics
│   │
│   ├── components/
│   │   ├── ui/                      # Composants de base
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Loading.tsx
│   │   │
│   │   ├── layout/                  # Composants layout
│   │   │   ├── Header.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   ├── PageContainer.tsx
│   │   │   └── Section.tsx
│   │   │
│   │   ├── features/                # Composants métier
│   │   │   ├── tickets/
│   │   │   │   ├── TicketCard.tsx
│   │   │   │   ├── QRDisplay.tsx
│   │   │   │   └── TicketScanner.tsx
│   │   │   │
│   │   │   ├── events/
│   │   │   │   ├── EventCard.tsx
│   │   │   │   ├── EventGrid.tsx
│   │   │   │   └── EventFilters.tsx
│   │   │   │
│   │   │   ├── shop/
│   │   │   │   ├── ProductCard.tsx
│   │   │   │   ├── ProductGrid.tsx
│   │   │   │   ├── Cart.tsx
│   │   │   │   └── CartButton.tsx
│   │   │   │
│   │   │   └── dashboard/
│   │   │       ├── StatsCard.tsx
│   │   │       ├── MiniChart.tsx
│   │   │       └── ActivityFeed.tsx
│   │   │
│   │   └── shared/
│   │       ├── Logo.tsx
│   │       ├── Avatar.tsx
│   │       └── EmptyState.tsx
│   │
│   ├── lib/
│   │   ├── theme/
│   │   │   ├── colors.ts
│   │   │   ├── typography.ts
│   │   │   └── tokens.ts
│   │   │
│   │   ├── animations/
│   │   │   ├── variants.ts
│   │   │   └── transitions.ts
│   │   │
│   │   └── utils/
│   │       ├── cn.ts
│   │       ├── format.ts
│   │       └── date.ts
│   │
│   ├── store/                       # État global (Zustand)
│   │   ├── authStore.ts
│   │   ├── cartStore.ts
│   │   ├── ticketStore.ts
│   │   └── uiStore.ts
│   │
│   └── styles/
│       └── globals.css
│
├── tailwind.config.js
├── next.config.js
└── package.json
```

---

## 🗺️ Pages & Navigation

### 1. Dashboard Club (Admin)

**Route** : `/club/dashboard`  
**Rôle** : Admin/Manager  
**Composants** :
```typescript
// app/(admin)/club/dashboard/page.tsx

import { Header } from '@/components/layout/Header';
import { StatsCard } from '@/components/features/dashboard/StatsCard';
import { MiniChart } from '@/components/features/dashboard/MiniChart';
import { ActivityFeed } from '@/components/features/dashboard/ActivityFeed';
import { PageContainer } from '@/components/layout/PageContainer';

export default function ClubDashboardPage() {
  return (
    <PageContainer>
      <Header 
        title="Dashboard" 
        subtitle="Manager View"
      />
      
      <div className="space-y-6 p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4">
          <StatsCard
            title="Total Members"
            value="1,245"
            change="+12%"
            trend="up"
            chart={<MiniChart data={memberData} />}
          />
          
          <StatsCard
            title="Ticket Revenue"
            value="$14,500"
            change="+8.5%"
            trend="up"
            chart={<MiniChart data={revenueData} />}
          />
          
          <StatsCard
            title="Active Events"
            value="3"
            icon={<Calendar />}
            badge="+1 this week"
          />
        </div>

        {/* Activity Feed */}
        <ActivityFeed activities={recentActivities} />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="primary" icon={<QrCode />}>
            Scan Ticket
          </Button>
          <Button variant="outline" icon={<Plus />}>
            New Event
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
```

**Caractéristiques** :
- ✅ Charts temps réel (SVG animés)
- ✅ Feed d'activités
- ✅ Actions rapides
- ✅ Métriques clés (KPI)

---

### 2. Events Discovery

**Route** : `/events`  
**Rôle** : Public  
**Composants** :
```typescript
// app/(public)/events/page.tsx

import { EventGrid } from '@/components/features/events/EventGrid';
import { EventFilters } from '@/components/features/events/EventFilters';
import { SearchBar } from '@/components/ui/SearchBar';

export default function EventsPage() {
  const [filter, setFilter] = useState('all');
  const { data: events, isLoading } = useEvents({ filter });

  return (
    <PageContainer>
      <Header title="Events" />
      
      <div className="space-y-4">
        {/* Search */}
        <div className="px-6 py-4">
          <SearchBar placeholder="Search events..." />
        </div>

        {/* Filters */}
        <EventFilters 
          selected={filter} 
          onChange={setFilter}
        />

        {/* Events Grid */}
        <div className="p-6">
          {isLoading ? (
            <LoadingGrid />
          ) : (
            <EventGrid events={events} />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
```

**Caractéristiques** :
- ✅ Recherche en temps réel
- ✅ Filtres par catégorie
- ✅ Cards avec images hero
- ✅ Prix et actions rapides

---

### 3. My Tickets

**Route** : `/tickets`  
**Rôle** : User  
**Composants** :
```typescript
// app/(protected)/tickets/page.tsx

import { TicketCard } from '@/components/features/tickets/TicketCard';
import { QRDisplay } from '@/components/features/tickets/QRDisplay';
import { Modal } from '@/components/ui/Modal';

export default function TicketsPage() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const { data: tickets } = useUserTickets();

  return (
    <PageContainer>
      <Header title="My Tickets" />
      
      <div className="p-6 space-y-4">
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onShowQR={() => setSelectedTicket(ticket)}
          />
        ))}
      </div>

      {/* QR Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
      >
        {selectedTicket && (
          <QRDisplay ticket={selectedTicket} />
        )}
      </Modal>
    </PageContainer>
  );
}
```

**Caractéristiques** :
- ✅ Liste des tickets
- ✅ QR Code modal
- ✅ Actions (download, share)
- ✅ Validation status

---

### 4. Shop

**Route** : `/shop`  
**Rôle** : Public  
**Composants** :
```typescript
// app/(public)/shop/page.tsx

import { ProductGrid } from '@/components/features/shop/ProductGrid';
import { CartButton } from '@/components/features/shop/CartButton';
import { CategoryFilters } from '@/components/features/shop/CategoryFilters';

export default function ShopPage() {
  const [category, setCategory] = useState('all');
  const { data: products } = useProducts({ category });
  const { itemCount } = useCart();

  return (
    <PageContainer>
      <Header title="Official Store" />
      
      <div className="space-y-4">
        {/* Search */}
        <SearchBar placeholder="Search for kits, gifts..." />

        {/* Categories */}
        <CategoryFilters 
          selected={category}
          onChange={setCategory}
        />

        {/* Products */}
        <div className="p-6">
          <ProductGrid products={products} />
        </div>
      </div>

      {/* Floating Cart */}
      <CartButton count={itemCount} />
    </PageContainer>
  );
}
```

**Caractéristiques** :
- ✅ Grille de produits 2 colonnes
- ✅ Filtres par catégorie
- ✅ Bouton panier flottant
- ✅ Badges (Best Seller, Exclusive)

---

## 🧩 Composants Partagés

### Header Component

```typescript
// components/layout/Header.tsx

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack,
  onBack,
  actions,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-background-dark/95 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Action */}
        {showBack ? (
          <button onClick={onBack} className="nav-icon-button">
            <ChevronLeft size={24} />
          </button>
        ) : (
          <button className="nav-icon-button">
            <Menu size={24} />
          </button>
        )}

        {/* Title */}
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <span className="text-caption text-primary/80">{subtitle}</span>
          )}
        </div>

        {/* Right Action */}
        {actions || (
          <div className="size-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <User size={20} className="text-primary" />
          </div>
        )}
      </div>
    </header>
  );
};
```

### Bottom Navigation

```typescript
// components/layout/BottomNav.tsx

const navItems = [
  { id: 'home', label: 'Home', icon: Home, route: '/' },
  { id: 'events', label: 'Events', icon: Calendar, route: '/events' },
  { id: 'tickets', label: 'Tickets', icon: Ticket, route: '/tickets' },
  { id: 'shop', label: 'Shop', icon: ShoppingBag, route: '/shop' },
  { id: 'profile', label: 'Profile', icon: User, route: '/profile' },
];

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-dark/95 backdrop-blur-xl border-t border-white/10 pb-safe-bottom">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.route;
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.route}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 transition-all',
                isActive ? 'text-primary' : 'text-gray-400 hover:text-white'
              )}
            >
              <Icon 
                size={24} 
                className={isActive ? 'scale-110' : ''}
              />
              <span className={cn(
                'text-caption',
                isActive && 'font-bold'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
```

---

## 🎨 États Globaux

### Auth Store

```typescript
// store/authStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const response = await authApi.login({ email, password });
        set({
          user: response.user,
          token: response.accessToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      refreshToken: async () => {
        // Implement refresh logic
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

### Cart Store

```typescript
// store/cartStore.ts

interface CartStore {
  items: CartItem[];
  total: number;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  total: 0,

  addItem: (product) => set((state) => {
    const existingItem = state.items.find((item) => item.id === product.id);
    
    if (existingItem) {
      return {
        items: state.items.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      };
    }

    return {
      items: [...state.items, { ...product, quantity: 1 }],
    };
  }),

  removeItem: (productId) => set((state) => ({
    items: state.items.filter((item) => item.id !== productId),
  })),

  updateQuantity: (productId, quantity) => set((state) => ({
    items: state.items.map((item) =>
      item.id === productId ? { ...item, quantity } : item
    ),
  })),

  clear: () => set({ items: [], total: 0 }),
}));
```

---

## ✨ Animations & Transitions

### Page Transitions (Framer Motion)

```typescript
// lib/animations/page-transitions.ts

export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Usage dans une page
export default function Page() {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Page content */}
    </motion.div>
  );
}
```

### Micro-interactions

```css
/* styles/animations.css */

@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 5px rgba(242, 204, 13, 0.2); }
  50% { box-shadow: 0 0 20px rgba(242, 204, 13, 0.4); }
}

.shimmer {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(242, 204, 13, 0.1),
    transparent
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}

.glow {
  animation: glow 2s ease-in-out infinite;
}
```

---

## 🚀 Guide d'Implémentation

### 1. Setup Initial

```bash
# Créer le projet
npx create-next-app@latest footballhub-frontend --typescript --tailwind --app

cd footballhub-frontend

# Installer les dépendances
npm install zustand framer-motion lucide-react date-fns
npm install @tanstack/react-query axios
npm install class-variance-authority clsx tailwind-merge
```

### 2. Configuration Tailwind

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F2CC0D',
        'primary-dark': '#D4B20B',
        'background-dark': '#1A1915',
        'surface-dark': '#24221A',
        'surface-card': '#2F2C1B',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

### 3. Layout Principal

```typescript
// app/layout.tsx
import './globals.css';
import { BottomNav } from '@/components/layout/BottomNav';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background-dark text-white antialiased">
        <div className="flex flex-col min-h-screen">
          <main className="flex-1 pb-20">
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
```

### 4. Ordre d'Implémentation

#### Phase 1 : Fondations (Semaine 1)
- ✅ Setup projet & configuration
- ✅ Design tokens & theme
- ✅ Composants UI de base (Button, Card, Badge)
- ✅ Layout (Header, BottomNav)

#### Phase 2 : Pages Core (Semaine 2)
- ✅ Events Discovery
- ✅ My Tickets
- ✅ Shop
- ✅ Profile

#### Phase 3 : Features Avancées (Semaine 3)
- ✅ QR Code display/scanner
- ✅ Cart & Checkout
- ✅ Dashboard Club (admin)
- ✅ Analytics

#### Phase 4 : Polish & Performance (Semaine 4)
- ✅ Animations & transitions
- ✅ Loading states
- ✅ Error handling
- ✅ Optimizations

---

## 🎯 Checklist Harmonie

Pour garantir l'harmonie entre toutes les pages :

### Design
- [ ] Tous les composants utilisent les tokens du design system
- [ ] Palette de couleurs cohérente (or + charcoal)
- [ ] Typographie unifiée (Space Grotesk + Manrope)
- [ ] Espacements constants (multiples de 4px)
- [ ] Border radius cohérents (xl, 2xl)

### Navigation
- [ ] Bottom nav présente sur toutes les pages
- [ ] Header sticky avec style unifié
- [ ] Transitions de page fluides
- [ ] Back button cohérent

### Interactions
- [ ] Animations standardisées (fade, slide, scale)
- [ ] States hover/active cohérents
- [ ] Loading states uniformes
- [ ] Feedback utilisateur (toasts, modals)

### Performance
- [ ] Images optimisées
- [ ] Lazy loading
- [ ] Code splitting
- [ ] Cache API

---

## 🎨 Exemple Complet : EventCard

```typescript
// components/features/events/EventCard.tsx

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface EventCardProps {
  event: Event;
  variant?: 'featured' | 'standard';
  onBuyTicket?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  variant = 'standard',
  onBuyTicket,
}) => {
  const isFeatured = variant === 'featured';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        variant="glass" 
        className={cn(
          'overflow-hidden group cursor-pointer',
          isFeatured && 'ring-2 ring-primary/30'
        )}
      >
        {/* Hero Image */}
        <div className={cn(
          'relative overflow-hidden',
          isFeatured ? 'h-64' : 'h-48'
        )}>
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent" />
          
          {/* Badge */}
          <div className="absolute top-3 right-3">
            <Badge variant="primary">
              {event.category}
            </Badge>
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            {isFeatured && (
              <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2 block">
                Featured Event
              </span>
            )}
            
            <h3 className={cn(
              'font-bold text-white mb-2',
              isFeatured ? 'text-2xl' : 'text-xl'
            )}>
              {event.title}
            </h3>
            
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-1">
                <Calendar size={16} className="text-primary" />
                {format(new Date(event.startDate), 'MMM dd, HH:mm')}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={16} className="text-primary" />
                {event.venue}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 uppercase">Price</span>
            <span className="text-2xl font-bold text-primary">
              ${event.price.toFixed(2)}
            </span>
          </div>
          
          <Button
            variant="primary"
            size={isFeatured ? 'md' : 'sm'}
            onClick={onBuyTicket}
          >
            Buy Ticket
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};
```

---

**Voilà ! Tout est orchestré harmonieusement ! 🎨🚀**

L'application FootballHub+ est maintenant une expérience unifiée avec :
- Design system cohérent
- Navigation fluide
- Composants réutilisables
- Animations synchronisées
- Thème premium dark/gold
