/**
 *
 * @reclamtrack/shared     Source unique de v  rit
 *
 *
 * Ce fichier centralise :
 *  1. HERBUTE_ROUTES      Toutes les URIs du backend Herbute
 *  2. Types TypeScript partag  s (JWT, User, R  les, Plans)
 *  3. Contrats d'API (Request/Response types)
 *
 * Usage :
 *  - Backend  : import { HERBUTE_ROUTES } from '@reclamtrack/shared'
 *  - Frontend : import { HERBUTE_ROUTES, type JwtPayload } from '@reclamtrack/shared'
 *
 *         Toute modification d'URL backend DOIT passer par ce fichier.
 *      Une r  gle ESLint custom bloque les strings URI bruts dans le frontend.
 */

//
// SECTION 1     ROUTES API (source unique de v  rit   des URIs)
//

/**
 * Toutes les routes du backend Herbute (backend unique post-migration)
 * Utilis  es par le frontend ET le backend lui-m  me pour   viter les typos.
 */
export const HERBUTE_ROUTES = {
  //
  // Auth & IAM (migr   depuis ReclamTrack)
  //
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

  //
  // Fleet &   quipements
  //
  fleet: {
    vehicles:     '/api/fleet/vehicles',
    vehicleById:  (id: string) => `/api/fleet/vehicles/${id}`,
    maintenance:  '/api/fleet/maintenance',
    maintenanceById: (id: string) => `/api/fleet/maintenance/${id}`,
    fuelLogs:     '/api/fleet/fuel-logs',
    inspections:  '/api/fleet/inspections',
  },

  //
  // Ressources Humaines (Agricole)
  //
  hr: {
    staff:         '/api/hr/staff',
    staffById:     (id: string) => `/api/hr/staff/${id}`,
    roster:        '/api/hr/roster',
    rosterById:    (id: string) => `/api/hr/roster/${id}`,
    leaves:        '/api/hr/leaves',
    leaveById:     (id: string) => `/api/hr/leaves/${id}`,
    leaveApprove:  (id: string) => `/api/hr/leaves/${id}/approve`,
    leaveReject:   (id: string) => `/api/hr/leaves/${id}/reject`,
    contracts:     '/api/hr/contracts',
    payroll:       '/api/hr/payroll',
  },

  //
  // Planning & Op  rations
  //
  planning: {
    schedule:          '/api/planning/schedule',
    scheduleById:      (id: string) => `/api/planning/schedule/${id}`,
    interventions:     '/api/planning/interventions',
    interventionById:  (id: string) => `/api/planning/interventions/${id}`,
    tasks:             '/api/planning/tasks',
    taskById:          (id: string) => `/api/planning/tasks/${id}`,
  },

  //
  // Communication & Connaissance
  //
  messaging: {
    conversations:    '/api/messaging/conversations',
    conversationById: (id: string) => `/api/messaging/conversations/${id}`,
    messages:         (convId: string) => `/api/messaging/conversations/${convId}/messages`,
    feedback:         '/api/messaging/feedback',
    knowledge:        '/api/messaging/knowledge',
    knowledgeById:    (id: string) => `/api/messaging/knowledge/${id}`,
  },

  //
  // Dashboard & Analytics
  //
  dashboard: {
    kpis:            '/api/dashboard/kpis',
    farmSummary:     '/api/dashboard/farm-summary',
    fleetSummary:    '/api/dashboard/fleet-summary',
    staffSummary:    '/api/dashboard/staff-summary',
  },

  //
  // Health Check
  //
  health: '/',
} as const;

// Type utilitaire pour extraire les valeurs de routes
export type HerbuteRoute = string;


//
// SECTION 2     TYPES TYPESCRIPT PARTAG  S
//

// R  les utilisateur (synchronis  s avec le sch  ma Mongoose)
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

// Payload JWT (ce qui est encod   dans le token)
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

// Donn  es utilisateur pour g  n  rer un token
export interface UserTokenData {
  id:             string;
  email:          string;
  role:           UserRole;
  farmId?:        string;
  plan:           SubscriptionPlan;
  organizationId?: string;
}

// Paire de tokens retourn  e par generateTokenPair
export interface TokenPair {
  accessToken:      string;
  refreshToken:     string;
  refreshTokenHash: string;
  expiresIn:        string;
}


//
// SECTION 3     CONTRATS D'API (Request / Response)
//

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

// Erreur API standardis  e
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

// Leave (Cong  s)
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
