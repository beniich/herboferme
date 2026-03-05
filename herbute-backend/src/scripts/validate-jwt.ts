/**
 * Validate JWT RS256 signing and verification using keys in ./keys/
 */
import { generateToken, verifyToken } from '../config/jwt.js';

async function validateJWT() {
  console.log('--- VALIDATION JWT RS256 ---');

  const payload = {
    userId: 'test-user-001',
    email: 'test@herbute.ma',
    organizationId: 'org-001',
    roles: ['admin'],
  };

  try {
    // Sign
    const token = generateToken(payload);
    console.log(`✅ Token généré (${token.length} chars)`);
    console.log(`   Début: ${token.substring(0, 50)}...`);

    // Verify
    const decoded = verifyToken(token);
    if (!decoded) {
      console.error('❌ Vérification échouée — token invalide');
      process.exit(1);
    }

    console.log('✅ Token vérifié avec succès');
    console.log(`   userId: ${decoded.userId}`);
    console.log(`   email:  ${decoded.email}`);
    console.log(`   roles:  ${decoded.roles.join(', ')}`);
    console.log(`   org:    ${decoded.organizationId}`);

    // Check algorithm (RS256 vs HS256)
    const [, payloadB64] = token.split('.');
    const headerB64 = token.split('.')[0];
    const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString());
    console.log(`\n🔐 Algorithme JWT: ${header.alg}`);
    
    if (header.alg === 'RS256') {
      console.log('✅ RS256 activé — signature asymétrique');
    } else {
      console.log('⚠️  HS256 utilisé (RS256 non configuré)');
    }

    console.log('\n✅ VALIDATION JWT OK');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Erreur JWT:', err.message);
    process.exit(1);
  }
}

validateJWT();
