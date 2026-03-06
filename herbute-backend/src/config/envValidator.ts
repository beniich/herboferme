import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';
config({ path: path.join(process.cwd(), '.env') });

// Variables minimales requises
const REQUIRED: string[] = [
  'PORT',
  'MONGODB_URI',
  'ALLOWED_ORIGINS',
];

// Au moins JWT_SECRET ou les deux clés PEM doivent être présentes
const JWT_HS256 = 'JWT_SECRET';
const JWT_RS256_PRIVATE = 'JWT_PRIVATE_KEY_PATH';
const JWT_RS256_PUBLIC = 'JWT_PUBLIC_KEY_PATH';

export const envValidator = (): void => {
  // Check required vars
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`❌ Variables manquantes (Herbute) : ${missing.join(', ')}`);
    process.exit(1);
  }

  // Check JWT config — RS256 ou HS256 (un est suffisant)
  const hasRS256 =
    process.env[JWT_RS256_PRIVATE] &&
    process.env[JWT_RS256_PUBLIC];
  const hasHS256 = !!process.env[JWT_HS256];

  if (!hasRS256 && !hasHS256) {
    console.error('❌ JWT non configuré — définir JWT_SECRET ou JWT_PRIVATE_KEY_PATH + JWT_PUBLIC_KEY_PATH');
    process.exit(1);
  }

  // Si RS256, vérifier que les fichiers PEM existent
  if (hasRS256) {
    const privPath = path.resolve(process.cwd(), process.env[JWT_RS256_PRIVATE]!);
    const pubPath = path.resolve(process.cwd(), process.env[JWT_RS256_PUBLIC]!);

    if (!fs.existsSync(privPath)) {
      console.error(`❌ Clé privée JWT introuvable : ${privPath}`);
      process.exit(1);
    }
    if (!fs.existsSync(pubPath)) {
      console.error(`❌ Clé publique JWT introuvable : ${pubPath}`);
      process.exit(1);
    }
    console.log('🔐 JWT RS256 : clés trouvées');
  } else {
    const secretLen = process.env[JWT_HS256]!.length;
    if (secretLen < 32) {
      console.warn(`⚠️  JWT_SECRET trop court (${secretLen} chars) — minimum recommandé : 64 chars`);
    }
    console.log(`🔑 JWT HS256 : secret de ${secretLen} chars`);
  }

  console.log('✅ Variables d\'environnement Herbute validées');
};
