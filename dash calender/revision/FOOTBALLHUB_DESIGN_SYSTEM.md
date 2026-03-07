# 🎨 FootballHub+ Design System - Architecture Visuelle Complète

## 📋 Table des Matières
1. [Vision & Principes](#vision--principes)
2. [Tokens de Design](#tokens-de-design)
3. [Typographie](#typographie)
4. [Système de Couleurs](#système-de-couleurs)
5. [Composants Réutilisables](#composants-réutilisables)
6. [Navigation & Routing](#navigation--routing)
7. [Animations & Transitions](#animations--transitions)
8. [États & Feedback](#états--feedback)

---

## 🎯 Vision & Principes

### Identité Visuelle

**FootballHub+** adopte une esthétique **premium sportive moderne** qui combine :
- **Luxe accessible** : Or métallique (#F2CC0D) comme couleur signature
- **Profondeur dramatique** : Arrière-plans sombres riches (#1A1915, #24221A)
- **Énergie dynamique** : Animations fluides et micro-interactions engageantes
- **Clarté fonctionnelle** : Interface épurée avec hiérarchie visuelle forte

### Principes de Design

1. **Mobile-First Premium** : Expérience tactile optimisée pour le mobile
2. **Consistance Visuelle** : Chaque écran partage l'ADN visuel FootballHub+
3. **Performance & Fluidité** : 60fps garantis sur toutes les animations
4. **Accessibilité** : WCAG 2.1 AA minimum
5. **Hiérarchie Claire** : L'information importante est toujours évidente

---

## 🎨 Tokens de Design

### Configuration Tailwind Unifiée

```javascript
// tailwind.config.js - Configuration Globale FootballHub+

module.exports = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Couleurs Principales
        primary: {
          DEFAULT: "#F2CC0D",
          dark: "#D4B20B",
          light: "#F9D406",
          glow: "rgba(242, 204, 13, 0.2)",
        },
        
        // Backgrounds
        background: {
          light: "#F8F8F5",
          dark: "#1A1915",
        },
        
        // Surfaces
        surface: {
          light: "#FFFFFF",
          dark: "#24221A",
          card: "#2F2C1B",
          elevated: "#3A3629",
        },
        
        // Borders
        border: {
          gold: "#685F31",
          light: "rgba(255, 255, 255, 0.1)",
          dark: "rgba(0, 0, 0, 0.1)",
        },
        
        // States
        success: "#10B981",
        error: "#EF4444",
        warning: "#F59E0B",
        info: "#3B82F6",
        
        // Text
        text: {
          primary: "#FFFFFF",
          secondary: "rgba(255, 255, 255, 0.8)",
          tertiary: "rgba(255, 255, 255, 0.6)",
          muted: "rgba(255, 255, 255, 0.4)",
        },
      },
      
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        body: ["Manrope", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      
      fontSize: {
        "display-xl": ["4rem", { lineHeight: "1", letterSpacing: "-0.02em" }],
        "display-lg": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-md": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "display-sm": ["1.875rem", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        "heading-xl": ["1.5rem", { lineHeight: "1.4", letterSpacing: "0" }],
        "heading-lg": ["1.25rem", { lineHeight: "1.4", letterSpacing: "0" }],
        "heading-md": ["1.125rem", { lineHeight: "1.5", letterSpacing: "0" }],
        "body-lg": ["1rem", { lineHeight: "1.6", letterSpacing: "0" }],
        "body-md": ["0.875rem", { lineHeight: "1.6", letterSpacing: "0" }],
        "body-sm": ["0.75rem", { lineHeight: "1.5", letterSpacing: "0.01em" }],
        "caption": ["0.625rem", { lineHeight: "1.4", letterSpacing: "0.05em" }],
      },
      
      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
      },
      
      borderRadius: {
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      
      boxShadow: {
        "glow-sm": "0 0 10px rgba(242, 204, 13, 0.1)",
        "glow-md": "0 0 20px rgba(242, 204, 13, 0.2)",
        "glow-lg": "0 0 40px rgba(242, 204, 13, 0.3)",
        "elevation-sm": "0 2px 8px rgba(0, 0, 0, 0.1)",
        "elevation-md": "0 4px 16px rgba(0, 0, 0, 0.15)",
        "elevation-lg": "0 8px 32px rgba(0, 0, 0, 0.2)",
        "elevation-xl": "0 16px 64px rgba(0, 0, 0, 0.25)",
      },
      
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "fade-in-up": "fadeInUp 0.4s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "slide-in-left": "slideInLeft 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2s infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(242, 204, 13, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(242, 204, 13, 0.4)" },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/container-queries"),
  ],
};
```

---

## ✍️ Typographie

### Hiérarchie Typographique

```css
/* globals.css - Typographie Globale */

/* Import des Fonts */
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');

/* Classes Utilitaires Typographiques */
.text-display-xl {
  @apply font-display text-display-xl font-bold tracking-tight;
}

.text-display-lg {
  @apply font-display text-display-lg font-bold tracking-tight;
}

.text-display-md {
  @apply font-display text-display-md font-bold tracking-tight;
}

.text-heading-xl {
  @apply font-display text-heading-xl font-semibold;
}

.text-heading-lg {
  @apply font-display text-heading-lg font-semibold;
}

.text-body-lg {
  @apply font-body text-body-lg font-normal;
}

.text-body-md {
  @apply font-body text-body-md font-normal;
}

.text-caption {
  @apply font-body text-caption font-medium uppercase tracking-wider;
}

/* Effet Gold Text */
.text-gold-gradient {
  @apply bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent;
}
```

---

## 🌈 Système de Couleurs

### Palette Complète

```typescript
// lib/theme/colors.ts

export const colors = {
  // Primary Gold Palette
  gold: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#F9D406",
    500: "#F2CC0D", // Primary
    600: "#D4B20B",
    700: "#A78909",
    800: "#7A6207",
    900: "#4D3E04",
  },
  
  // Charcoal/Dark Palette
  charcoal: {
    50: "#F5F3EF",
    100: "#E5E2D8",
    200: "#C7C1B0",
    300: "#A9A089",
    400: "#685F31", // Border Gold
    500: "#3A3629",
    600: "#2F2C1B", // Surface Card
    700: "#24221A", // Surface Dark
    800: "#1A1915", // Background Dark
    900: "#0F0E0B",
  },
  
  // Status Colors
  status: {
    success: {
      light: "#D1FAE5",
      DEFAULT: "#10B981",
      dark: "#065F46",
    },
    error: {
      light: "#FEE2E2",
      DEFAULT: "#EF4444",
      dark: "#991B1B",
    },
    warning: {
      light: "#FEF3C7",
      DEFAULT: "#F59E0B",
      dark: "#92400E",
    },
    info: {
      light: "#DBEAFE",
      DEFAULT: "#3B82F6",
      dark: "#1E40AF",
    },
  },
};

// Utilitaires de couleur
export const getColorWithOpacity = (color: string, opacity: number) => {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
};
```

---

## 🧩 Composants Réutilisables

### 1. Button Component

```typescript
// components/ui/Button.tsx

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-black hover:bg-primary-dark shadow-glow-md",
        secondary: "bg-surface-dark text-white border border-border-light hover:bg-surface-elevated",
        outline: "border-2 border-primary text-primary hover:bg-primary hover:text-black",
        ghost: "text-white hover:bg-white/10",
        danger: "bg-error text-white hover:bg-error/90",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-base",
        lg: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, leftIcon, rightIcon, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {!isLoading && leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
```

### 2. Card Component

```typescript
// components/ui/Card.tsx

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'gold-border';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
    const variants = {
      default: 'bg-surface-dark border border-border-light',
      elevated: 'bg-surface-elevated shadow-elevation-md',
      glass: 'bg-surface-dark/70 backdrop-blur-xl border border-white/10',
      'gold-border': 'bg-surface-dark border-2 border-primary/30 shadow-glow-sm',
    };

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-8',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl overflow-hidden transition-all duration-300',
          variants[variant],
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <div className={cn('mb-4', className)} {...props} />;

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => <h3 className={cn('text-heading-lg text-white font-bold', className)} {...props} />;

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...props
}) => <p className={cn('text-body-md text-text-secondary', className)} {...props} />;

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <div className={cn('', className)} {...props} />;

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <div className={cn('mt-4 flex gap-3', className)} {...props} />;
```

### 3. Badge Component

```typescript
// components/ui/Badge.tsx

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-primary/20 text-primary border border-primary/30',
        success: 'bg-success/20 text-success border border-success/30',
        error: 'bg-error/20 text-error border border-error/30',
        warning: 'bg-warning/20 text-warning border border-warning/30',
        neutral: 'bg-white/10 text-white border border-white/20',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant,
  size,
  icon,
  children,
  ...props
}) => {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon}
      {children}
    </span>
  );
};
```

### 4. Navigation Bottom Bar

```typescript
// components/navigation/BottomNav.tsx

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Calendar, 
  Ticket, 
  ShoppingBag, 
  User 
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Home', icon: <Home size={24} /> },
  { href: '/events', label: 'Events', icon: <Calendar size={24} /> },
  { href: '/tickets', label: 'Tickets', icon: <Ticket size={24} /> },
  { href: '/shop', label: 'Shop', icon: <ShoppingBag size={24} /> },
  { href: '/profile', label: 'Profile', icon: <User size={24} /> },
];

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-dark/95 backdrop-blur-xl border-t border-white/10 pb-safe-bottom">
      <div className="flex justify-around items-center h-16 max-w-screen-xl mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 transition-colors',
                isActive ? 'text-primary' : 'text-text-tertiary hover:text-text-primary'
              )}
            >
              <div className={cn(
                'transition-all',
                isActive && 'scale-110'
              )}>
                {item.icon}
              </div>
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

### 5. Ticket Card Premium

```typescript
// components/tickets/TicketCard.tsx

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Calendar, MapPin, QrCode } from 'lucide-react';
import { format } from 'date-fns';

interface TicketCardProps {
  ticket: {
    id: string;
    ticketNumber: string;
    ticketType: 'VIP' | 'STANDARD' | 'EARLY_BIRD' | 'FREE';
    event: {
      title: string;
      startDate: string;
      venue: string;
      city: string;
      coverImage?: string;
    };
    isValidated: boolean;
  };
  onShowQR?: () => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onShowQR }) => {
  const typeColors = {
    VIP: 'bg-gradient-to-r from-yellow-500 to-primary',
    STANDARD: 'bg-gradient-to-r from-blue-500 to-blue-600',
    EARLY_BIRD: 'bg-gradient-to-r from-green-500 to-emerald-600',
    FREE: 'bg-gradient-to-r from-gray-500 to-gray-600',
  };

  return (
    <Card variant="glass" padding="none" className="group hover:shadow-glow-md transition-all">
      {/* Header avec image */}
      {ticket.event.coverImage && (
        <div className="relative h-32 overflow-hidden">
          <img
            src={ticket.event.coverImage}
            alt={ticket.event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent" />
          
          {/* Badge Type */}
          <div className="absolute top-3 right-3">
            <Badge variant="primary" size="sm">
              {ticket.ticketType}
            </Badge>
          </div>
        </div>
      )}

      {/* Bande de couleur selon le type */}
      <div className={cn('h-2', typeColors[ticket.ticketType])} />

      {/* Contenu */}
      <div className="p-5 space-y-4">
        {/* Titre */}
        <div>
          <h3 className="text-heading-lg text-white font-bold mb-1">
            {ticket.event.title}
          </h3>
          <p className="text-caption text-text-muted">
            {ticket.ticketNumber}
          </p>
        </div>

        {/* Informations */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-body-md text-text-secondary">
            <Calendar size={16} className="text-primary" />
            <span>{format(new Date(ticket.event.startDate), 'PPP p')}</span>
          </div>
          
          <div className="flex items-center gap-2 text-body-md text-text-secondary">
            <MapPin size={16} className="text-primary" />
            <span>{ticket.event.venue}, {ticket.event.city}</span>
          </div>
        </div>

        {/* Status */}
        {ticket.isValidated && (
          <Badge variant="success" size="sm">
            ✓ Validated
          </Badge>
        )}

        {/* Actions */}
        <div className="pt-2 border-t border-white/10">
          <Button
            onClick={onShowQR}
            variant="primary"
            className="w-full"
            leftIcon={<QrCode size={20} />}
          >
            Show QR Code
          </Button>
        </div>
      </div>
    </Card>
  );
};
```

---

## 🧭 Navigation & Routing

### Structure de Navigation

```typescript
// lib/navigation/routes.ts

export const routes = {
  // Public
  home: '/',
  events: '/events',
  eventDetail: (id: string) => `/events/${id}`,
  
  // Tickets
  tickets: '/tickets',
  ticketDetail: (id: string) => `/tickets/${id}`,
  ticketScanner: '/tickets/scanner',
  
  // Shop
  shop: '/shop',
  productDetail: (id: string) => `/shop/products/${id}`,
  cart: '/shop/cart',
  checkout: '/shop/checkout',
  orders: '/shop/orders',
  
  // Club
  club: (slug: string) => `/clubs/${slug}`,
  clubDashboard: '/club/dashboard',
  clubMembers: '/club/members',
  clubEvents: '/club/events',
  clubAnalytics: '/club/analytics',
  
  // User
  profile: '/profile',
  settings: '/settings',
  
  // Auth
  login: '/auth/login',
  register: '/auth/register',
} as const;
```

### Layout Orchestration

```typescript
// app/layout.tsx

import { Inter } from 'next/font/google';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Header } from '@/components/layout/Header';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={cn(
        inter.className,
        'bg-background-dark text-text-primary antialiased'
      )}>
        <div className="flex flex-col min-h-screen">
          <Header />
          
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

---

## ✨ Animations & Transitions

### Framer Motion Configuration

```typescript
// lib/animations/variants.ts

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
  transition: { duration: 0.2, ease: 'easeOut' },
};

export const slideInRight = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
  transition: { type: 'spring', damping: 20, stiffness: 100 },
};
```

---

## 📊 États & Feedback

### Loading States

```typescript
// components/ui/Loading.tsx

export const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
      <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" />
    </div>
  </div>
);

export const LoadingSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-white/10 rounded w-3/4" />
    <div className="h-4 bg-white/10 rounded w-1/2" />
  </div>
);
```

Ce design system assure une **harmonie totale** entre toutes les pages de FootballHub+ ! 🎨✨
