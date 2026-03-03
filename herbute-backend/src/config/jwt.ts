/**
 *
 * config/jwt.ts          Configuration JWT RS256
 *
 *
 * RS256 vs HS256 :
 *  - HS256 : Une seule cl     sym    trique          tous les services
 *            peuvent SIGNER ET V     RIFIER (dangeureux si un service est compromis)
 *  - RS256 : Cl     priv    e (signe) dans ce backend uniquement
 *            Cl     publique (v    rifie seulement)          peut     tre distribu    e
 *
 * Ce backend est le seul     poss    der JWT_PRIVATE_KEY.
 * Tout service tiers n'a acc    s qu'    JWT_PUBLIC_KEY.
 */

import fs from 'fs';
import path from 'path';

//
// Chargement des cl    s (depuis env ou fichiers)
//
const loadKey = (envVar: string, filePath?: string): string => {
  // Priorit     1 : Variable d'environnement (production, CI/CD)
  if (process.env[envVar]) {
    // Les \n     chapp    s dans les env vars Docker/CI doivent     tre convertis
    return process.env[envVar]!.replace(/\\n/g, '\n');
  }

  // Priorit     2 : Fichier local (d    veloppement)
  if (filePath) {
    const fullPath = path.resolve(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath, 'utf-8');
    }
  }

  throw new Error(
    `[JWT] Cl     manquante: ${envVar} non d    finie et fichier ${filePath} introuvable.\n` +
    `Lancez: chmod +x generate-keys.sh && ./generate-keys.sh`
  );
};

//
// Export des cl    s et de la configuration
//
export const jwtConfig = {
  /** Cl     priv    e RSA          signature uniquement, JAMAIS expos    e */
  privateKey: loadKey('JWT_PRIVATE_KEY', './keys/private.pem'),

  /** Cl     publique RSA          v    rification, peut     tre partag    e */
  publicKey: loadKey('JWT_PUBLIC_KEY', './keys/public.pem'),

  algorithm: 'RS256' as const,

  /** Dur    e de vie du access token */
  accessTokenTtl: process.env.JWT_ACCESS_TTL || '15m',

  /** Dur    e de vie du refresh token */
  refreshTokenTtl: process.env.JWT_REFRESH_TTL || '7d',

  issuer: process.env.JWT_ISSUER || 'herbute.ma',
  audience: process.env.JWT_AUDIENCE || 'herbute-app',
};

// Validation au d    marrage
const validateKeys = () => {
  if (!jwtConfig.privateKey.includes('-----BEGIN')) {
    throw new Error('[JWT] Cl     priv    e invalide          format PEM requis');
  }
  if (!jwtConfig.publicKey.includes('-----BEGIN')) {
    throw new Error('[JWT] Cl     publique invalide          format PEM requis');
  }
  console.log('        [JWT] Cl    s RS256 charg    es et valid    es');
};

validateKeys();
