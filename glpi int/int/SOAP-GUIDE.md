# 🧼 Guide SOAP — Architecture Hybride REST + SOAP

## Herbute Backend v2.1 — Deux protocoles, un seul serveur

---

## Routage Final

```
Express (:2065)
│
├── REST (JSON)
│   ├── POST   /api/auth/login
│   ├── POST   /api/auth/register
│   ├── GET    /api/auth/me
│   ├── POST   /api/auth/refresh
│   ├── POST   /api/auth/logout
│   ├── GET    /api/fleet/vehicles
│   ├── GET    /api/hr/staff
│   └── ...
│
└── SOAP (XML)
    ├── POST   /soap/auth          ← Endpoint unique (toutes les opérations)
    ├── GET    /soap/auth?wsdl     ← Contrat WSDL (auto-généré)
    └── GET    /soap/auth/docs     ← Documentation HTML
```

---

## Fichiers Générés

```
herbute-soap/
├── wsdl/
│   └── HerbuteAuthService.wsdl   ← Contrat SOAP (8 opérations)
├── src/
│   └── soap/
│       ├── auth.service.ts        ← Implémentation des 8 opérations
│       └── soap.mount.ts          ← Montage sur Express
├── src/
│   └── server.ts                  ← Server.ts mis à jour (REST + SOAP)
├── test/
│   └── soap-examples.xml          ← Requêtes XML prêtes (SoapUI/cURL)
└── package.json                   ← strong-soap ajouté
```

---

## REST vs SOAP — Comparaison Directe pour ce Projet

| Critère | REST (existant) | SOAP (ajouté) |
|---|---|---|
| **Format** | JSON | XML (Envelope/Body) |
| **Endpoint** | Une URL par opération `/api/auth/login` | Un seul endpoint `/soap/auth` |
| **Contrat** | Optionnel (OpenAPI) | Obligatoire (WSDL) |
| **Erreurs** | HTTP 4xx + JSON | SOAP Fault (XML structuré) |
| **Client auto-généré** | Non natif | Oui — depuis le WSDL |
| **Typage fort** | Via TypeScript shared | Via XSD dans le WSDL |
| **Cookies HttpOnly** | ✅ Natif | ✅ Partagés (même logique) |
| **JWT RS256** | ✅ | ✅ Partagés (même `verifyAccessToken`) |
| **Cas d'usage** | Frontend Next.js, Mobile | ERP, Java, C#, intégrations B2B |

---

## Ce qui est Partagé entre REST et SOAP

Les deux couches utilisent **exactement la même logique métier** :

```
src/
├── models/user.model.ts          ← Même modèle Mongoose
├── models/refresh-token.model.ts ← Même stockage refresh tokens
├── utils/tokens.ts               ← Même generateTokenPair() + verifyAccessToken()
│
├── routes/auth.routes.ts         ← REST uniquement
└── soap/auth.service.ts          ← SOAP uniquement (importe les mêmes utils)
```

**Pas de duplication** — si la logique de login change (ex: règle de sécurité),
elle est modifiée dans `auth.service.logic.ts` et impacte les deux protocoles.

---

## Les 8 Opérations SOAP

| Opération | SOAPAction | Équivalent REST |
|---|---|---|
| `Login` | `auth/Login` | `POST /api/auth/login` |
| `Register` | `auth/Register` | `POST /api/auth/register` |
| `GetCurrentUser` | `auth/GetCurrentUser` | `GET /api/auth/me` |
| `RefreshToken` | `auth/RefreshToken` | `POST /api/auth/refresh` |
| `Logout` | `auth/Logout` | `POST /api/auth/logout` |
| `ForgotPassword` | `auth/ForgotPassword` | `POST /api/auth/forgot-password` |
| `ResetPassword` | `auth/ResetPassword` | `POST /api/auth/reset-password` |
| `ValidateToken` | `auth/ValidateToken` | — (sans équivalent REST) |

> `ValidateToken` est un bonus SOAP — vérifie un JWT **sans accès à MongoDB**
> (vérification cryptographique pure via clé publique RS256). Utile pour
> les services tiers qui veulent valider un token sans passer par `/me`.

---

## SOAP Faults vs Erreurs REST

En REST, une erreur retourne un HTTP 4xx avec un body JSON :
```json
HTTP 401
{ "error": "Identifiants invalides.", "code": "INVALID_CREDENTIALS" }
```

En SOAP, une erreur est une **SOAP Fault** — toujours HTTP 200,
l'erreur est dans le body XML :
```xml
HTTP 200
<soapenv:Envelope>
  <soapenv:Body>
    <soapenv:Fault>
      <faultcode>tns:INVALID_CREDENTIALS</faultcode>
      <faultstring>Identifiants invalides.</faultstring>
    </soapenv:Fault>
  </soapenv:Body>
</soapenv:Envelope>
```

> ⚠️  C'est le comportement standard SOAP — les clients SOAP (SoapUI, Java,
> C#) savent parser les Faults et les transformer en exceptions natives.

---

## Cookies HttpOnly avec SOAP

Les cookies fonctionnent identiquement pour les deux protocoles :
- Le login SOAP pose le même cookie `refresh_token` HttpOnly
- Le refresh SOAP lit le même cookie automatiquement (si browser)
- Pour les clients non-browser (Java, C#), le `refreshToken` peut être
  passé explicitement dans le body XML de `RefreshTokenRequest`

---

## Démarrage Rapide

```bash
# 1. Installer strong-soap
npm install strong-soap

# 2. Démarrer (REST + SOAP actifs)
npm run dev

# 3. Vérifier le WSDL
curl http://localhost:2065/soap/auth?wsdl

# 4. Tester le Login SOAP
curl -X POST http://localhost:2065/soap/auth \
  -H "Content-Type: text/xml" \
  -H 'SOAPAction: "http://herbute.ma/auth/Login"' \
  -c cookies.txt \
  -d '<?xml version="1.0"?>
<soapenv:Envelope
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:auth="http://herbute.ma/auth">
  <soapenv:Body>
    <auth:LoginRequest>
      <auth:email>ahmed@ferme.ma</auth:email>
      <auth:password>MonMotDePasse@1234!</auth:password>
    </auth:LoginRequest>
  </soapenv:Body>
</soapenv:Envelope>'

# 5. Ouvrir la documentation HTML
open http://localhost:2065/soap/auth/docs
```

---

## Générer un Client SOAP Automatiquement

Le WSDL permet de générer un client dans n'importe quel langage.

### Java (Apache CXF)
```bash
wsdl2java -client http://localhost:2065/soap/auth?wsdl
# → Génère HerbuteAuthService.java, Login.java, LoginResponse.java...
```

### C# (.NET)
```bash
dotnet-svcutil http://localhost:2065/soap/auth?wsdl
# → Génère HerbuteAuthServiceClient.cs avec toutes les méthodes
```

### PHP
```php
$client = new SoapClient('http://localhost:2065/soap/auth?wsdl');
$result = $client->Login(['email' => 'ahmed@ferme.ma', 'password' => 'MonMdp@1!']);
echo $result->user->nom; // Benali
```

### Python (zeep)
```python
from zeep import Client
client = Client('http://localhost:2065/soap/auth?wsdl')
result = client.service.Login(email='ahmed@ferme.ma', password='MonMdp@1!')
print(result.user.nom)  # Benali
```

### Node.js (strong-soap client)
```javascript
const soap = require('strong-soap').soap;
soap.createClient('http://localhost:2065/soap/auth?wsdl', {}, (err, client) => {
  client.Login({ email: 'ahmed@ferme.ma', password: 'MonMdp@1!' }, (err, result) => {
    console.log(result.user.nom); // Benali
  });
});
```

---

## Quand Utiliser SOAP vs REST dans ce Projet

**Utiliser REST** pour :
- Le frontend Next.js (toutes les pages, composants React)
- L'application mobile (si future)
- Les scripts internes Node.js

**Utiliser SOAP** pour :
- Intégration avec un **ERP** (SAP, Oracle, Microsoft Dynamics)
- Systèmes gouvernementaux marocains qui exigent SOAP/WSDL
- Partenaires B2B Java ou C# qui auto-génèrent leurs clients
- Services tiers qui ont besoin de `ValidateToken` sans accès à votre DB
