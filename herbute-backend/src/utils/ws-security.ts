/**
 * ═══════════════════════════════════════════════════════
 * soap/middleware/ws-security.ts — WS-Security Handler
 * ═══════════════════════════════════════════════════════
 *
 * WS-Security est le mécanisme d'authentification natif SOAP.
 * Il s'intègre dans le SOAP Header (pas le Body) sous la forme :
 *
 * <soap:Header>
 *   <wsse:Security>
 *     <wsse:BinarySecurityToken
 *       ValueType="http://herbute.ma/token#JWT"
 *       EncodingType="...#Base64Binary">
 *       eyJhbGciOiJSUzI1NiJ9...  ← Notre JWT RS256 en Base64
 *     </wsse:BinarySecurityToken>
 *   </wsse:Security>
 * </soap:Header>
 *
 * On réutilise notre JWT RS256 existant comme BinarySecurityToken.
 * Pas besoin d'un nouveau système — on adapte ce qu'on a.
 *
 * Opérations qui NE nécessitent PAS le header :
 *   - Login (on s'authentifie justement)
 *   - RefreshToken (le token est expiré)
 *   - ForgotPassword (public)
 *   - ResetPassword (token dans le body)
 *   - VerifyEmail (token dans le body)
 *
 * Opérations qui NÉCESSITENT le header :
 *   - Logout
 *   - GetCurrentUser
 */

import { verifyAccessToken } from './tokens.js';
import type { JWTPayload } from '../config/jwt.js';

// Opérations publiques (pas de WS-Security requis)
const PUBLIC_OPERATIONS = new Set([
  'Login',
  'RefreshToken',
  'ForgotPassword',
  'ResetPassword',
  'VerifyEmail',
]);

// ─────────────────────────────────────────────
// Extrait le JWT depuis le SOAP Header WS-Security
// ─────────────────────────────────────────────
const extractTokenFromHeader = (soapHeader: Record<string, any>): string | null => {
  try {
    // Structure : soapHeader.Security.BinarySecurityToken
    const security = soapHeader?.Security || soapHeader?.['wsse:Security'];
    if (!security) return null;

    const bst = security.BinarySecurityToken
      || security['wsse:BinarySecurityToken']
      || security.$value;

    if (!bst) return null;

    // Le token peut être une string directe ou un objet avec $value
    const tokenBase64 = typeof bst === 'string' ? bst : bst.$value || bst._;

    if (!tokenBase64) return null;

    // Décoder le Base64 → JWT string
    return Buffer.from(tokenBase64.trim(), 'base64').toString('utf-8');
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────
// Résultat de la validation WS-Security
// ─────────────────────────────────────────────
export interface WsSecurityResult {
  authenticated: boolean;
  user?: JWTPayload;
  error?: string;
  errorCode?: string;
}

// ─────────────────────────────────────────────
// Valide le WS-Security header pour une opération donnée
// Retourne { authenticated: true, user } ou { authenticated: false, error }
// ─────────────────────────────────────────────
export const validateWsSecurity = (
  soapHeader: Record<string, any>,
  operationName: string
): WsSecurityResult => {

  // Opérations publiques → pas besoin d'authentification
  if (PUBLIC_OPERATIONS.has(operationName)) {
    return { authenticated: true };
  }

  // Extraire le token du header
  const token = extractTokenFromHeader(soapHeader);

  if (!token) {
    return {
      authenticated: false,
      error:     'WS-Security header manquant ou invalide',
      errorCode: 'TOKEN_MISSING',
    };
  }

  // Vérifier le JWT RS256
  try {
    const payload = verifyAccessToken(token);
    return { authenticated: true, user: payload };
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return {
        authenticated: false,
        error:     'Token expiré. Utilisez RefreshToken pour renouveler.',
        errorCode: 'TOKEN_EXPIRED',
      };
    }
    return {
      authenticated: false,
      error:     'Token invalide ou signature incorrecte.',
      errorCode: 'TOKEN_INVALID',
    };
  }
};

// ─────────────────────────────────────────────
// Helper : construire un SOAP Fault standard
// Équivalent HTTP 401/403 mais en XML SOAP
// ─────────────────────────────────────────────
export const buildAuthFault = (code: string, message: string): never => {
  const fault = {
    Fault: {
      faultcode:   'Client.Authentication',
      faultstring: message,
      detail: {
        AuthFaultDetail: {
          code,
          message,
        },
      },
    },
  };
  throw fault;
};
