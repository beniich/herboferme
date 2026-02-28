/**
 * ═══════════════════════════════════════════════════════════════
 * soap/soap.mount.ts — Montage SOAP sur Express
 * ═══════════════════════════════════════════════════════════════
 *
 * Ce fichier monte le serveur SOAP sur l'application Express
 * existante, en parallèle des routes REST.
 *
 * Résultat final :
 *   REST  →  POST /api/auth/login       (JSON)
 *   SOAP  →  POST /soap/auth            (XML)
 *   WSDL  →  GET  /soap/auth?wsdl       (XML contrat)
 *
 * strong-soap est le successeur actif de node-soap.
 * Il gère automatiquement :
 *   - Le parsing des enveloppes SOAP entrantes
 *   - La sérialisation XML des réponses
 *   - Le service du WSDL à l'URL ?wsdl
 *   - Les SOAP Faults (erreurs structurées)
 */

import path from 'path';
import fs from 'fs';
import { Application, Request, Response } from 'express';
import soap from 'strong-soap';
import { HerbuteAuthService } from './auth.service';

const { server: soapServer } = soap;

// ─────────────────────────────────────────────
// Chemin vers le fichier WSDL
// ─────────────────────────────────────────────
const WSDL_PATH = path.resolve(__dirname, '../../wsdl/HerbuteAuthService.wsdl');

// ─────────────────────────────────────────────
// Options du serveur SOAP
// ─────────────────────────────────────────────
interface SoapMountOptions {
  /** Préfixe du endpoint SOAP (défaut: /soap/auth) */
  path?: string;
  /** Activer les logs des enveloppes SOAP (développement) */
  verbose?: boolean;
}

/**
 * Monte le serveur SOAP sur l'application Express.
 *
 * Appelé UNE FOIS après que le serveur HTTP est démarré.
 * ⚠️  strong-soap nécessite une instance http.Server,
 *     pas juste l'app Express — c'est pourquoi on passe
 *     le server HTTP en paramètre.
 *
 * Usage dans server.ts :
 *   const httpServer = app.listen(PORT, () => { ... });
 *   await mountSoapService(app, httpServer);
 */
export const mountSoapService = (
  app: Application,
  httpServer: ReturnType<Application['listen']>,
  options: SoapMountOptions = {}
): void => {
  const soapPath    = options.path ?? '/soap/auth';
  const isVerbose   = options.verbose ?? process.env.NODE_ENV !== 'production';

  // Vérification existence du WSDL
  if (!fs.existsSync(WSDL_PATH)) {
    throw new Error(`[SOAP] WSDL introuvable : ${WSDL_PATH}`);
  }

  const wsdlXml = fs.readFileSync(WSDL_PATH, 'utf-8');

  /**
   * Création du serveur SOAP
   *
   * strong-soap intercepte les requêtes POST sur soapPath,
   * parse l'enveloppe XML, appelle la bonne méthode du service,
   * et sérialise la réponse en XML.
   *
   * Le contexte { req, res } est injecté dans chaque opération
   * pour permettre la lecture/écriture des cookies HttpOnly.
   */
  const createdSoapServer = soapServer.listen(
    httpServer,
    soapPath,
    HerbuteAuthService,
    wsdlXml,
    // Callback appelé quand le serveur SOAP est prêt
    () => {
      console.log(`🧼 [SOAP] Service Auth monté`);
      console.log(`   Endpoint : http://localhost:${process.env.PORT || 2065}${soapPath}`);
      console.log(`   WSDL     : http://localhost:${process.env.PORT || 2065}${soapPath}?wsdl`);
    }
  );

  // ─────────────────────────────────────────────
  // Logging des enveloppes SOAP (développement)
  // Affiche les XML entrants/sortants dans la console
  // ─────────────────────────────────────────────
  if (isVerbose) {
    createdSoapServer.log = (type: string, data: string) => {
      if (type === 'received') {
        console.log('\n📨 [SOAP] Requête reçue:\n', formatXml(data));
      } else if (type === 'replied') {
        console.log('\n📤 [SOAP] Réponse envoyée:\n', formatXml(data));
      }
    };
  }

  // ─────────────────────────────────────────────
  // Route Express pour servir le WSDL manuellement
  // (strong-soap le sert déjà via ?wsdl, mais cette
  //  route permet un accès direct et propre)
  // ─────────────────────────────────────────────
  app.get(`${soapPath}/wsdl`, (_req: Request, res: Response) => {
    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.send(wsdlXml);
  });

  // ─────────────────────────────────────────────
  // Route de documentation SOAP (HTML)
  // ─────────────────────────────────────────────
  app.get(`${soapPath}/docs`, (_req: Request, res: Response) => {
    res.send(generateSoapDocs(soapPath));
  });
};

// ─────────────────────────────────────────────
// Utilitaire : formatage XML pour les logs
// ─────────────────────────────────────────────
const formatXml = (xml: string): string => {
  try {
    let indent = 0;
    return xml
      .replace(/>\s*</g, '><')
      .replace(/(<[^/][^>]*[^/]>|<[^/][^>]*[^>]>)/g, (match) => {
        const pad = '  '.repeat(indent);
        if (!match.startsWith('</') && !match.endsWith('/>')) indent++;
        return `\n${pad}${match}`;
      })
      .replace(/<\/[^>]+>/g, (match) => {
        indent = Math.max(0, indent - 1);
        return `\n${'  '.repeat(indent)}${match}`;
      })
      .trim();
  } catch {
    return xml;
  }
};

// ─────────────────────────────────────────────
// Page HTML de documentation SOAP auto-générée
// ─────────────────────────────────────────────
const generateSoapDocs = (soapPath: string): string => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>HerbuteAuthService — Documentation SOAP</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; max-width: 900px; margin: 40px auto; padding: 0 20px; background: #0f0b06; color: #f0e8d4; }
    h1 { color: #8fbc5a; border-bottom: 2px solid #4a7c2f; padding-bottom: 12px; }
    h2 { color: #e8a94a; margin-top: 32px; }
    h3 { color: #8fbc5a; }
    .badge { display: inline-block; background: #4a7c2f; color: #fff; padding: 2px 10px; border-radius: 4px; font-size: 12px; margin-left: 8px; }
    .endpoint { background: #1a1209; border: 1px solid #4a7c2f; border-radius: 8px; padding: 16px; margin: 16px 0; }
    pre { background: #111; border: 1px solid #333; border-radius: 6px; padding: 16px; overflow-x: auto; font-size: 12px; color: #8fbc5a; }
    .url { color: #e8a94a; font-family: monospace; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th { background: #2d1f0e; padding: 10px; text-align: left; color: #e8a94a; }
    td { padding: 8px 10px; border-bottom: 1px solid #2d1f0e; font-size: 13px; }
  </style>
</head>
<body>
  <h1>🧼 HerbuteAuthService <span class="badge">SOAP 1.2</span></h1>
  <p>Service d'authentification et IAM — Architecture hybride REST + SOAP</p>

  <div class="endpoint">
    <strong>Endpoint SOAP :</strong>
    <span class="url">POST http://localhost:${process.env.PORT || 2065}${soapPath}</span><br/>
    <strong>WSDL :</strong>
    <span class="url">GET http://localhost:${process.env.PORT || 2065}${soapPath}?wsdl</span><br/>
    <strong>Namespace :</strong>
    <span class="url">http://herbute.ma/auth</span>
  </div>

  <h2>Opérations disponibles</h2>
  <table>
    <tr><th>Opération</th><th>Description</th><th>Équivalent REST</th></tr>
    <tr><td>Login</td><td>Authentifie un utilisateur, retourne JWT + cookie refresh</td><td>POST /api/auth/login</td></tr>
    <tr><td>Register</td><td>Crée un nouveau compte</td><td>POST /api/auth/register</td></tr>
    <tr><td>GetCurrentUser</td><td>Profil de l'utilisateur authentifié</td><td>GET /api/auth/me</td></tr>
    <tr><td>RefreshToken</td><td>Renouvelle l'access token</td><td>POST /api/auth/refresh</td></tr>
    <tr><td>Logout</td><td>Révoque la session active</td><td>POST /api/auth/logout</td></tr>
    <tr><td>ForgotPassword</td><td>Envoie un email de reset</td><td>POST /api/auth/forgot-password</td></tr>
    <tr><td>ResetPassword</td><td>Change le mot de passe via token</td><td>POST /api/auth/reset-password</td></tr>
    <tr><td>ValidateToken</td><td>Vérifie un JWT sans accès DB</td><td>—</td></tr>
  </table>

  <h2>Exemple — Login</h2>
  <pre>&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;soapenv:Envelope
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:auth="http://herbute.ma/auth"&gt;
  &lt;soapenv:Header/&gt;
  &lt;soapenv:Body&gt;
    &lt;auth:LoginRequest&gt;
      &lt;auth:email&gt;ahmed@farm.ma&lt;/auth:email&gt;
      &lt;auth:password&gt;MonMotDePasse@1!&lt;/auth:password&gt;
    &lt;/auth:LoginRequest&gt;
  &lt;/soapenv:Body&gt;
&lt;/soapenv:Envelope&gt;</pre>
</body>
</html>
`;
