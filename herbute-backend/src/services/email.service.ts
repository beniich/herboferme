/**
 * services/email.service.ts — Emails transactionnels Herbute
 * Templates HTML beaux et fonctionnels pour :
 *   - Activation d'abonnement payant (avec lien direct → dashboard)
 *   - Confirmation essai gratuit
 *   - Notification admin nouveau abonné
 */

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.mailtrap.io',
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT   === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const PLAN_LABELS: Record<string, string>  = { essai: 'Essai gratuit', essentiel: 'Essentiel', professionnel: 'Professionnel', entreprise: 'Entreprise' };
const PLAN_COLORS: Record<string, string>  = { essai: '#6b8f5e', essentiel: '#c49a2e', professionnel: '#8b6920', entreprise: '#3d6b5e' };
const PLAN_AMOUNTS: Record<string, string> = { essai: 'Gratuit', essentiel: '590 MAD/mois', professionnel: '1 290 MAD/mois', entreprise: 'Sur devis' };

// ─────────────────────────────────────────────
// Email d'activation — envoyé à l'abonné
// ─────────────────────────────────────────────
export const sendActivationEmail = async ({
  to, prenom, plan, dashboardUrl, loginUrl, tempPassword, isTrial,
}: {
  to:            string;
  prenom:        string;
  plan:          string;
  dashboardUrl?: string;
  loginUrl?:     string;
  tempPassword?: string;
  isTrial:       boolean;
}) => {
  const planLabel  = PLAN_LABELS[plan]  ?? plan;
  const planColor  = PLAN_COLORS[plan]  ?? '#c49a2e';
  const planAmount = PLAN_AMOUNTS[plan] ?? '';

  const ctaUrl   = dashboardUrl ?? loginUrl ?? `${process.env.FRONTEND_URL}/dashboard`;
  const ctaLabel = isTrial ? 'Accéder à mon espace Herbute' : 'Accéder directement à mon dashboard →';

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Bienvenue sur Herbute</title>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Segoe UI',system-ui,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Logo -->
        <tr>
          <td align="center" style="padding-bottom:32px;">
            <span style="font-size:32px;font-weight:900;color:#8b6920;font-family:Georgia,serif;letter-spacing:-1px;">
              🌿 Herbute
            </span>
          </td>
        </tr>

        <!-- Carte principale -->
        <tr>
          <td style="background:#1a1209;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3);">

            <!-- Bande colorée -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:linear-gradient(135deg,${planColor},${planColor}cc);padding:36px 40px;">
                  <p style="margin:0 0 6px;color:rgba(255,255,255,0.7);font-size:12px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">
                    ${isTrial ? 'ESSAI GRATUIT ACTIVÉ' : 'ABONNEMENT ACTIVÉ'}
                  </p>
                  <h1 style="margin:0;color:#fff;font-size:28px;font-weight:900;font-family:Georgia,serif;line-height:1.2;">
                    Bienvenue, ${prenom} ! 🎉
                  </h1>
                </td>
              </tr>
            </table>

            <!-- Corps -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:36px 40px;">

                  <p style="color:#c4b49a;font-size:16px;line-height:1.7;margin:0 0 28px;">
                    ${isTrial
                      ? `Votre essai gratuit de <strong style="color:#f5e6c8;">30 jours</strong> est maintenant actif. Découvrez toutes les fonctionnalités d'Herbute sans engagement.`
                      : `Votre abonnement <strong style="color:#f5e6c8;">Plan ${planLabel}</strong> a bien été activé. Votre dashboard vous attend !`
                    }
                  </p>

                  <!-- Récap plan -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;margin-bottom:32px;">
                    <tr>
                      <td style="padding:20px 24px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="color:#7a6545;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding-bottom:12px;">VOTRE PLAN</td>
                          </tr>
                          <tr>
                            <td style="border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:12px;margin-bottom:12px;">
                              <table width="100%"><tr>
                                <td style="color:#f5e6c8;font-size:18px;font-weight:800;font-family:Georgia,serif;">${planLabel}</td>
                                <td align="right" style="color:${planColor};font-size:16px;font-weight:700;">${planAmount}</td>
                              </tr></table>
                            </td>
                          </tr>
                          ${isTrial ? `<tr><td style="color:#9a8060;font-size:13px;padding-top:12px;">⏱️ Essai valable jusqu'au <strong style="color:#f5e6c8;">${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</strong></td></tr>` : ''}
                        </table>
                      </td>
                    </tr>
                  </table>

                  ${tempPassword ? `
                  <!-- Mot de passe temporaire -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(196,154,46,0.08);border:1px solid rgba(196,154,46,0.25);border-radius:12px;margin-bottom:32px;">
                    <tr>
                      <td style="padding:20px 24px;">
                        <p style="color:#c49a2e;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">MOT DE PASSE TEMPORAIRE</p>
                        <p style="color:#f5e6c8;font-size:20px;font-weight:900;font-family:monospace;margin:0 0 8px;letter-spacing:2px;">${tempPassword}</p>
                        <p style="color:#7a6545;font-size:12px;margin:0;">Changez-le dès votre première connexion dans Paramètres &gt; Compte.</p>
                      </td>
                    </tr>
                  </table>
                  ` : ''}

                  <!-- CTA principal -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                    <tr>
                      <td align="center">
                        <a href="${ctaUrl}"
                          style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#8b6920,#c49a2e);color:#050401;font-size:16px;font-weight:800;text-decoration:none;border-radius:12px;letter-spacing:0.3px;">
                          ${ctaLabel}
                        </a>
                        ${!isTrial ? `<p style="color:#4a3d28;font-size:12px;margin:12px 0 0;">Ce lien est valable 48 heures. Après, connectez-vous via <a href="${process.env.FRONTEND_URL}/login" style="color:#c49a2e;">herbute.ma/login</a></p>` : ''}
                      </td>
                    </tr>
                  </table>

                  <!-- Prochaines étapes -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.06);">
                    <tr>
                      <td style="padding:24px;">
                        <p style="color:#7a6545;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">🚀 PAR OÙ COMMENCER</p>
                        ${[
                          ['📊', 'Configurez votre dashboard',         'Ajoutez votre première ferme et personnalisez votre vue'],
                          ['🔌', 'Connectez Google Sheets',            'Importez vos données existantes en quelques clics'],
                          ['👥', 'Invitez votre équipe',               'Ajoutez vos collaborateurs depuis Paramètres > Utilisateurs'],
                          ['🖥️', 'Activez l\'intégration GLPI',       'Synchronisez vos tickets IT directement dans le dashboard'],
                        ].map(([icon, title, desc]) => `
                        <table width="100%" style="margin-bottom:14px;"><tr>
                          <td width="36" valign="top" style="font-size:20px;padding-right:12px;padding-top:2px;">${icon}</td>
                          <td>
                            <p style="color:#d4c09a;font-size:14px;font-weight:600;margin:0 0 2px;">${title}</p>
                            <p style="color:#6b5a3e;font-size:13px;margin:0;">${desc}</p>
                          </td>
                        </tr></table>`).join('')}
                      </td>
                    </tr>
                  </table>

                  <!-- Support -->
                  <p style="color:#4a3d28;font-size:13px;margin-top:28px;text-align:center;line-height:1.6;">
                    Une question ? Répondez à cet email ou contactez-nous sur<br/>
                    <a href="mailto:support@herbute.ma" style="color:#c49a2e;">support@herbute.ma</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer email -->
        <tr>
          <td style="padding-top:28px;text-align:center;">
            <p style="color:#8b7355;font-size:12px;margin:0 0 8px;">
              Herbute SARL — Casablanca, Maroc 🇲🇦
            </p>
            <p style="color:#4a3d28;font-size:11px;margin:0;">
              <a href="${process.env.FRONTEND_URL}/legal/cgu" style="color:#4a3d28;">CGU</a> ·
              <a href="${process.env.FRONTEND_URL}/legal/confidentialite" style="color:#4a3d28;">Confidentialité</a> ·
              <a href="${process.env.FRONTEND_URL}/unsubscribe" style="color:#4a3d28;">Se désabonner</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`;

  await transporter.sendMail({
    from:    `"Herbute" <${process.env.EMAIL_FROM || 'noreply@herbute.ma'}>`,
    to,
    subject: isTrial
      ? `🌿 Votre essai Herbute est prêt, ${prenom} !`
      : `✅ Abonnement ${planLabel} activé — Accédez à votre dashboard`,
    html,
  });

  console.log(`📧 [Email] Activation envoyée → ${to} (${plan})`);
};

// ─────────────────────────────────────────────
// Notification admin — nouveau abonné
// ─────────────────────────────────────────────
export const sendAdminNotification = async ({
  type, data,
}: {
  type: 'new_subscriber';
  data: { nom: string; email: string; plan: string; societe: string };
}) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const html = `
<div style="font-family:system-ui,sans-serif;padding:32px;background:#1a1209;color:#d4c09a;border-radius:12px;">
  <h2 style="color:#c49a2e;margin:0 0 20px;">🎉 Nouvel abonné Herbute</h2>
  <table style="width:100%;border-collapse:collapse;">
    ${Object.entries({ Nom: data.nom, Email: data.email, Plan: PLAN_LABELS[data.plan] ?? data.plan, Société: data.societe }).map(([k, v]) => `
    <tr style="border-bottom:1px solid rgba(255,255,255,0.08);">
      <td style="padding:10px 0;color:#7a6545;font-size:13px;font-weight:700;width:100px;">${k}</td>
      <td style="padding:10px 0;color:#f5e6c8;font-size:14px;">${v}</td>
    </tr>`).join('')}
  </table>
  <p style="margin-top:20px;">
    <a href="${process.env.FRONTEND_URL}/admin/subscribers" style="color:#c49a2e;">Voir dans l'admin →</a>
  </p>
</div>`;

  await transporter.sendMail({
    from:    `"Herbute Système" <${process.env.EMAIL_FROM}>`,
    to:      adminEmail,
    subject: `[Herbute] Nouvel abonné — ${data.nom} (${PLAN_LABELS[data.plan] ?? data.plan})`,
    html,
  });
};
