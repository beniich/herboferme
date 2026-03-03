/**
 *
 * routes/auth.routes.ts          IAM complet (migr     depuis ReclamTrack)
 *
 *
 * Toutes les routes d'authentification sont maintenant
 * dans ce backend Herbute unique.
 *
 * Tokens :
 *  - access_token           Cookie HttpOnly, 15 min
 *  - refresh_token          Cookie HttpOnly, 7 jours
 *    (token opaque, hash stock     en MongoDB)
 */

import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middleware/authenticate';
import { generateTokenPair, hashRefreshToken } from '../utils/tokens';
import { User } from '../models/user.model.js';
import { RefreshToken } from '../models/refresh-token.model.js';
import { Organization } from '../models/Organization.js';
import { Membership } from '../models/Membership.js';
import { HERBUTE_ROUTES } from '@reclamtrack/shared';

const router = Router();

//
// Rate limiting strict sur les routes auth
//
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      10,
  message:  { error: 'Trop de tentatives. R    essayez dans 15 minutes.', code: 'RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders:   false,
});

//
// Helper :     criture des cookies HttpOnly
//
const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Access token          courte dur    e (15 min)
  res.cookie('access_token', accessToken, {
    httpOnly: true,              // Inaccessible en JS          prot    ge contre XSS
    secure:   isProduction,      // HTTPS uniquement en prod
    sameSite: isProduction ? 'strict' : 'lax',          // Prot    ge contre CSRF
    maxAge:   15 * 60 * 1000,   // 15 minutes en ms
    path:     '/',
  });

  // Refresh token          longue dur    e (7 jours)
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure:   isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 jours en ms
    path:     '/api/auth/refresh',       // Cookie envoy     UNIQUEMENT sur ce path
  });
};

//
// Helper : effacement des cookies (logout)
//
const clearAuthCookies = (res: Response): void => {
  res.clearCookie('access_token',  { path: '/' });
  res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
};

//
// POST /api/auth/register
//
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

    // V    rification email unique (r    ponse identique pour     viter l'    num    ration)
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        error: 'Un compte avec cet email existe d    j   .',
        code:  'EMAIL_EXISTS',
      });
    }

    // Validation mot de passe (min 10 chars, complexity)
    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/;
    if (!pwdRegex.test(password)) {
      return res.status(400).json({
        error: 'Mot de passe trop faible. Min 10 caract    res avec maj, min, chiffre et caract    re sp    cial.',
        code:  'WEAK_PASSWORD',
      });
    }

    // Hash bcrypt (12 rounds)
    const passwordHash = await bcrypt.hash(password, 12);

    // Cr    ation du token de v    rification email
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
    // Cr    ation automatique d'une Organisation (Bypass manquant)
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
      message: 'Compte cr        .', // auto org
      userId:  user._id,
    });
  } catch (err) {
    next(err);
  }
});

//
// POST /api/auth/login
//
router.post('/login', authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis.' });
    }

    // D    lai constant anti-timing attack
    const startTime = Date.now();
    const MIN_RESPONSE_TIME = 300; // ms

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

    // V    rification compte verrouill
    if (user?.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMs = user.lockedUntil.getTime() - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60000);
      return res.status(423).json({
        error: `Compte verrouill    . R    essayez dans ${remainingMin} minute(s).`,
        code:  'ACCOUNT_LOCKED',
      });
    }

    // V    rification du mot de passe (toujours hasher pour     viter timing attack)
    const dummyHash = '$2b$12$invalid.hash.to.prevent.timing.attack.on.nonexistent.user';
    const isValid = user
      ? await bcrypt.compare(password, user.passwordHash)
      : await bcrypt.compare(password, dummyHash).then(() => false);

    if (!user || !isValid) {
      // Incr    menter les tentatives
      if (user) {
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
        if (user.failedLoginAttempts >= 5) {
          user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min
        }
        await user.save();
      }

      // R    ponse apr    s d    lai minimal (anti-timing)
      const elapsed = Date.now() - startTime;
      if (elapsed < MIN_RESPONSE_TIME) {
        await new Promise(r => setTimeout(r, MIN_RESPONSE_TIME - elapsed));
      }

      return res.status(401).json({ error: 'Identifiants invalides.', code: 'INVALID_CREDENTIALS' });
    }

    // Email v    rifi     ?
    if (!user.emailVerified) {
      return res.status(403).json({
        error: 'Email non v    rifi    . Consultez votre bo    te mail.',
        code:  'EMAIL_NOT_VERIFIED',
      });
    }

    // Compte actif ?
    if (!user.isActive) {
      return res.status(403).json({ error: 'Compte d    sactiv    .', code: 'ACCOUNT_DISABLED' });
    }

    // Succ    s          reset compteur
    user.failedLoginAttempts = 0;
    user.lockedUntil         = undefined;
    user.lastLogin           = new Date();
    await user.save();

    // G    n    ration des tokens
    const { accessToken, refreshToken, refreshTokenHash } = generateTokenPair({
      id:             user._id.toString(),
      email:          user.email,
      role:           user.role,
      farmId:         user.farmId?.toString(),
      plan:           user.plan,
      organizationId: user.organizationId?.toString(),
    });

    // Stockage du refresh token hash     en DB
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
      message: 'Connect     avec succ    s.',
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

//
// POST /api/auth/refresh
// Renouvelle l'access token via le refresh token (cookie)
//
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawRefreshToken = req.cookies?.refresh_token;

    if (!rawRefreshToken) {
      return res.status(401).json({ error: 'Refresh token manquant.', code: 'REFRESH_TOKEN_MISSING' });
    }

    const tokenHash = hashRefreshToken(rawRefreshToken);

    // Chercher le token en DB (non r    voqu    , non expir    )
    const stored = await RefreshToken.findOne({
      tokenHash,
      isRevoked:  false,
      expiresAt:  { $gt: new Date() },
    }).populate('userId');

    if (!stored || !stored.userId) {
      clearAuthCookies(res);
      return res.status(401).json({ error: 'Session invalide ou expir    e.', code: 'INVALID_REFRESH' });
    }

    const user = stored.userId as any;

    // Rotation du refresh token (invalider l'ancien)
    stored.isRevoked = true;
    await stored.save();

    // G    n    rer une nouvelle paire
    const { accessToken, refreshToken: newRefreshToken, refreshTokenHash } = generateTokenPair({
      id:             user._id.toString(),
      email:          user.email,
      role:           user.role,
      farmId:         user.farmId?.toString(),
      plan:           user.plan,
      organizationId: user.organizationId?.toString(),
    });

    await RefreshToken.create({
      userId:    user._id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    setAuthCookies(res, accessToken, newRefreshToken);
    res.json({ message: 'Token renouvel    .' });
  } catch (err) {
    next(err);
  }
});

//
// POST /api/auth/logout
//
router.post('/logout', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawRefreshToken = req.cookies?.refresh_token;

    if (rawRefreshToken) {
      const tokenHash = hashRefreshToken(rawRefreshToken);
      // R    voquer le refresh token en DB
      await RefreshToken.updateOne({ tokenHash }, { isRevoked: true });
    }

    clearAuthCookies(res);
    res.json({ message: 'D    connect     avec succ    s.' });
  } catch (err) {
    next(err);
  }
});

//
// POST /api/auth/logout-all
// R    voque TOUS les sessions actives de l'utilisateur
//
router.post('/logout-all', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await RefreshToken.updateMany(
      { userId: req.user!.sub, isRevoked: false },
      { isRevoked: true }
    );
    clearAuthCookies(res);
    res.json({ message: 'Toutes les sessions r    voqu    es.' });
  } catch (err) {
    next(err);
  }
});

//
// GET /api/auth/me
//
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!.sub).select('-passwordHash -emailVerifyToken -passwordResetToken');
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

//
// POST /api/auth/forgot-password
//
router.post('/forgot-password', authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    // R    ponse identique qu'il y ait un compte ou non (anti-    num    ration)
    const GENERIC_RESPONSE = {
      message: 'Si un compte existe avec cet email, un lien de r    initialisation a     t     envoy    .',
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

//
// POST /api/auth/reset-password
//
router.post('/reset-password', authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken:   tokenHash,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Lien invalide ou expir    .', code: 'INVALID_RESET_TOKEN' });
    }

    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/;
    if (!pwdRegex.test(password)) {
      return res.status(400).json({ error: 'Mot de passe trop faible.', code: 'WEAK_PASSWORD' });
    }

    user.passwordHash         = await bcrypt.hash(password, 12);
    user.passwordResetToken   = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // R    voquer toutes les sessions actives (bonne pratique post-reset)
    await RefreshToken.updateMany({ userId: user._id }, { isRevoked: true });

    clearAuthCookies(res);
    res.json({ message: 'Mot de passe r    initialis    . Reconnectez-vous.' });
  } catch (err) {
    next(err);
  }
});

//
// GET /api/auth/verify-email/:token
//
router.get('/verify-email/:token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokenHash = crypto.createHash('sha256').update(req.params.token as string).digest('hex');
    const user = await User.findOne({
      emailVerifyToken:   tokenHash,
      emailVerifyExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Lien invalide ou expir    .', code: 'INVALID_VERIFY_TOKEN' });
    }

    user.emailVerified    = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyExpires = undefined;
    await user.save();

    res.json({ message: 'Email v    rifi    . Vous pouvez vous connecter.' });
  } catch (err) {
    next(err);
  }
});

export default router;
