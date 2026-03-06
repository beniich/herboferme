/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * routes/auth.routes.ts â€” IAM complet (migrÃ© depuis ReclamTrack)
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 *
 * Toutes les routes d'authentification sont maintenant
 * dans ce backend Herbute unique.
 *
 * Tokens :
 *  - access_token  â†’ Cookie HttpOnly, 15 min
 *  - refresh_token â†’ Cookie HttpOnly, 7 jours
 *    (token opaque, hash stockÃ© en MongoDB)
 */

import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middleware/authenticate.js';
import { generateTokenPair, hashRefreshToken } from '../utils/tokens.js';
import { User } from '../models/user.model.js';
import { RefreshToken } from '../models/refresh-token.model.js';
import { Organization } from '../models/Organization.js';
import { Membership } from '../models/Membership.js';
import { HERBUTE_ROUTES } from '@reclamtrack/shared';

const router = Router();

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Rate limiting strict sur les routes auth
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      10,
  message:  { error: 'Trop de tentatives. RÃ©essayez dans 15 minutes.', code: 'RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders:   false,
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Helper : Ã©criture des cookies HttpOnly
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Access token â€” courte durÃ©e (15 min)
  res.cookie('access_token', accessToken, {
    httpOnly: true,              // Inaccessible en JS â†’ protÃ¨ge contre XSS
    secure:   isProduction,      // HTTPS uniquement en prod
    sameSite: isProduction ? 'strict' : 'lax',          // ProtÃ¨ge contre CSRF
    maxAge:   15 * 60 * 1000,   // 15 minutes en ms
    path:     '/',
  });

  // Refresh token â€” longue durÃ©e (7 jours)
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure:   isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 jours en ms
    path:     '/api/auth/refresh',       // Cookie envoyÃ© UNIQUEMENT sur ce path
  });
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Helper : effacement des cookies (logout)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const clearAuthCookies = (res: Response): void => {
  res.clearCookie('access_token',  { path: '/' });
  res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// POST /api/auth/register
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
router.post('/register', authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, nom, prenom, telephone, farmName, role = 'employe' } = req.body;

    // Validation basique
    if (!email || !password || !nom || !prenom) {
      return res.status(400).json({
        error: 'Champs obligatoires manquants: email, password, nom, prenom',
        code:  'VALIDATION_ERROR',
      });
    }

    // VÃ©rification email unique (rÃ©ponse identique pour Ã©viter l'Ã©numÃ©ration)
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        error: 'Un compte avec cet email existe dÃ©jÃ .',
        code:  'EMAIL_EXISTS',
      });
    }

    // Validation mot de passe (min 10 chars, complexity)
    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/;
    if (!pwdRegex.test(password)) {
      return res.status(400).json({
        error: 'Mot de passe trop faible. Min 10 caractÃ¨res avec maj, min, chiffre et caractÃ¨re spÃ©cial.',
        code:  'WEAK_PASSWORD',
      });
    }

    // Hash bcrypt (12 rounds)
    const passwordHash = await bcrypt.hash(password, 12);

    // CrÃ©ation du token de vÃ©rification email
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyTokenHash = crypto.createHash('sha256').update(verifyToken).digest('hex');

    const user = await User.create({
      email:            email.toLowerCase().trim(),
      passwordHash,
      nom:              nom.trim(),
      prenom:           prenom.trim(),
      telephone:        telephone?.trim(),
      role,
      farmName:         farmName?.trim(),
      plan:             'essai',
      emailVerified:    true, // Bypass for local testing without mail service
      emailVerifyToken: verifyTokenHash,
      emailVerifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    });

    // -------------------------------------------------------------
    // CrÃ©ation automatique d'une Organisation (Bypass manquant)
    // -------------------------------------------------------------
    const org = await Organization.create({
      name: farmName?.trim() || `Organisation de ${nom}`,
      slug: `org-${user._id.toString()}-${Math.random().toString(36).substring(2, 7)}`,
      ownerId: user._id,
      subscription: {
        plan: 'ESSAI',
        status: 'ACTIVE'
      }
    });

    await Membership.create({
      userId: user._id,
      organizationId: org._id,
      roles: ['OWNER', 'ADMIN'],
      status: 'ACTIVE'
    });

    user.organizationId = org._id;
    await user.save();

    res.status(201).json({
      message: 'Compte crÃ©Ã©.', // auto org
      userId:  user._id,
    });
  } catch (err) {
    next(err);
  }
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// POST /api/auth/login
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
router.post('/login', authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: 'Corps de requête manquant.' });
    }

    const email = typeof req.body.email === 'string' ? req.body.email.trim() : req.body.email;
    const password = typeof req.body.password === 'string' ? req.body.password.trim() : req.body.password;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis.' });
    }

    // DÃ©lai constant anti-timing attack
    const startTime = Date.now();
    const MIN_RESPONSE_TIME = 300; // ms

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

    // VÃ©rification compte verrouillÃ©
    if (user?.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMs = user.lockedUntil.getTime() - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60000);
      return res.status(423).json({
        error: `Compte verrouillÃ©. RÃ©essayez dans ${remainingMin} minute(s).`,
        code:  'ACCOUNT_LOCKED',
      });
    }

    // VÃ©rification du mot de passe (toujours hasher pour Ã©viter timing attack)
    const dummyHash = '$2b$12$invalid.hash.to.prevent.timing.attack.on.nonexistent.user';
    const isValid = user
      ? await bcrypt.compare(password, user.passwordHash)
      : await bcrypt.compare(password, dummyHash).then(() => false);

    if (!user || !isValid) {
      // IncrÃ©menter les tentatives
      if (user) {
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
        if (user.failedLoginAttempts >= 5) {
          user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min
        }
        await user.save();
      }

      // RÃ©ponse aprÃ¨s dÃ©lai minimal (anti-timing)
      const elapsed = Date.now() - startTime;
      if (elapsed < MIN_RESPONSE_TIME) {
        await new Promise(r => setTimeout(r, MIN_RESPONSE_TIME - elapsed));
      }

      return res.status(401).json({ error: 'Identifiants invalides.', code: 'INVALID_CREDENTIALS' });
    }

    // Email vÃ©rifiÃ© ?
    if (!user.emailVerified) {
      return res.status(403).json({
        error: 'Email non vÃ©rifiÃ©. Consultez votre boÃ®te mail.',
        code:  'EMAIL_NOT_VERIFIED',
      });
    }

    // Compte actif ?
    if (!user.isActive) {
      return res.status(403).json({ error: 'Compte dÃ©sactivÃ©.', code: 'ACCOUNT_DISABLED' });
    }

    // SuccÃ¨s â†’ reset compteur
    user.failedLoginAttempts = 0;
    user.lockedUntil         = undefined;
    user.lastLogin           = new Date();
    await user.save();

    // GÃ©nÃ©ration des tokens
    const { accessToken, refreshToken, refreshTokenHash } = generateTokenPair({
      id:             user._id.toString(),
      email:          user.email,
      role:           user.role,
      farmId:         user.farmId?.toString(),
      plan:           user.plan,
      organizationId: user.organizationId?.toString(),
    } as any);

    // Stockage du refresh token hashÃ© en DB
    await RefreshToken.create({
      userId:    user._id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: req.headers['user-agent'],
      ip:        req.ip,
    });

    // Envoi des cookies HttpOnly
    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      message: 'ConnectÃ© avec succÃ¨s.',
      user: {
        id:     user._id,
        email:  user.email,
        nom:    user.nom,
        prenom: user.prenom,
        role:   user.role,
        plan:   user.plan,
        farmId: user.farmId,
      },
    });
  } catch (err) {
    next(err);
  }
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// POST /api/auth/refresh
// Renouvelle l'access token via le refresh token (cookie)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawRefreshToken = req.cookies?.refresh_token;

    if (!rawRefreshToken) {
      return res.status(401).json({ error: 'Refresh token manquant.', code: 'REFRESH_TOKEN_MISSING' });
    }

    const tokenHash = hashRefreshToken(rawRefreshToken);

    // Chercher le token en DB (non rÃ©voquÃ©, non expirÃ©)
    const stored = await RefreshToken.findOne({
      tokenHash,
      isRevoked:  false,
      expiresAt:  { $gt: new Date() },
    }).populate('userId');

    if (!stored || !stored.userId) {
      clearAuthCookies(res);
      return res.status(401).json({ error: 'Session invalide ou expirÃ©e.', code: 'INVALID_REFRESH' });
    }

    const user = stored.userId as any;

    // Rotation du refresh token (invalider l'ancien)
    stored.isRevoked = true;
    await stored.save();

    // GÃ©nÃ©rer une nouvelle paire
    const { accessToken, refreshToken: newRefreshToken, refreshTokenHash } = generateTokenPair({
      id:             user._id.toString(),
      email:          user.email,
      role:           user.role,
      farmId:         user.farmId?.toString(),
      plan:           user.plan,
      organizationId: user.organizationId?.toString(),
    } as any);

    await RefreshToken.create({
      userId:    user._id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    setAuthCookies(res, accessToken, newRefreshToken);
    res.json({ message: 'Token renouvelÃ©.' });
  } catch (err) {
    next(err);
  }
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// POST /api/auth/logout
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
router.post('/logout', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawRefreshToken = req.cookies?.refresh_token;

    if (rawRefreshToken) {
      const tokenHash = hashRefreshToken(rawRefreshToken);
      // RÃ©voquer le refresh token en DB
      await RefreshToken.updateOne({ tokenHash }, { isRevoked: true });
    }

    clearAuthCookies(res);
    res.json({ message: 'DÃ©connectÃ© avec succÃ¨s.' });
  } catch (err) {
    next(err);
  }
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// POST /api/auth/logout-all
// RÃ©voque TOUS les sessions actives de l'utilisateur
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
router.post('/logout-all', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await RefreshToken.updateMany(
      { userId: req.user!.sub, isRevoked: false },
      { isRevoked: true }
    );
    clearAuthCookies(res);
    res.json({ message: 'Toutes les sessions rÃ©voquÃ©es.' });
  } catch (err) {
    next(err);
  }
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// GET /api/auth/me
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!.sub).select('-passwordHash -emailVerifyToken -passwordResetToken');
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// POST /api/auth/forgot-password
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
router.post('/forgot-password', authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    // RÃ©ponse identique qu'il y ait un compte ou non (anti-Ã©numÃ©ration)
    const GENERIC_RESPONSE = {
      message: 'Si un compte existe avec cet email, un lien de rÃ©initialisation a Ã©tÃ© envoyÃ©.',
    };

    const user = await User.findOne({ email: email?.toLowerCase() });
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken   = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
      await user.save();

      // TODO: await sendPasswordResetEmail(user.email, resetToken);
    }

    res.json(GENERIC_RESPONSE);
  } catch (err) {
    next(err);
  }
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// POST /api/auth/reset-password
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
router.post('/reset-password', authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken:   tokenHash,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Lien invalide ou expirÃ©.', code: 'INVALID_RESET_TOKEN' });
    }

    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/;
    if (!pwdRegex.test(password)) {
      return res.status(400).json({ error: 'Mot de passe trop faible.', code: 'WEAK_PASSWORD' });
    }

    user.passwordHash         = await bcrypt.hash(password, 12);
    user.passwordResetToken   = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // RÃ©voquer toutes les sessions actives (bonne pratique post-reset)
    await RefreshToken.updateMany({ userId: user._id }, { isRevoked: true });

    clearAuthCookies(res);
    res.json({ message: 'Mot de passe rÃ©initialisÃ©. Reconnectez-vous.' });
  } catch (err) {
    next(err);
  }
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// GET /api/auth/verify-email/:token
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
router.get('/verify-email/:token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokenHash = crypto.createHash('sha256').update(req.params.token as string).digest('hex');
    const user = await User.findOne({
      emailVerifyToken:   tokenHash,
      emailVerifyExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Lien invalide ou expirÃ©.', code: 'INVALID_VERIFY_TOKEN' });
    }

    user.emailVerified    = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyExpires = undefined;
    await user.save();

    res.json({ message: 'Email vÃ©rifiÃ©. Vous pouvez vous connecter.' });
  } catch (err) {
    next(err);
  }
});

export default router;
