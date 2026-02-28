/**
 * ═══════════════════════════════════════════════════════
 * @reclamtrack/shared — Source unique de vérité
 * ═══════════════════════════════════════════════════════
 *
 * Ce fichier centralise :
 *  1. HERBUTE_ROUTES  — Toutes les URIs du backend Herbute
 *  2. Types TypeScript partagés (JWT, User, Rôles, Plans)
 *  3. Contrats d'API (Request/Response types)
 *
 * Usage :
 *  - Backend  : import { HERBUTE_ROUTES } from '@reclamtrack/shared'
 *  - Frontend : import { HERBUTE_ROUTES, type JwtPayload } from '@reclamtrack/shared'
 *
 * ⚠️  Toute modification d'URL backend DOIT passer par ce fichier.
 *      Une règle ESLint custom bloque les strings URI bruts dans le frontend.
 */

// ═══════════════════════════════════════════════════════
// SECTION 1 — ROUTES API (source unique de vérité des URIs)
// ═══════════════════════════════════════════════════════

/**
 * Toutes les routes du backend Herbute (backend unique post-migration)
 * Utilisées par le frontend ET le backend lui-même pour éviter les typos.
 */
export const HERBUTE_ROUTES = {
  // ─────────────────────────────────────────────
  // Auth & IAM (migré depuis ReclamTrack)
  // ─────────────────────────────────────────────
  auth: {
    register:      '/api/auth/register',
    login:         '/api/auth/login',
    logout:        '/api/auth/logout',
    logoutAll:     '/api/auth/logout-all',
    refresh:       '/api/auth/refresh',
    me:            '/api/auth/me',
    forgotPassword:'/api/auth/forgot-password',
    resetPassword: '/api/auth/reset-password',
    verifyEmail:   (token: string) => `/api/auth/verify-email/${token}`,
  },

  // ─────────────────────────────────────────────
  // Fleet & Équipements
  // ─────────────────────────────────────────────
  fleet: {
    vehicles:     '/fleet/vehicles',
    vehicleById:  (id: string) => `/fleet/vehicles/${id}`,
    maintenance:  '/fleet/maintenance',
    maintenanceById: (id: string) => `/fleet/maintenance/${id}`,
    fuelLogs:     '/fleet/fuel-logs',
    inspections:  '/fleet/inspections',
  },

  // ─────────────────────────────────────────────
  // Ressources Humaines (Agricole)
  // ─────────────────────────────────────────────
  hr: {
    staff:         '/hr/staff',
    staffById:     (id: string) => `/hr/staff/${id}`,
    roster:        '/hr/roster',
    rosterById:    (id: string) => `/hr/roster/${id}`,
    leaves:        '/hr/leaves',
    leaveById:     (id: string) => `/hr/leaves/${id}`,
    leaveApprove:  (id: string) => `/hr/leaves/${id}/approve`,
    leaveReject:   (id: string) => `/hr/leaves/${id}/reject`,
    contracts:     '/hr/contracts',
    payroll:       '/hr/payroll',
  },

  // ─────────────────────────────────────────────
  // Planning & Opérations
  // ─────────────────────────────────────────────
  planning: {
    schedule:          '/planning/schedule',
    scheduleById:      (id: string) => `/planning/schedule/${id}`,
    interventions:     '/planning/interventions',
    interventionById:  (id: string) => `/planning/interventions/${id}`,
    tasks:             '/planning/tasks',
    taskById:          (id: string) => `/planning/tasks/${id}`,
  },

  // ─────────────────────────────────────────────
  // Communication & Connaissance
  // ─────────────────────────────────────────────
  messaging: {
    conversations:    '/messaging/conversations',
    conversationById: (id: string) => `/messaging/conversations/${id}`,
    messages:         (convId: string) => `/messaging/conversations/${convId}/messages`,
    feedback:         '/messaging/feedback',
    knowledge:        '/messaging/knowledge',
    knowledgeById:    (id: string) => `/messaging/knowledge/${id}`,
  },

  // ─────────────────────────────────────────────
  // Dashboard & Analytics
  // ─────────────────────────────────────────────
  dashboard: {
    kpis:            '/dashboard/kpis',
    farmSummary:     '/dashboard/farm-summary',
    fleetSummary:    '/dashboard/fleet-summary',
    staffSummary:    '/dashboard/staff-summary',
  },

  // ─────────────────────────────────────────────
  // Health Check
  // ─────────────────────────────────────────────
  health: '/health',
} as const;

// Type utilitaire pour extraire les valeurs de routes
export type HerbuteRoute = string;


// ═══════════════════════════════════════════════════════
// SECTION 2 — TYPES TYPESCRIPT PARTAGÉS
// ═══════════════════════════════════════════════════════

// Rôles utilisateur (synchronisés avec le schéma Mongoose)
export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'employe'
  | 'veterinaire'
  | 'comptable';

// Plans d'abonnement
export type SubscriptionPlan =
  | 'essai'
  | 'essentiel'
  | 'professionnel'
  | 'entreprise';

// Payload JWT (ce qui est encodé dans le token)
export interface JwtPayload {
  sub:    string;  // User ID
  email:  string;
  role:   UserRole;
  farmId?: string;
  plan:   SubscriptionPlan;
  org?:   string;  // Organization ID
  iat?:   number;  // Issued at (auto JWT)
  exp?:   number;  // Expiration (auto JWT)
}

// Données utilisateur pour générer un token
export interface UserTokenData {
  id:             string;
  email:          string;
  role:           UserRole;
  farmId?:        string;
  plan:           SubscriptionPlan;
  organizationId?: string;
}

// Paire de tokens retournée par generateTokenPair
export interface TokenPair {
  accessToken:      string;
  refreshToken:     string;
  refreshTokenHash: string;
  expiresIn:        string;
}


// ═══════════════════════════════════════════════════════
// SECTION 3 — CONTRATS D'API (Request / Response)
// ═══════════════════════════════════════════════════════

// Auth
export interface LoginRequest {
  email:    string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: {
    id:     string;
    email:  string;
    nom:    string;
    prenom: string;
    role:   UserRole;
    plan:   SubscriptionPlan;
    farmId?: string;
  };
}

export interface RegisterRequest {
  email:       string;
  password:    string;
  nom:         string;
  prenom:      string;
  telephone?:  string;
  farmName?:   string;
  role?:       UserRole;
}

// Erreur API standardisée
export interface ApiError {
  error:    string;
  code?:    string;
  details?: string[];
}

// Pagination
export interface PaginationMeta {
  page:  number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data:       T[];
  pagination: PaginationMeta;
}

// Vehicle (Fleet)
export interface Vehicle {
  id:           string;
  farmId:       string;
  immatriculation: string;
  marque:       string;
  modele:       string;
  type:         'tracteur' | 'camion' | 'utilitaire' | 'autre';
  annee:        number;
  kilometrage:  number;
  statut:       'actif' | 'en_maintenance' | 'hors_service';
  prochaineMaintenance?: string;
  createdAt:    string;
  updatedAt:    string;
}

// Staff (HR)
export interface StaffMember {
  id:          string;
  farmId:      string;
  userId?:     string;
  nom:         string;
  prenom:      string;
  poste:       string;
  secteur:     string;
  typeContrat: 'cdi' | 'cdd' | 'saisonnier' | 'interim';
  salaireBase: number;
  dateEmbauche: string;
  isActive:    boolean;
}

// Leave (Congés)
export interface Leave {
  id:          string;
  staffId:     string;
  farmId:      string;
  type:        'conge_paye' | 'maladie' | 'sans_solde' | 'autre';
  dateDebut:   string;
  dateFin:     string;
  nbJours:     number;
  statut:      'en_attente' | 'approuve' | 'refuse' | 'annule';
  motif?:      string;
  approvedBy?: string;
}
