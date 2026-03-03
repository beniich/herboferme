/**
 * Security Services Index
 *
 * Centralized export point for all security-related services.
 * This module provides a unified interface for:
 * - Authentication & Authorization
 * - Compliance & Auditing
 * - Firewall & Network Security
 * - Secrets Management
 * - System Monitoring
 */

// Core Security Service
export { SecurityService, securityService } from '../securityService.js';

// Secrets Management
export { SecretService, secretService } from '../secretService.js';

// Firewall & Network Security
export { PfSenseService, pfSenseService } from '../pfSenseService.js';

/**
 * Security Services Type Definitions
 */
export interface SecurityAudit {
  totalUsers: number;
  bcryptHashed: number;
  weakPasswords: number;
  rotationNeeded: number;
  lastAudit: Date;
}

export interface ComplianceReport {
  timestamp: Date;
  organizationId: string;
  passwordSecurity: SecurityAudit;
  activeSessions: number;
  gpoCount: number;
  complianceScore: number;
  recommendations: string[];
}

export interface RDPSession {
  sessionName: string;
  username: string;
  id: string;
  state: string;
  type: string;
}

export interface GPOInfo {
  DisplayName: string;
  GpoStatus: string;
  CreationTime?: Date;
  ModificationTime?: Date;
}

export interface SecretData {
  name: string;
  value: string;
  category: string;
  description?: string;
  expiresAt?: Date;
  tags?: string[];
}

export interface SecretStats {
  total: number;
  byCategory: { [key: string]: number };
  expiringSoon: number;
}

/**
 * Security Service Configuration
 */
export interface SecurityConfig {
  // Password Policy
  passwordMinLength?: number;
  passwordMaxAge?: number; // days
  passwordComplexity?: boolean;

  // Session Management
  sessionTimeout?: number; // minutes
  maxActiveSessions?: number;

  // Audit Settings
  auditLogRetention?: number; // days
  auditLevel?: 'basic' | 'detailed' | 'verbose';

  // Rate Limiting
  rateLimitWindow?: number; // ms
  rateLimitMax?: number; // requests

  // Encryption
  encryptionAlgorithm?: 'aes-256-cbc' | 'aes-256-gcm';
  keyRotationInterval?: number; // days
}

/**
 * Default Security Configuration
 */
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  passwordMinLength: 8,
  passwordMaxAge: 90,
  passwordComplexity: true,
  sessionTimeout: 30,
  maxActiveSessions: 5,
  auditLogRetention: 365,
  auditLevel: 'detailed',
  rateLimitWindow: 60000,
  rateLimitMax: 100,
  encryptionAlgorithm: 'aes-256-cbc',
  keyRotationInterval: 90,
};

/**
 * Security Event Types
 */
export enum SecurityEventType {
  // Authentication Events
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  TOKEN_REFRESH = 'TOKEN_REFRESH',

  // Authorization Events
  ACCESS_GRANTED = 'ACCESS_GRANTED',
  ACCESS_DENIED = 'ACCESS_DENIED',
  ROLE_CHANGED = 'ROLE_CHANGED',

  // Security Events
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',

  // Secret Events
  SECRET_CREATED = 'SECRET_CREATED',
  SECRET_ACCESSED = 'SECRET_ACCESSED',
  SECRET_DELETED = 'SECRET_DELETED',
  SECRET_EXPIRED = 'SECRET_EXPIRED',

  // System Events
  CONFIG_CHANGED = 'CONFIG_CHANGED',
  BACKUP_CREATED = 'BACKUP_CREATED',
  SYSTEM_START = 'SYSTEM_START',
  SYSTEM_STOP = 'SYSTEM_STOP',
}

/**
 * Severity Levels
 */
export enum SeverityLevel {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO',
}

/**
 * Security Event Interface
 */
export interface SecurityEvent {
  type: SecurityEventType;
  severity: SeverityLevel;
  timestamp: Date;
  userId?: string;
  organizationId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}
