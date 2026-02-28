/**
 * ═══════════════════════════════════════════════════════
 * soap/services/auth.soap.service.ts — Implémentation
 * ═══════════════════════════════════════════════════════
 *
 * Chaque méthode correspond à une <operation> du WSDL.
 * strong-soap appelle ces méthodes en passant :
 *   - args     : le contenu du <soap:Body> (déjà parsé)
 *   - callback : function(err, result, rawResponse, soapHeader, rawRequest)
 *   - headers  : les SOAP Headers (pour WS-Security)
 *
 * La logique métier est partagée avec le service REST :
 * on appelle les mêmes helpers (bcrypt, generateTokenPair, etc.)
 * pour éviter la duplication.
 *
 * IMPORTANT : Les erreurs SOAP sont des FAULTS, pas des HTTP errors.
 * Structure d'un fault :
 *   throw { Fault: { faultcode, faultstring, detail: { AuthFaultDetail: {...} } } }
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { validateWsSecurity, buildAuthFault } from '../utils/ws-security.js';
import { generateTokenPair, hashRefreshToken } from '../utils/tokens.js';
import { User } from '../models/user.model.js';
import { RefreshToken } from '../models/refresh-token.model.js';

// ─────────────────────────────────────────────
// Type de la signature des méthodes SOAP
// (imposé par strong-soap)
// ─────────────────────────────────────────────
type SoapCallback = (
  err:         any,
  result?:     Record<string, any>,
  rawResponse?: string,
  soapHeader?:  Record<string, any>,
  rawRequest?:  string
) => void;

// ─────────────────────────────────────────────
// Helper : throw un SOAP Fault
// ─────────────────────────────────────────────
const throwFault = (code: string, message: string, retryAfterSeconds?: number): never => {
  const detail: Record<string, any> = { code, message };
  if (retryAfterSeconds) detail.retryAfterSeconds = retryAfterSeconds;

  throw {
    Fault: {
      faultcode:   'Client',
      faultstring: message,
      detail: { AuthFaultDetail: detail },
    },
  };
};

// ─────────────────────────────────────────────
// Helper : construire la réponse token
// ─────────────────────────────────────────────
const buildTokenResponse = async (user: any) => {
  const { accessToken, refreshToken, refreshTokenHash } = generateTokenPair({
    id:             user._id.toString(),
    email:          user.email,
    role:           user.role,
    farmId:         user.farmId?.toString(),
    plan:           user.plan,
    organizationId: user.organizationId?.toString(),
  });

  // Stocker le hash du refresh token
  await RefreshToken.create({
    userId:    user._id,
    tokenHash: refreshTokenHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  // Date d'expiration du access token (15 min)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  return { accessToken, refreshToken, expiresAt };
};


// ═══════════════════════════════════════════════════════
// SERVICE SOAP — Objet exporté vers strong-soap
// ═══════════════════════════════════════════════════════
export const AuthSoapService = {

  HerbuteAuthService: {
    HerbuteAuthPort: {

      // ═══════════════════════════════════════════════
      // Login
      // Équivalent REST : POST /api/auth/login
      // ═══════════════════════════════════════════════
      Login: async (
        args:    { email: string; password: string; sessionDurationMinutes?: number },
        callback: SoapCallback,
        headers:  Record<string, any>
      ) => {
        try {
          const { email, password } = args;

          if (!email || !password) {
            throwFault('INVALID_CREDENTIALS', 'Email et mot de passe obligatoires.');
          }

          const startTime = Date.now();
          const MIN_TIME  = 300; // ms — anti-timing attack

          const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

          // Compte verrouillé ?
          if (user?.lockedUntil && user.lockedUntil > new Date()) {
            const retryAfter = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000);
            throwFault('ACCOUNT_LOCKED', `Compte verrouillé. Réessayez dans ${Math.ceil(retryAfter/60)} min.`, retryAfter);
          }

          const dummyHash = '$2b$12$invalid.hash.to.prevent.timing.attack';
          const isValid = user
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

            // Délai minimal constant
            const elapsed = Date.now() - startTime;
            if (elapsed < MIN_TIME) await new Promise(r => setTimeout(r, MIN_TIME - elapsed));

            throwFault('INVALID_CREDENTIALS', 'Identifiants invalides.');
          }

          if (!user!.emailVerified) throwFault('EMAIL_NOT_VERIFIED', 'Email non vérifié.');
          if (!user!.isActive)      throwFault('ACCOUNT_DISABLED',    'Compte désactivé.');

          // Succès
          user!.failedLoginAttempts = 0;
          user!.lockedUntil         = undefined;
          user!.lastLogin           = new Date();
          await user!.save();

          const { accessToken, refreshToken, expiresAt } = await buildTokenResponse(user);

          callback(null, {
            LoginResponse: {
              success:      true,
              accessToken,
              refreshToken,
              expiresAt,
              user: {
                id:        user!._id.toString(),
                email:     user!.email,
                nom:       user!.nom,
                prenom:    user!.prenom,
                role:      user!.role,
                plan:      user!.plan,
                farmId:    user!.farmId?.toString() || '',
                lastLogin: user!.lastLogin?.toISOString() || '',
              },
            },
          });
        } catch (fault) {
          callback(fault);
        }
      },


      // ═══════════════════════════════════════════════
      // RefreshToken
      // Équivalent REST : POST /api/auth/refresh
      // ═══════════════════════════════════════════════
      RefreshToken: async (
        args:    { refreshToken: string },
        callback: SoapCallback
      ) => {
        try {
          const { refreshToken: rawToken } = args;

          if (!rawToken) throwFault('TOKEN_INVALID', 'Refresh token manquant.');

          const tokenHash = hashRefreshToken(rawToken);
          const stored = await RefreshToken.findOne({
            tokenHash,
            isRevoked: false,
            expiresAt: { $gt: new Date() },
          }).populate('userId');

          if (!stored || !stored.userId) {
            throwFault('TOKEN_INVALID', 'Session invalide ou expirée. Reconnectez-vous.');
          }

          // Rotation — invalider l'ancien token
          stored!.isRevoked = true;
          await stored!.save();

          const user = stored!.userId as any;
          const { accessToken, refreshToken: newRefresh, expiresAt } = await buildTokenResponse(user);

          callback(null, {
            RefreshTokenResponse: {
              success:      true,
              accessToken,
              refreshToken: newRefresh,
              expiresAt,
            },
          });
        } catch (fault) {
          callback(fault);
        }
      },


      // ═══════════════════════════════════════════════
      // Logout — Nécessite WS-Security
      // Équivalent REST : POST /api/auth/logout
      // ═══════════════════════════════════════════════
      Logout: async (
        args:    { logoutAll?: boolean },
        callback: SoapCallback,
        headers:  Record<string, any>
      ) => {
        try {
          // Valider le WS-Security header
          const wsResult = validateWsSecurity(headers, 'Logout');
          if (!wsResult.authenticated || !wsResult.user) {
            buildAuthFault(wsResult.errorCode!, wsResult.error!);
          }

          const userId = wsResult.user!.sub;
          let sessionsRevoked = 0;

          if (args.logoutAll) {
            // Révoquer TOUTES les sessions
            const result = await RefreshToken.updateMany(
              { userId, isRevoked: false },
              { isRevoked: true }
            );
            sessionsRevoked = result.modifiedCount;
          } else {
            // Révoquer uniquement la session courante
            // En SOAP, on n'a pas le refresh token directement disponible
            // On révoque tous les tokens non-expirés récents (dernière heure)
            const result = await RefreshToken.updateMany(
              {
                userId,
                isRevoked: false,
                createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
              },
              { isRevoked: true }
            );
            sessionsRevoked = result.modifiedCount;
          }

          callback(null, {
            LogoutResponse: {
              success:         true,
              message:         args.logoutAll ? 'Toutes les sessions révoquées.' : 'Déconnecté.',
              sessionsRevoked,
            },
          });
        } catch (fault) {
          callback(fault);
        }
      },


      // ═══════════════════════════════════════════════
      // GetCurrentUser — Nécessite WS-Security
      // Équivalent REST : GET /api/auth/me
      // ═══════════════════════════════════════════════
      GetCurrentUser: async (
        args:    Record<string, never>,
        callback: SoapCallback,
        headers:  Record<string, any>
      ) => {
        try {
          const wsResult = validateWsSecurity(headers, 'GetCurrentUser');
          if (!wsResult.authenticated || !wsResult.user) {
            buildAuthFault(wsResult.errorCode!, wsResult.error!);
          }

          const user = await User.findById(wsResult.user!.sub)
            .select('-passwordHash -emailVerifyToken -passwordResetToken');

          if (!user) throwFault('INVALID_CREDENTIALS', 'Utilisateur introuvable.');

          callback(null, {
            GetCurrentUserResponse: {
              success: true,
              user: {
                id:        user!._id.toString(),
                email:     user!.email,
                nom:       user!.nom,
                prenom:    user!.prenom,
                role:      user!.role,
                plan:      user!.plan,
                farmId:    user!.farmId?.toString() || '',
                lastLogin: user!.lastLogin?.toISOString() || '',
              },
            },
          });
        } catch (fault) {
          callback(fault);
        }
      },


      // ═══════════════════════════════════════════════
      // ForgotPassword — Public
      // Équivalent REST : POST /api/auth/forgot-password
      // ═══════════════════════════════════════════════
      ForgotPassword: async (
        args:    { email: string },
        callback: SoapCallback
      ) => {
        try {
          // Anti-énumération : réponse identique qu'un compte existe ou non
          const GENERIC_RESPONSE = {
            ForgotPasswordResponse: {
              success: true,
              message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.",
            },
          };

          const user = await User.findOne({ email: args.email?.toLowerCase() });
          if (user) {
            const resetToken = crypto.randomBytes(32).toString('hex');
            user.passwordResetToken   = crypto.createHash('sha256').update(resetToken).digest('hex');
            user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
            await user.save();
            // TODO: await sendPasswordResetEmail(user.email, resetToken);
          }

          callback(null, GENERIC_RESPONSE);
        } catch (fault) {
          callback(fault);
        }
      },


      // ═══════════════════════════════════════════════
      // ResetPassword — Public
      // Équivalent REST : POST /api/auth/reset-password
      // ═══════════════════════════════════════════════
      ResetPassword: async (
        args:    { resetToken: string; newPassword: string; confirmPassword: string },
        callback: SoapCallback
      ) => {
        try {
          const { resetToken, newPassword, confirmPassword } = args;

          if (newPassword !== confirmPassword) {
            throwFault('WEAK_PASSWORD', 'Les mots de passe ne correspondent pas.');
          }

          const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/;
          if (!pwdRegex.test(newPassword)) {
            throwFault('WEAK_PASSWORD', 'Mot de passe trop faible. Min 10 chars avec maj, min, chiffre, spécial.');
          }

          const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
          const user = await User.findOne({
            passwordResetToken:   tokenHash,
            passwordResetExpires: { $gt: new Date() },
          });

          if (!user) throwFault('INVALID_RESET_TOKEN', 'Lien invalide ou expiré.');

          user!.passwordHash         = await bcrypt.hash(newPassword, 12);
          user!.passwordResetToken   = undefined;
          user!.passwordResetExpires = undefined;
          await user!.save();

          // Révoquer toutes les sessions actives
          await RefreshToken.updateMany({ userId: user!._id }, { isRevoked: true });

          callback(null, {
            ResetPasswordResponse: {
              success: true,
              message: 'Mot de passe réinitialisé. Reconnectez-vous.',
            },
          });
        } catch (fault) {
          callback(fault);
        }
      },


      // ═══════════════════════════════════════════════
      // VerifyEmail — Public
      // Équivalent REST : GET /api/auth/verify-email/:token
      // ═══════════════════════════════════════════════
      VerifyEmail: async (
        args:    { verificationToken: string },
        callback: SoapCallback
      ) => {
        try {
          const tokenHash = crypto.createHash('sha256').update(args.verificationToken).digest('hex');
          const user = await User.findOne({
            emailVerifyToken:   tokenHash,
            emailVerifyExpires: { $gt: new Date() },
          });

          if (!user) throwFault('INVALID_RESET_TOKEN', 'Lien de vérification invalide ou expiré.');

          user!.emailVerified    = true;
          user!.emailVerifyToken = undefined;
          user!.emailVerifyExpires = undefined;
          await user!.save();

          callback(null, {
            VerifyEmailResponse: {
              success: true,
              message: 'Email vérifié. Vous pouvez vous connecter.',
            },
          });
        } catch (fault) {
          callback(fault);
        }
      },

    }, // HerbuteAuthPort
  }, // HerbuteAuthService
};
