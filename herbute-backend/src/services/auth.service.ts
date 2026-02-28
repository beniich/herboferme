/**
 * ═══════════════════════════════════════════════════════════════
 * soap/auth.service.ts — Implémentation du service SOAP Auth
 * ═══════════════════════════════════════════════════════════════
 *
 * Architecture hybride REST + SOAP :
 *
 *   REST  →  /api/auth/*      (JSON, cookies HttpOnly, clients web/mobile)
 *   SOAP  →  /soap/auth       (XML, pour clients enterprise, ERP, Java, C#)
 *
 * Les deux couches partagent :
 *   - Les mêmes modèles Mongoose (User, RefreshToken)
 *   - La même logique métier (fonctions importées depuis auth.service.logic.ts)
 *   - Les mêmes tokens RS256 (generateTokenPair, verifyAccessToken)
 *   - Le même système de cookies HttpOnly pour les refresh tokens
 *
 * Particularité SOAP :
 *   - Les erreurs sont des SOAP Faults (pas des HTTP 4xx)
 *   - Le token JWT peut être passé en paramètre XML (clients non-browser)
 *     OU via cookie HttpOnly (navigateurs, Next.js)
 *   - Le WSDL est servi automatiquement à /soap/auth?wsdl
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Request, Response } from 'express';
import { User } from '../models/user.model.js';
import { RefreshToken } from '../models/refresh-token.model.js';
import { generateTokenPair, verifyAccessToken, hashRefreshToken } from '../utils/tokens.js';

// ─────────────────────────────────────────────
// Types internes SOAP
// ─────────────────────────────────────────────
interface SoapContext {
  req: Request;
  res: Response;
}

// Réponse d'erreur SOAP standardisée (équivalent d'un HTTP 4xx en REST)
// En SOAP, les erreurs sont des "Faults" avec une structure XML définie
const createFault = (code: string, message: string, detail?: string) => {
  throw {
    Fault: {
      faultcode:   `tns:${code}`,
      faultstring: message,
      detail:      detail ? { message: detail } : undefined,
    },
  };
};

// Helper : cookies HttpOnly (partagé avec la couche REST)
const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('access_token', accessToken, {
    httpOnly: true, secure: isProd, sameSite: 'strict', maxAge: 15 * 60 * 1000,
  });
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true, secure: isProd, sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, path: '/api/auth/refresh',
  });
};

const clearAuthCookies = (res: Response) => {
  res.clearCookie('access_token',  { path: '/' });
  res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
};

// ═══════════════════════════════════════════════════════════════
// SERVICE OBJECT
// C'est l'objet que strong-soap lie au WSDL.
// La structure doit EXACTEMENT refléter la hiérarchie WSDL :
//   HerbuteAuthService → HerbuteAuthPort → { opération1, opération2... }
// ═══════════════════════════════════════════════════════════════
export const HerbuteAuthService = {
  HerbuteAuthService: {
    HerbuteAuthPort: {

      // ═══════════════════════════════════════════════════════
      // OPÉRATION 1 : Login
      //
      // Requête SOAP entrante (XML) :
      // <LoginRequest>
      //   <email>ahmed@farm.ma</email>
      //   <password>MonMotDePasse@1!</password>
      // </LoginRequest>
      //
      // Réponse SOAP (XML) :
      // <LoginResponse>
      //   <success>true</success>
      //   <message>Connecté avec succès.</message>
      //   <user><id>...</id><email>...</email>...</user>
      //   <token><accessToken>eyJ...</accessToken>...</token>
      // </LoginResponse>
      // ═══════════════════════════════════════════════════════
      Login: async (
        args: { email: string; password: string },
        _callback: unknown,
        ctx: SoapContext
      ) => {
        const { email, password } = args;
        const { req, res } = ctx;

        if (!email || !password) {
          createFault('VALIDATION_ERROR', 'Email et mot de passe requis.');
        }

        // Délai anti-timing attack (identique à la couche REST)
        const startTime = Date.now();
        const MIN_DELAY  = 300;

        const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

        // Vérification compte verrouillé
        if (user?.lockedUntil && user.lockedUntil > new Date()) {
          const remainMin = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
          createFault('ACCOUNT_LOCKED', `Compte verrouillé. Réessayez dans ${remainMin} minute(s).`);
        }

        const dummyHash = '$2b$12$invalid.hash.to.prevent.timing.attack.only';
        const isValid   = user
          ? await bcrypt.compare(password, user.passwordHash)
          : await bcrypt.compare(password, dummyHash).then(() => false);

        if (!user || !isValid) {
          if (user) {
            user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
            if (user.failedLoginAttempts >= 5) {
              user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
            }
            await user.save();
          }

          const elapsed = Date.now() - startTime;
          if (elapsed < MIN_DELAY) await new Promise(r => setTimeout(r, MIN_DELAY - elapsed));

          createFault('INVALID_CREDENTIALS', 'Identifiants invalides.');
        }

        if (!user!.emailVerified) {
          createFault('EMAIL_NOT_VERIFIED', 'Email non vérifié. Consultez votre boîte mail.');
        }

        if (!user!.isActive) {
          createFault('ACCOUNT_DISABLED', 'Compte désactivé.');
        }

        // Succès → reset compteur + génération tokens
        user!.failedLoginAttempts = 0;
        user!.lockedUntil         = undefined;
        user!.lastLogin           = new Date();
        await user!.save();

        const { accessToken, refreshToken, refreshTokenHash } = generateTokenPair({
          id:             user!._id.toString(),
          email:          user!.email,
          role:           user!.role,
          farmId:         user!.farmId?.toString(),
          plan:           user!.plan,
          organizationId: user!.organizationId?.toString(),
        });

        // Stocker le refresh token en DB (même logique que REST)
        await RefreshToken.create({
          userId:    user!._id,
          tokenHash: refreshTokenHash,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          userAgent: req.headers['user-agent'],
          ip:        req.ip,
        });

        // Cookie HttpOnly pour le refresh token (fonctionne aussi pour clients SOAP browser)
        setAuthCookies(res, accessToken, refreshToken);

        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        return {
          success: true,
          message: 'Connecté avec succès.',
          user: {
            id:        user!._id.toString(),
            email:     user!.email,
            nom:       user!.nom,
            prenom:    user!.prenom,
            role:      user!.role,
            plan:      user!.plan,
            farmId:    user!.farmId?.toString() ?? '',
            lastLogin: user!.lastLogin?.toISOString() ?? '',
          },
          token: {
            accessToken,
            tokenType: 'Bearer',
            expiresIn: 900,              // 15 min en secondes
            expiresAt: expiresAt.toISOString(),
          },
        };
      },

      // ═══════════════════════════════════════════════════════
      // OPÉRATION 2 : Register
      // ═══════════════════════════════════════════════════════
      Register: async (
        args: {
          email: string; password: string; nom: string;
          prenom: string; telephone?: string; farmName?: string;
        },
        _callback: unknown,
        _ctx: SoapContext
      ) => {
        const { email, password, nom, prenom, telephone, farmName } = args;

        if (!email || !password || !nom || !prenom) {
          createFault('VALIDATION_ERROR', 'Champs obligatoires: email, password, nom, prenom.');
        }

        const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/;
        if (!pwdRegex.test(password)) {
          createFault(
            'WEAK_PASSWORD',
            'Mot de passe trop faible. Min 10 caractères avec maj, min, chiffre et spécial.'
          );
        }

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
          createFault('EMAIL_EXISTS', 'Un compte avec cet email existe déjà.');
        }

        const passwordHash   = await bcrypt.hash(password, 12);
        const verifyToken     = crypto.randomBytes(32).toString('hex');
        const verifyTokenHash = crypto.createHash('sha256').update(verifyToken).digest('hex');

        const user = await User.create({
          email:              email.toLowerCase().trim(),
          passwordHash,
          nom:                nom.trim(),
          prenom:             prenom.trim(),
          telephone:          telephone?.trim(),
          farmName:           farmName?.trim(),
          role:               'employe',
          plan:               'essai',
          emailVerifyToken:   verifyTokenHash,
          emailVerifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        // TODO: await sendVerificationEmail(user.email, verifyToken);

        return {
          success: true,
          message: 'Compte créé. Vérifiez votre email pour activer votre compte.',
          userId:  user._id.toString(),
        };
      },

      // ═══════════════════════════════════════════════════════
      // OPÉRATION 3 : GetCurrentUser (équiv. REST GET /api/auth/me)
      // ═══════════════════════════════════════════════════════
      GetCurrentUser: async (
        args: { accessToken: string },
        _callback: unknown,
        _ctx: SoapContext
      ) => {
        if (!args.accessToken) {
          createFault('TOKEN_MISSING', 'Access token requis.');
        }

        let payload: any;
        try {
          payload = verifyAccessToken(args.accessToken);
        } catch (err: any) {
          const code = err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID';
          createFault(code, 'Token invalide ou expiré.');
        }

        const user = await User.findById(payload.sub)
          .select('-passwordHash -emailVerifyToken -passwordResetToken');

        if (!user) createFault('USER_NOT_FOUND', 'Utilisateur introuvable.');

        return {
          success: true,
          user: {
            id:        user!._id.toString(),
            email:     user!.email,
            nom:       user!.nom,
            prenom:    user!.prenom,
            role:      user!.role,
            plan:      user!.plan,
            farmId:    user!.farmId?.toString() ?? '',
            lastLogin: user!.lastLogin?.toISOString() ?? '',
          },
        };
      },

      // ═══════════════════════════════════════════════════════
      // OPÉRATION 4 : RefreshToken
      // ═══════════════════════════════════════════════════════
      RefreshToken: async (
        args: { refreshToken?: string },
        _callback: unknown,
        ctx: SoapContext
      ) => {
        const { req, res } = ctx;

        // Cookie HttpOnly prioritaire (browser), fallback paramètre XML (clients enterprise)
        const rawToken = req.cookies?.refresh_token || args.refreshToken;

        if (!rawToken) {
          createFault('REFRESH_TOKEN_MISSING', 'Refresh token manquant.');
        }

        const tokenHash = hashRefreshToken(rawToken!);
        const stored    = await RefreshToken.findOne({
          tokenHash,
          isRevoked:  false,
          expiresAt:  { $gt: new Date() },
        }).populate('userId');

        if (!stored?.userId) {
          clearAuthCookies(res);
          createFault('INVALID_REFRESH', 'Session invalide ou expirée. Reconnectez-vous.');
        }

        const user = stored!.userId as any;

        // Rotation du refresh token (invalider l'ancien)
        stored!.isRevoked = true;
        await stored!.save();

        const { accessToken, refreshToken: newRT, refreshTokenHash } = generateTokenPair({
          id: user._id.toString(), email: user.email, role: user.role,
          farmId: user.farmId?.toString(), plan: user.plan,
        });

        await RefreshToken.create({
          userId:    user._id,
          tokenHash: refreshTokenHash,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        setAuthCookies(res, accessToken, newRT);

        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        return {
          success: true,
          message: 'Token renouvelé.',
          token: {
            accessToken,
            tokenType: 'Bearer',
            expiresIn: 900,
            expiresAt: expiresAt.toISOString(),
          },
        };
      },

      // ═══════════════════════════════════════════════════════
      // OPÉRATION 5 : Logout
      // ═══════════════════════════════════════════════════════
      Logout: async (
        args: { accessToken: string; logoutAll?: boolean },
        _callback: unknown,
        ctx: SoapContext
      ) => {
        const { req, res } = ctx;

        let userId: string | undefined;
        try {
          const payload = verifyAccessToken(args.accessToken);
          userId = payload.sub;
        } catch {
          // Token déjà expiré → on révoque quand même les cookies
        }

        const rawRefreshToken = req.cookies?.refresh_token;
        if (rawRefreshToken) {
          const tokenHash = hashRefreshToken(rawRefreshToken);

          if (args.logoutAll && userId) {
            // Révoquer TOUTES les sessions de cet utilisateur
            await RefreshToken.updateMany({ userId, isRevoked: false }, { isRevoked: true });
          } else {
            // Révoquer seulement la session courante
            await RefreshToken.updateOne({ tokenHash }, { isRevoked: true });
          }
        }

        clearAuthCookies(res);

        return {
          success: true,
          message: args.logoutAll
            ? 'Toutes les sessions révoquées.'
            : 'Déconnecté avec succès.',
        };
      },

      // ═══════════════════════════════════════════════════════
      // OPÉRATION 6 : ForgotPassword
      // ═══════════════════════════════════════════════════════
      ForgotPassword: async (
        args: { email: string },
        _callback: unknown,
        _ctx: SoapContext
      ) => {
        // Réponse identique pour éviter l'énumération des emails (identique REST)
        const GENERIC = { success: true, message: 'Si un compte existe avec cet email, un lien a été envoyé.' };

        const user = await User.findOne({ email: args.email?.toLowerCase() });
        if (user) {
          const resetToken     = crypto.randomBytes(32).toString('hex');
          user.passwordResetToken   = crypto.createHash('sha256').update(resetToken).digest('hex');
          user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
          await user.save();
          // TODO: await sendPasswordResetEmail(user.email, resetToken);
        }

        return GENERIC;
      },

      // ═══════════════════════════════════════════════════════
      // OPÉRATION 7 : ResetPassword
      // ═══════════════════════════════════════════════════════
      ResetPassword: async (
        args: { token: string; password: string },
        _callback: unknown,
        ctx: SoapContext
      ) => {
        const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/;
        if (!pwdRegex.test(args.password)) {
          createFault('WEAK_PASSWORD', 'Mot de passe trop faible.');
        }

        const tokenHash = crypto.createHash('sha256').update(args.token).digest('hex');
        const user = await User.findOne({
          passwordResetToken:   tokenHash,
          passwordResetExpires: { $gt: new Date() },
        });

        if (!user) {
          createFault('INVALID_RESET_TOKEN', 'Lien invalide ou expiré.');
        }

        user!.passwordHash         = await bcrypt.hash(args.password, 12);
        user!.passwordResetToken   = undefined;
        user!.passwordResetExpires = undefined;
        await user!.save();

        // Révoquer toutes les sessions actives
        await RefreshToken.updateMany({ userId: user!._id }, { isRevoked: true });
        clearAuthCookies(ctx.res);

        return { success: true, message: 'Mot de passe réinitialisé. Reconnectez-vous.' };
      },

      // ═══════════════════════════════════════════════════════
      // OPÉRATION 8 : ValidateToken
      // Vérifie un token SANS accès à la DB → très rapide
      // Utile pour les services tiers qui veulent valider un JWT
      // ═══════════════════════════════════════════════════════
      ValidateToken: async (
        args: { accessToken: string },
        _callback: unknown,
        _ctx: SoapContext
      ) => {
        if (!args.accessToken) {
          return { valid: false };
        }

        try {
          const payload = verifyAccessToken(args.accessToken);
          return {
            valid:     true,
            userId:    payload.sub,
            email:     payload.email,
            role:      payload.role,
            plan:      payload.plan,
            expiresAt: payload.exp
              ? new Date(payload.exp * 1000).toISOString()
              : '',
          };
        } catch {
          return { valid: false };
        }
      },

    }, // HerbuteAuthPort
  },   // HerbuteAuthService
};
