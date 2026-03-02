# 🚀 PLAN D'IMPLÉMENTATION — FORMULAIRES & CONNEXION BDD
> AgroMaître — Plan complet de développement  
> Date : 1er Mars 2026

---

## 📊 VUE D'ENSEMBLE

**Objectif** : Connecter toutes les pages de l'application à la base de données MongoDB avec des formulaires de saisie complets, validés, et intégrés au thème AgroMaître.

**Durée estimée totale** : 5 phases, exécutables en séquence

---

## 🏗️ ÉTAPE 0 — FONDATIONS (Back & Front) ✅ EN COURS

### Backend : Créer les routes manquantes
| Route | Modèle | Priorité |
|-------|--------|----------|
| `GET/POST /api/animals` | `Animal` | 🔴 Haute |
| `GET/PUT/DELETE /api/animals/:id` | `Animal` | 🔴 Haute |
| `GET/POST /api/crops` | `Crop` | 🔴 Haute |
| `GET/PUT/DELETE /api/crops/:id` | `Crop` | 🔴 Haute |
| `GET/POST /api/finance/transactions` | `FarmTransaction` | 🔴 Haute |
| `GET /api/finance/kpis` | `FarmKPI` | 🔴 Haute |
| `GET /api/finance/stats` | `FarmTransaction` | 🟡 Moyenne |

### Frontend : Créer les helpers API
```
frontend/src/lib/api.ts  →  Ajouter animalsApi, cropsApi, financeApi
```

---

## 📋 PHASE 1 — ÉLEVAGE & VOLAILLE (Priorité 1)

### 1.1 Backend `/api/animals`
```
GET    /api/animals              → Liste par org, filtre par category
POST   /api/animals              → Créer un animal/groupe
GET    /api/animals/:id          → Détail
PUT    /api/animals/:id          → Modifier
DELETE /api/animals/:id          → Supprimer
GET    /api/animals/stats        → Statistiques (totaux, valeur)
```

### 1.2 Formulaires Frontend

#### Page Élevage `/elevage`
- [x] Tableau dynamique (charge depuis `/api/animals?category=LIVESTOCK`)
- [x] Bouton "➕ Ajouter un animal" → Modal de saisie
- [x] Champs : Type, Race, Nombre, Âge moyen, Statut, Valeur estimée
- [x] Édition inline ou modal
- [x] Suppression avec confirmation
- [x] KPIs calculés dynamiquement (total têtes, valeur totale)
- [x] Graphique production lait (données saisies manuellement)

#### Page Volaille `/volaille`
- [x] Même logique, filtrée `category=POULTRY`
- [x] KPIs : effectifs pondeuses, ponte/jour, mortalité
- [x] Saisie : Espèce, Lot, Nombre, Ponte quotidienne, Statut sanitaire

---

## 🌱 PHASE 2 — CULTURES & TERRES (Priorité 1)

### 2.1 Backend `/api/crops`
```
GET    /api/crops                → Liste par org, filtre par category
POST   /api/crops                → Créer une culture
GET    /api/crops/:id            → Détail
PUT    /api/crops/:id            → Modifier
DELETE /api/crops/:id            → Supprimer
POST   /api/crops/:id/harvest    → Enregistrer une récolte
GET    /api/crops/stats          → Statistiques par catégorie
```

### 2.2 Formulaires Frontend

#### Légumes & Fruits `/legumes`
- [x] Tableau dynamique (charge depuis `/api/crops?category=VEGETABLE`)
- [x] Modal "Nouvelle Culture" : Nom, Parcelle, Date plantation, Date récolte prévue, Rendement estimé
- [x] Statuts visuels : Planté / En croissance / Prêt à récolter / Récolté
- [x] Bouton "Enregistrer récolte" sur chaque ligne
- [x] KPIs dynamiques

#### Herbes & Aromates `/herbes`
- [x] Même logique, filtrée `category=HERB`
- [x] Champs spéciaux : Type de séchage, Qualité, Prix au kg

#### Pépinière `/pepiniere`
- [x] Filtrée `category=NURSERY`
- [x] Suivi des plants, taux de reprise

#### Parcelles `/parcelles`
- [x] Vue carte ou grille des parcelles
- [x] Saisie : Superficie, Culture en cours, Statut sol, Irrigation

---

## 💰 PHASE 3 — FINANCE & COMPTABILITÉ (Priorité 1)

### 3.1 Backend `/api/finance`
```
GET    /api/finance/transactions  → Liste des transactions (pagination, filtres)
POST   /api/finance/transactions  → Créer une transaction
PUT    /api/finance/transactions/:id → Modifier
DELETE /api/finance/transactions/:id → Supprimer
GET    /api/finance/stats         → Résumé (revenus, dépenses, bénéfice)
GET    /api/finance/kpis          → KPIs du mois en cours
GET    /api/finance/export        → Export Excel
```

### 3.2 Formulaires Frontend

#### Comptabilité `/comptabilite`
- [x] Tableau des transactions (pagination)
- [x] Modal "Nouvelle Transaction" :
  - Type : Recette / Dépense
  - Catégorie (Ventes, Intrants, Santé, Charges...)
  - Secteur (Élevage, Légumes, Herbes, Général)
  - Montant (DH)
  - Description
  - Date
- [x] Filtres par type, secteur, période
- [x] Export Excel

#### Budget & Finance `/budget`
- [x] KPIs calculés automatiquement depuis les transactions
- [x] Graphiques : revenus vs dépenses par mois
- [x] Bénéfice net, trésorerie

---

## 🌿 PHASE 4 — MODULES SUPPORT (Priorité 2)

### Irrigation `/irrigation`
- [x] Backend : Modèle `IrrigationLog` (parcelle, volume, durée, date)
- [x] Formulaire : Saisie de session d'arrosage
- [x] KPIs : eau consommée, coût

### Forêt `/foret`
- [x] Backend : Utiliser `Crop` avec `category=FOREST`
- [x] Formulaire : Zone, espèces, année plantation, surface

### Domaine & Infrastructure `/domaine`
- [x] Backend : Utiliser `FarmTransaction` + nouveau modèle `Asset`
- [x] Formulaire : Bâtiments, équipements fixes, entretien

### Météo `/meteo`
- [x] Intégration API OpenWeatherMap (optionnel)
- [x] Sinon : Saisie manuelle des relevés quotidiens

---

## 🔄 PHASE 5 — CONNEXION DONNÉES STATIQUES (Priorité 2)

### Dashboard `/dashboard`
- [x] Connecter le bloc météo à une source réelle
- [x] KPIs financiers depuis `/api/finance/kpis`
- [x] Transactions récentes depuis `/api/finance/transactions?limit=5`
- [x] Alertes depuis `/api/animals` (santé) + `/api/crops` (récolte proche)

### Analytics `/analytics`
- [x] Graphiques depuis les vraies données :
  - Réclamations par mois
  - Transactions par secteur
  - Évolution cheptel

---

## 🛠️ COMPOSANTS RÉUTILISABLES À CRÉER

### UI Components
```
components/ui/
├── DataTable.tsx          → Tableau générique avec tri, pagination, recherche
├── Modal.tsx              → Modal réutilisable avec animations agro-theme
├── FormField.tsx          → Input, Select, DatePicker harmonisés
├── ConfirmDialog.tsx      → Dialogue de confirmation suppression
├── KPICard.tsx            → Carte KPI dynamique (props : label, value, trend)
├── StatusPill.tsx         → Pilule de statut colorée
└── LoadingTable.tsx       → Squelette de chargement pour tableaux
```

### API Hooks
```
hooks/
├── useAnimals.ts          → CRUD animaux avec React Query
├── useCrops.ts            → CRUD cultures avec React Query
├── useFinance.ts          → CRUD transactions avec React Query
└── useFormModal.ts        → Gestion état modal open/close/loading
```

---

## 📋 ORDRE D'EXÉCUTION RECOMMANDÉ

```
Semaine 1 : FONDATIONS
  ✅ Étape 0A — Créer routes backend /api/animals
  ✅ Étape 0B — Créer routes backend /api/crops
  ✅ Étape 0C — Créer routes backend /api/finance
  ✅ Étape 0D — Ajouter helpers API frontend

Semaine 2 : PHASE 1 & 2
  ✅ Page Élevage complète (formulaires + connexion)
  ✅ Page Volaille complète (formulaires + connexion)
  ✅ Page Légumes complète (formulaires + connexion)
  ✅ Page Herbes complète (formulaires + connexion)

Semaine 3 : PHASE 3
  ✅ Module Finance complet (transactions + KPIs)
  ✅ Comptabilité avec export Excel
  ✅ Budget & Dashboard financier

Semaine 4 : PHASES 4 & 5
  ✅ Modules support (Irrigation, Forêt, Domaine)
  ✅ Connexion données statiques → données réelles
  ✅ Dashboard complètement dynamique
```

---

## ✅ DÉFINITION DE "TERMINÉ" POUR CHAQUE MODULE

Chaque module est considéré comme **terminé** quand :
1. **Liste** : Les données se chargent depuis MongoDB (pas de données statiques)
2. **Création** : Un formulaire valide permet d'ajouter une entrée
3. **Édition** : Une entrée peut être modifiée via formulaire
4. **Suppression** : Une entrée peut être effacée (avec confirmation)
5. **KPIs** : Les chiffres en haut sont calculés dynamiquement
6. **UI** : Style harmonisé avec agro-theme (police, couleurs, animations)

---

*Plan créé le 1er Mars 2026 — AgroMaître v2.0*
