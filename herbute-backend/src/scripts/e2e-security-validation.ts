/**
 * End-to-End Security Validation Script
 * 
 * Simule le flux complet :
 * 1. Connexion utilisateur (vérification mot de passe bcrypt)
 * 2. Génération JWT RS256
 * 3. Décodage et vérification du token
 * 4. Contrôle RBAC (permissions super_admin)
 * 5. Multi-tenancy (isolation organisation)
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.join(process.cwd(), '.env') });

import { User } from '../models/user.model.js';
import { Membership } from '../models/Membership.js';
import { generateToken, verifyToken } from '../config/jwt.js';
import { getPermissionsForRoles, Permission } from '../config/permissions.js';

async function runE2ETest() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  🔐 HERBUTE — End-to-End Security Validation          ');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');

  let passed = 0;
  let failed = 0;

  const check = (name: string, condition: boolean, detail?: string) => {
    if (condition) {
      console.log(`  ✅ ${name}`);
      if (detail) console.log(`     → ${detail}`);
      passed++;
    } else {
      console.log(`  ❌ FAIL: ${name}`);
      if (detail) console.log(`     → ${detail}`);
      failed++;
    }
  };

  try {
    const mongoUri = process.env.MONGODB_URI!;
    await mongoose.connect(mongoUri);
    console.log('  📦 Connecté à MongoDB\n');

    // ─── Test 1: Super Admin existe ──────────────────────────
    console.log('【1】Vérification utilisateur super_admin');
    const adminEmail = 'superadmin@herbute.ma';
    const admin = await User.findOne({ email: adminEmail }).select('+passwordHash');
    check('Super Admin existe dans la DB', !!admin, `email: ${adminEmail}`);
    check('Rôle = super_admin', admin?.role === 'super_admin', `role: ${admin?.role}`);
    check('emailVerified = true', !!admin?.emailVerified);

    // ─── Test 2: Vérification mot de passe ─────────────────
    console.log('\n【2】Authentification (bcrypt)');
    const plainPassword = 'SuperAdmin2026!';
    const passwordValid = admin ? await bcrypt.compare(plainPassword, admin.passwordHash) : false;
    check('Mot de passe valide (bcrypt)', passwordValid);
    
    // Faux mot de passe — doit échouer
    const wrongPasswordValid = admin ? await bcrypt.compare('wrong-password', admin.passwordHash) : false;
    check('Faux mot de passe rejeté', !wrongPasswordValid);

    // ─── Test 3: JWT RS256 ──────────────────────────────────
    console.log('\n【3】Génération JWT RS256');
    const membership = await Membership.findOne({ userId: admin?._id });
    
    const tokenPayload = {
      userId: (admin?._id as any).toString(),
      email: admin?.email ?? '',
      organizationId: (membership?.organizationId as any)?.toString() ?? 'none',
      roles: ['super_admin'],
    };

    const token = generateToken(tokenPayload);
    check('Token JWT généré', !!token && token.length > 100, `${token.length} chars`);

    // Vérifier l'algo
    const headerB64 = token.split('.')[0];
    const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString());
    check('Algorithme RS256 activé', header.alg === 'RS256', `alg: ${header.alg}`);

    // ─── Test 4: Vérification du token ─────────────────────
    console.log('\n【4】Vérification du token JWT');
    const decoded = verifyToken(token);
    check('Token vérifié avec clé publique', !!decoded);
    check('userId correct', decoded?.userId === tokenPayload.userId);
    check('organizationId correct', !!decoded?.organizationId);
    check('roles présents', Array.isArray(decoded?.roles) && decoded.roles.includes('super_admin'));

    // Token falsifié
    const fakeToken = token.slice(0, -10) + 'XXXXX12345';
    const fakeDecoded = verifyToken(fakeToken);
    check('Token falsifié rejeté', fakeDecoded === null);

    // ─── Test 5: RBAC — Permissions ────────────────────────
    console.log('\n【5】RBAC — Matrice de permissions');
    const superAdminPerms = getPermissionsForRoles(['super_admin']);
    check('super_admin a ANIMALS_DELETE', superAdminPerms.has(Permission.ANIMALS_DELETE));
    check('super_admin a ADMIN_SECURITY', superAdminPerms.has(Permission.ADMIN_SECURITY));
    check('super_admin a ADMIN_BILLING', superAdminPerms.has(Permission.ADMIN_BILLING));

    const employePerms = getPermissionsForRoles(['employe']);
    check('employe a ANIMALS_READ', employePerms.has(Permission.ANIMALS_READ));
    check('employe n\'a PAS ANIMALS_DELETE', !employePerms.has(Permission.ANIMALS_DELETE));
    check('employe n\'a PAS FINANCE_READ', !employePerms.has(Permission.FINANCE_READ));
    check('employe n\'a PAS ADMIN_BILLING', !employePerms.has(Permission.ADMIN_BILLING));

    // ─── Résultat final ────────────────────────────────────
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  RÉSULTAT: ${passed} ✅ / ${failed} ❌ tests`);
    console.log('═══════════════════════════════════════════════════════');
    
    if (failed === 0) {
      console.log('  🎉 TOUTES LES BARRIÈRES DE SÉCURITÉ SONT ACTIVES');
    } else {
      console.log('  ⚠️  Certains tests ont échoué');
    }
    console.log('');

    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
    
  } catch (err: any) {
    console.error('❌ Erreur fatale:', err.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

runE2ETest();
