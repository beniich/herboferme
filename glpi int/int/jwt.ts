/**
 * ═══════════════════════════════════════════════════════
 * config/jwt.ts — Configuration JWT RS256
 * ═══════════════════════════════════════════════════════
 *
 * RS256 vs HS256 :
 *  - HS256 : Une seule clé symétrique → tous les services
 *            peuvent SIGNER ET VÉRIFIER (dangeureux si un service est compromis)
 *  - RS256 : Clé privée (signe) dans ce backend uniquement
 *            Clé publique (vérifie seulement) → peut être distribuée
 *
 * Ce backend est le seul à posséder JWT_PRIVATE_KEY.
 * Tout service tiers n'a accès qu'à JWT_PUBLIC_KEY.
 */

import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────
// Chargement des clés (depuis env ou fichiers)
// ─────────────────────────────────────────────
const loadKey = (envVar: string, filePath?: string): string => {
  // Priorité 1 : Variable d'environnement (production, CI/CD)
  if (process.env[envVar]) {
    // Les \n échappés dans les env vars Docker/CI doivent être convertis
    return process.env[envVar]!.replace(/\\n/g, '\n');
  }

  // Priorité 2 : Fichier local (développement)
  if (filePath) {
    const fullPath = path.resolve(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath, 'utf-8');
    }
  }

  throw new Error(
    `[JWT] Clé manquante: ${envVar} non définie et fichier ${filePath} introuvable.\n` +
    `Lancez: chmod +x generate-keys.sh && ./generate-keys.sh`
  );
};

// ─────────────────────────────────────────────
// Export des clés et de la configuration
// ─────────────────────────────────────────────
export const jwtConfig = {
  /** Clé privée RSA — signature uniquement, JAMAIS exposée */
  privateKey: loadKey('JWT_PRIVATE_KEY', './keys/private.pem'),

  /** Clé publique RSA — vérification, peut être partagée */
  publicKey: loadKey('JWT_PUBLIC_KEY', './keys/public.pem'),

  algorithm: 'RS256' as const,

  /** Durée de vie du access token */
  accessTokenTtl: process.env.JWT_ACCESS_TTL || '15m',

  /** Durée de vie du refresh token */
  refreshTokenTtl: process.env.JWT_REFRESH_TTL || '7d',

  issuer: process.env.JWT_ISSUER || 'herbute.ma',
  audience: process.env.JWT_AUDIENCE || 'herbute-app',
};

// Validation au démarrage
const validateKeys = () => {
  if (!jwtConfig.privateKey.includes('-----BEGIN')) {
    throw new Error('[JWT] Clé privée invalide — format PEM requis');
  }
  if (!jwtConfig.publicKey.includes('-----BEGIN')) {
    throw new Error('[JWT] Clé publique invalide — format PEM requis');
  }
  console.log('✅ [JWT] Clés RS256 chargées et validées');
};

validateKeys();
