# 🔌 Guide d'intégration — Données Réelles (Sheets + GLPI)

## Architecture finale

```
Google Sheets (CSV public ou API v4)
          ↓  fetch (sheets.service.ts)
herbute-backend
  → Mapper (fleet/hr/planning/dashboard)
  → Cache MongoDB (SyncCache)
          ↓  GET /api/datasources/data/:module
Frontend Next.js
  → useRealData('fleet')       ← remplace MOCK_VEHICLES
  → useRealData('hr')          ← remplace MOCK_STAFF
  → useRealData('planning')    ← remplace MOCK_INTERVENTIONS
  → useRealData('dashboard')   ← remplace MOCK_KPIS

GLPI 11 (déjà intégré)
  → DataSource module: 'glpi'
  → Sync via API GLPI existante
```

---

## Fichiers générés

```
backend/src/
  models/
    datasource.model.ts     ← Config des sources (MongoDB)
    sync-cache.model.ts     ← Cache des lignes importées (TTL 7j)
  services/
    sheets.service.ts       ← Fetch CSV public + API v4
    sync.service.ts         ← Orchestrateur de sync
  mappers/
    index.ts                ← Fleet/HR/Planning/Dashboard mappers
  routes/
    datasource.routes.ts    ← API complète (CRUD + sync + test)
  jobs/
    sync.cron.ts            ← CRON auto toutes les 5 min

frontend/src/
  components/
    settings/DataSourceSettings.tsx   ← Page Paramètres
    dashboard/DataSourceWidget.tsx    ← Widget Dashboard
  lib/
    hooks/useRealData.ts              ← Hook remplace les mocks
    api-datasource.ts                 ← Helpers API à merger dans api.ts
```

---

## Installation

```bash
# Backend — nouvelles dépendances
npm install node-cron @types/node-cron csv-parse googleapis

# Frontend — aucune nouvelle dépendance (Axios déjà installé)
```

---

## Intégration dans server.ts (3 lignes)

```typescript
import datasourceRoutes from './routes/datasource.routes';
import { startSyncCron } from './jobs/sync.cron';

// Dans les routes :
app.use('/api/datasources', datasourceRoutes);

// Après connectDB() :
startSyncCron();
```

---

## Remplacement des mocks dans les composants existants

### Avant (mock)
```typescript
// fleet/page.tsx
import { MOCK_VEHICLES } from '@/data/mocks';
const vehicles = MOCK_VEHICLES;
```

### Après (données réelles)
```typescript
// fleet/page.tsx
import { useRealData, NoDataSourceBanner } from '@/lib/hooks/useRealData';

const { data: vehicles, loading, hasSource, sync, isSyncing } = useRealData('fleet');

if (!hasSource) return <NoDataSourceBanner module="fleet" />;
```

---

## Variables d'environnement à ajouter dans .env

```bash
# ─────────────────────────────────────────────
# Google Sheets API v4 (uniquement pour sheets privés)
# Laisser vide si vous n'utilisez que des sheets publics CSV
# ─────────────────────────────────────────────

# Option A : Contenu JSON du Service Account (production / Docker)
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key":"..."}'

# Option B : Chemin vers le fichier JSON (développement local)
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./config/google-service-account.json
```

---

## Préparer un Google Sheet compatible

### Format recommandé pour la Flotte :
| Immatriculation | Marque | Modèle | Type | Année | Kilomètres | Statut | Prochaine Maintenance |
|---|---|---|---|---|---|---|---|
| AB-123-MA | John Deere | 6130R | Tracteur | 2021 | 4500 | Actif | 15/03/2026 |
| CD-456-MA | Ford | Transit | Utilitaire | 2019 | 78000 | Actif | 01/04/2026 |

### Format recommandé pour les RH :
| Nom | Prénom | Poste | Secteur | Type Contrat | Salaire | Date Embauche | Téléphone |
|---|---|---|---|---|---|---|---|
| Benali | Ahmed | Tractoriste | Céréales | CDI | 4500 | 15/03/2020 | 0661234567 |

### Format recommandé pour le Planning :
| Titre | Description | Date Debut | Date Fin | Responsable | Secteur | Priorité | Statut |
|---|---|---|---|---|---|---|---|
| Épandage Nord | Parcelle B3 | 01/03/2026 | 05/03/2026 | Ahmed | Céréales | Haute | Planifié |

---

## Publier un Sheet en CSV (méthode csv_public)

1. Ouvrir le Google Sheet
2. **Fichier** → **Partager** → **Publier sur le Web**
3. Choisir **Feuille1** (ou l'onglet voulu)
4. Format : **Valeurs séparées par des virgules (.csv)**
5. Cliquer **Publier**
6. Copier le lien — le backend accepte aussi les liens /edit ordinaires :
   `https://docs.google.com/spreadsheets/d/VOTRE_ID/edit#gid=0`

---

## Pont GLPI 11 (déjà intégré)

Puisque GLPI est déjà intégré, les données GLPI peuvent alimenter
le même système de cache via un DataSource de type `glpi` :

```typescript
// Dans sync.service.ts, ajouter un cas spécial :
if (source.module === 'glpi') {
  // Appeler votre API GLPI existante au lieu de Sheets
  const glpiData = await yourExistingGlpiService.getTickets(source.farmId);
  return { rows: glpiData.map(t => ({ ...t })), headers: [], ... };
}
```

Cela unifie GLPI + Sheets dans la même interface Settings,
avec le même widget Dashboard, le même cache MongoDB.

---

## Flux de données complet

```
1. Admin ouvre Settings > Sources de données
2. Clique "+ Connecter un Sheet"
3. Colle l'URL + choisit le module (Fleet)
4. Clique "Tester la connexion"
   → Backend: fetchSheetData() → CSV/API v4
   → Retourne: 156 lignes, colonnes: [Immatriculation, Marque...]
5. Clique "Connecter"
   → DataSource créé en MongoDB
6. Backend lance une première sync automatique
   → rows → mapFleetRow() → SyncCache.insertMany()
7. Frontend Fleet page
   → useRealData('fleet') → GET /api/datasources/data/fleet
   → Retourne les 156 véhicules depuis le cache
   → Plus aucun mock !
```
