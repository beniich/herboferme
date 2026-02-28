# 🌾 AgroSync — Guide Complet de Migration Node.js → PHP/Laravel

> **Version Laravel 11 · PHP 8.3 · PostgreSQL 14+ · Redis 7+**
> 
> Ce guide couvre la migration **complète et fidèle** de votre backend Node.js/Express
> vers Laravel, en conservant toute la logique métier, la sécurité, les rôles et la structure BDD.

---

## Table des Matières

1. [Structure du Projet Laravel](#1-structure-du-projet-laravel)
2. [Installation & Configuration](#2-installation--configuration)
3. [Variables d'Environnement (.env)](#3-variables-denvironnement-env)
4. [Migrations Base de Données](#4-migrations-base-de-données)
5. [Models Eloquent](#5-models-eloquent)
6. [Authentification (Sanctum → remplace JWT)](#6-authentification-sanctum)
7. [Middleware (Auth, Rôles, Plans)](#7-middleware)
8. [Form Requests (Validation)](#8-form-requests-validation)
9. [Controllers — Route par Route](#9-controllers)
10. [Routes API (api.php)](#10-routes-api)
11. [Utilitaires (Audit, Mailer)](#11-utilitaires)
12. [Redis & Cache](#12-redis--cache)
13. [Frontend — Adaptation des appels API](#13-frontend--adaptation)
14. [Tableau de Correspondance Complète](#14-tableau-de-correspondance)

---

## 1. Structure du Projet Laravel

```
agrosync-laravel/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   │   └── AuthController.php       ← auth.js (login/register/refresh/logout)
│   │   │   ├── DashboardController.php      ← dashboard.js
│   │   │   ├── ComptabiliteController.php   ← comptabilite.js
│   │   │   ├── ElevageController.php        ← elevage.js
│   │   │   ├── AvicultureController.php     ← aviculture.js
│   │   │   ├── HerbesController.php         ← herbes.js
│   │   │   ├── FarmController.php           ← farms.js
│   │   │   └── RapportController.php        ← rapports.js
│   │   ├── Middleware/
│   │   │   ├── CheckRole.php               ← authorize() middleware
│   │   │   └── CheckPlan.php               ← requirePlan() middleware
│   │   └── Requests/                        ← express-validator rules
│   │       ├── StoreTransactionRequest.php
│   │       ├── StoreAnimalRequest.php
│   │       └── UpdateFarmRequest.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Farm.php
│   │   ├── Transaction.php
│   │   ├── Animal.php
│   │   ├── LotAvicole.php
│   │   ├── Culture.php
│   │   ├── SanteEvent.php
│   │   ├── Production.php
│   │   ├── Alerte.php
│   │   └── AuditLog.php
│   ├── Traits/
│   │   └── Auditable.php                   ← audit.js
│   └── Mail/
│       ├── VerifyEmailMail.php             ← mailer.js (verify-email)
│       └── ResetPasswordMail.php          ← mailer.js (reset-password)
├── database/
│   └── migrations/                         ← schema.sql traduit
├── routes/
│   └── api.php
└── config/
    ├── sanctum.php
    └── database.php
```

---

## 2. Installation & Configuration

### 2.1 Créer le projet

```bash
# Installer Laravel 11
composer create-project laravel/laravel agrosync-laravel

cd agrosync-laravel

# Packages essentiels (équivalents à vos dépendances npm)
composer require laravel/sanctum          # JWT équivalent → tokens API
composer require spatie/laravel-permission # Gestion rôles (authorize)
composer require predis/predis            # Redis (blacklist tokens)
composer require laravel/telescope        # Debug (remplace morgan)

# Dev
composer require --dev laravel/pint       # Code style (ESLint équivalent)
```

### 2.2 Configurer PostgreSQL dans `config/database.php`

```php
// config/database.php
'default' => env('DB_CONNECTION', 'pgsql'),

'connections' => [
    'pgsql' => [
        'driver'   => 'pgsql',
        'host'     => env('DB_HOST', '127.0.0.1'),
        'port'     => env('DB_PORT', '5432'),
        'database' => env('DB_DATABASE', 'agrosync_db'),
        'username' => env('DB_USERNAME', 'agrosync_user'),
        'password' => env('DB_PASSWORD', ''),
        'charset'  => 'utf8',
        'schema'   => 'public',
        'sslmode'  => env('DB_SSL', 'prefer'),
        // Options équivalentes à statement_timeout: 30000
        'options'  => extension_loaded('pdo_pgsql') ? [
            PDO::ATTR_EMULATE_PREPARES => true,
        ] : [],
    ],
],
```

### 2.3 Publier Sanctum

```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

---

## 3. Variables d'Environnement (.env)

```ini
# .env — Équivalent complet de votre .env Node.js

APP_NAME="AgroSync"
APP_ENV=production
APP_KEY=                          # php artisan key:generate
APP_DEBUG=false
APP_URL=https://api.agrosync.ma

# Base de données (identique à DB_* Node.js)
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=agrosync_db
DB_USERNAME=agrosync_user
DB_PASSWORD=votre_mot_de_passe_fort
DB_SSL=require

# Sanctum (remplace JWT_SECRET / JWT_REFRESH_SECRET)
SANCTUM_STATEFUL_DOMAINS=agrosync.ma,app.agrosync.ma

# Redis (identique à REDIS_URL)
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Mail (identique à SMTP_*)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=587
MAIL_USERNAME=votre_user
MAIL_PASSWORD=votre_pass
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@agrosync.ma"
MAIL_FROM_NAME="AgroSync"

# CORS (identique à ALLOWED_ORIGINS)
FRONTEND_URL=https://agrosync.ma

# Rate limiting (équivalent express-rate-limit)
RATE_LIMIT_MAX=200
RATE_LIMIT_AUTH_MAX=10
```

---

## 4. Migrations Base de Données

> Laravel traduit votre `schema.sql` en migrations PHP.
> Chaque migration = une table de votre schéma.

### 4.1 Table `farms`

```bash
php artisan make:migration create_farms_table
```

```php
// database/migrations/xxxx_create_farms_table.php
public function up(): void
{
    Schema::create('farms', function (Blueprint $table) {
        // UUID — équivalent uuid_generate_v4()
        $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
        $table->string('nom', 120);
        $table->text('adresse')->nullable();
        $table->string('region', 80)->nullable();
        $table->decimal('superficie_ha', 10, 2)->nullable();
        $table->uuid('owner_id');
        $table->enum('plan', ['essai','essentiel','professionnel','entreprise'])
              ->default('essai');
        $table->timestampTz('plan_expires')->nullable();
        $table->string('logo_url', 512)->nullable();
        $table->timestampsTz(); // created_at / updated_at (équivalent createdAt/updatedAt)
    });
}
```

### 4.2 Table `users`

```php
// database/migrations/xxxx_create_users_table.php
public function up(): void
{
    Schema::create('users', function (Blueprint $table) {
        $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
        $table->string('email', 255)->unique();
        $table->string('password');                    // ← password_hash
        $table->string('nom', 80);
        $table->string('prenom', 80);
        $table->string('telephone', 20)->nullable();
        $table->enum('role', ['super_admin','proprietaire','gerant','comptable','employe','veterinaire'])
              ->default('employe');
        $table->foreignUuid('farm_id')->nullable()->constrained()->nullOnDelete();
        $table->string('plan', 20)->default('essai');
        $table->boolean('is_active')->default(true);
        $table->boolean('email_verified')->default(false);
        $table->string('email_verify_token', 128)->nullable();
        $table->timestampTz('email_verify_expires')->nullable();
        $table->string('password_reset_token', 128)->nullable();
        $table->timestampTz('password_reset_expires')->nullable();
        $table->integer('failed_login_attempts')->default(0);
        $table->timestampTz('locked_until')->nullable();
        $table->timestampTz('last_login')->nullable();
        $table->string('avatar_url', 512)->nullable();
        $table->jsonb('preferences')->default('{}');
        $table->timestampsTz();
    });
}
```

### 4.3 Table `transactions`

```php
public function up(): void
{
    Schema::create('transactions', function (Blueprint $table) {
        $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
        $table->foreignUuid('farm_id')->constrained()->cascadeOnDelete();
        $table->foreignUuid('user_id')->nullable()->constrained()->nullOnDelete();
        $table->string('description', 255);
        $table->decimal('montant', 14, 2);
        $table->enum('type', ['recette', 'depense']);
        $table->string('categorie', 80);
        $table->enum('secteur', ['elevage','aviculture','herbes','legumes','foret','general','pepiniere','import','export']);
        $table->date('date');
        $table->text('notes')->nullable();
        $table->jsonb('pieces_jointes')->default('[]');
        $table->boolean('validated')->default(false);
        $table->timestampsTz();
    });

    // Index (identiques à schema.sql)
    Schema::table('transactions', function (Blueprint $table) {
        $table->index('farm_id');
        $table->index('date');
        $table->index('type');
        $table->index('secteur');
    });
}
```

### 4.4 Tables `animals`, `productions`, `sante_events`, `lots_avicoles`, `cultures`, `alertes`, `audit_logs`

```php
// animals
Schema::create('animals', function (Blueprint $table) {
    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
    $table->foreignUuid('farm_id')->constrained()->cascadeOnDelete();
    $table->string('identifiant', 30);
    $table->enum('espece', ['bovin','ovin','caprin','porcin','equin','autre']);
    $table->string('race', 60)->nullable();
    $table->enum('sexe', ['male','femelle']);
    $table->date('date_naissance')->nullable();
    $table->decimal('poids', 8, 2)->nullable();
    $table->enum('etat_sante', ['excellent','bon','moyen','mauvais','en_traitement','decede'])->default('bon');
    $table->string('lot', 60)->nullable();
    $table->text('notes')->nullable();
    $table->jsonb('metadata')->default('{}');
    $table->boolean('is_active')->default(true);
    $table->timestampsTz();
    $table->unique(['farm_id', 'identifiant']); // UNIQUE(farm_id, identifiant)
});

// lots_avicoles
Schema::create('lots_avicoles', function (Blueprint $table) {
    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
    $table->foreignUuid('farm_id')->constrained()->cascadeOnDelete();
    $table->string('reference', 40);
    $table->enum('espece', ['poulet','dindon','pintade','caille','canard','autre'])->default('poulet');
    $table->enum('type_production', ['chair','ponte','mixte'])->default('chair');
    $table->integer('nombre_entree');
    $table->integer('nombre_actuel')->nullable();
    $table->date('date_entree');
    $table->date('date_sortie')->nullable();
    $table->string('fournisseur', 120)->nullable();
    $table->decimal('cout_entree', 12, 2)->nullable();
    $table->enum('statut', ['actif','termine','abattage'])->default('actif');
    $table->text('notes')->nullable();
    $table->timestampsTz();
});

// cultures
Schema::create('cultures', function (Blueprint $table) {
    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
    $table->foreignUuid('farm_id')->constrained()->cascadeOnDelete();
    $table->string('nom', 120);
    $table->enum('type', ['herbe','legume','fruit','cereale','arbre','foret','pepiniere','autre'])->nullable();
    $table->string('parcelle', 60)->nullable();
    $table->decimal('superficie_m2', 12, 2)->nullable();
    $table->date('date_semis')->nullable();
    $table->date('date_recolte')->nullable();
    $table->decimal('quantite_kg', 12, 3)->nullable();
    $table->enum('statut', ['planifie','en_cours','recolte','vendu','perdu'])->default('en_cours');
    $table->decimal('cout_total', 12, 2)->nullable();
    $table->decimal('valeur_vente', 12, 2)->nullable();
    $table->text('notes')->nullable();
    $table->timestampsTz();
});

// alertes
Schema::create('alertes', function (Blueprint $table) {
    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
    $table->foreignUuid('farm_id')->constrained()->cascadeOnDelete();
    $table->string('type', 40);
    $table->enum('niveau', ['info','warning','critical','success'])->default('info');
    $table->string('titre', 200);
    $table->text('message')->nullable();
    $table->string('entity_type', 40)->nullable();
    $table->uuid('entity_id')->nullable();
    $table->boolean('is_read')->default(false);
    $table->boolean('is_resolved')->default(false);
    $table->timestampsTz();
});

// audit_logs
Schema::create('audit_logs', function (Blueprint $table) {
    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
    $table->foreignUuid('user_id')->nullable()->constrained()->nullOnDelete();
    $table->foreignUuid('farm_id')->nullable()->constrained()->cascadeOnDelete();
    $table->string('action', 80);
    $table->string('entity_type', 60)->nullable();
    $table->uuid('entity_id')->nullable();
    $table->jsonb('changes')->nullable();
    $table->ipAddress('ip_address')->nullable();
    $table->text('user_agent')->nullable();
    $table->timestampsTz('created_at')->useCurrent();
    // Pas d'updated_at sur les logs d'audit
});
```

---

## 5. Models Eloquent

### 5.1 `User.php`

```php
<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $keyType = 'string';       // UUID
    public $incrementing = false;        // Pas d'auto-increment

    protected $fillable = [
        'email', 'password', 'nom', 'prenom', 'telephone',
        'role', 'farm_id', 'plan', 'is_active', 'preferences',
    ];

    protected $hidden = ['password', 'password_reset_token', 'email_verify_token'];

    protected $casts = [
        'preferences'         => 'array',
        'is_active'           => 'boolean',
        'email_verified'      => 'boolean',
        'failed_login_attempts' => 'integer',
        'last_login'          => 'datetime',
        'locked_until'        => 'datetime',
        'plan_expires'        => 'datetime',
    ];

    // Relations
    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    // Helper rôles (équivalent authorize() middleware)
    public function hasRole(string ...$roles): bool
    {
        return in_array($this->role, $roles);
    }

    // Helper plan (équivalent requirePlan() middleware)
    public function hasPlan(string ...$plans): bool
    {
        return in_array($this->plan, $plans);
    }

    // Compte verrouillé ?
    public function isLocked(): bool
    {
        return $this->locked_until && $this->locked_until->isFuture();
    }
}
```

### 5.2 `Farm.php`

```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Farm extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['nom', 'adresse', 'region', 'superficie_ha', 'plan', 'logo_url'];

    protected $casts = [
        'superficie_ha' => 'decimal:2',
        'plan_expires'  => 'datetime',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function animals(): HasMany
    {
        return $this->hasMany(Animal::class);
    }
}
```

### 5.3 `Transaction.php`

```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Transaction extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'farm_id', 'user_id', 'description', 'montant', 'type',
        'categorie', 'secteur', 'date', 'notes', 'validated',
    ];

    protected $casts = [
        'montant'         => 'decimal:2',
        'date'            => 'date',
        'validated'       => 'boolean',
        'pieces_jointes'  => 'array',
    ];

    // Scopes (équivalent des filtres SQL dans comptabilite.js)
    public function scopeForFarm(Builder $q, string $farmId): Builder
    {
        return $q->where('farm_id', $farmId);
    }

    public function scopeOfType(Builder $q, ?string $type): Builder
    {
        return $type ? $q->where('type', $type) : $q;
    }

    public function scopeOfSecteur(Builder $q, ?string $secteur): Builder
    {
        return $secteur ? $q->where('secteur', $secteur) : $q;
    }

    public function scopeBetweenDates(Builder $q, ?string $from, ?string $to): Builder
    {
        if ($from) $q->whereDate('date', '>=', $from);
        if ($to)   $q->whereDate('date', '<=', $to);
        return $q;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }
}
```

### 5.4 `Animal.php`

```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; // is_active → on utilise SoftDeletes optionnellement

class Animal extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'farm_id', 'identifiant', 'espece', 'race', 'sexe',
        'date_naissance', 'poids', 'etat_sante', 'lot', 'notes', 'metadata',
    ];

    protected $casts = [
        'date_naissance' => 'date',
        'poids'          => 'decimal:2',
        'is_active'      => 'boolean',
        'metadata'       => 'array',
    ];

    // Scope : seulement actifs (is_active = true dans elevage.js)
    public function scopeActive(Builder $q): Builder
    {
        return $q->where('is_active', true);
    }

    public function santeEvents(): HasMany
    {
        return $this->hasMany(SanteEvent::class);
    }
}
```

---

## 6. Authentification (Sanctum)

> **Sanctum remplace votre système JWT** (jsonwebtoken + refresh tokens + blacklist Redis).
> Les tokens Sanctum sont stockés en BDD → révocation native.
> Pour des tokens stateless (SPA), utilisez `createToken()`.

### 6.1 `AuthController.php`

```php
<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Farm;
use App\Mail\VerifyEmailMail;
use App\Mail\ResetPasswordMail;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\{Hash, Mail, Cache, DB, RateLimiter, Str};
use Carbon\Carbon;

class AuthController extends Controller
{
    // ─────────────────────────────────────────────
    // POST /api/auth/register
    // Équivalent: POST /api/auth/register (Node.js)
    // ─────────────────────────────────────────────
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nom'          => 'required|string|max:80',
            'prenom'       => 'required|string|max:80',
            'email'        => 'required|email|unique:users,email',
            'password'     => [
                'required', 'min:10', 'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/',
                // Équivalent règle Node: maj + min + chiffre + spécial
            ],
            'nom_ferme'    => 'required|string|max:120',
            'region'       => 'nullable|string|max:80',
            'superficie_ha'=> 'nullable|numeric|min:0',
        ], [
            'password.regex' => 'Le mot de passe doit contenir majuscule, minuscule, chiffre et caractère spécial.',
        ]);

        return DB::transaction(function () use ($data) {
            // Créer la ferme
            $farm = Farm::create([
                'nom'          => $data['nom_ferme'],
                'region'       => $data['region'] ?? null,
                'superficie_ha'=> $data['superficie_ha'] ?? null,
                'plan'         => 'essai',
            ]);

            // Créer l'utilisateur (propriétaire)
            $verifyToken = Str::random(64);
            $user = User::create([
                'email'               => $data['email'],
                'password'            => Hash::make($data['password']),  // Bcrypt, cost 12 par défaut
                'nom'                 => $data['nom'],
                'prenom'              => $data['prenom'],
                'role'                => 'proprietaire',
                'farm_id'             => $farm->id,
                'plan'                => 'essai',
                'email_verify_token'  => $verifyToken,
                'email_verify_expires'=> Carbon::now()->addHours(24),
            ]);

            // Lier owner_id à la ferme
            $farm->update(['owner_id' => $user->id]);

            // Envoyer email de vérification (équivalent mailer.js 'verify-email')
            Mail::to($user->email)->send(new VerifyEmailMail($user, $verifyToken));

            return response()->json([
                'message' => 'Compte créé. Vérifiez votre email pour activer votre compte.',
                'email'   => $user->email,
            ], 201);
        });
    }

    // ─────────────────────────────────────────────
    // POST /api/auth/login
    // Équivalent: POST /api/auth/login (Node.js)
    // Rate limiting: 10 tentatives / 15 min
    // ─────────────────────────────────────────────
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        // Rate limiting sur l'email (équivalent express-rate-limit sur /auth)
        $key = 'login:' . $request->input('email');
        if (RateLimiter::tooManyAttempts($key, 10)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json([
                'error' => "Trop de tentatives. Réessayez dans {$seconds} secondes.",
            ], 429);
        }

        // Délai constant anti-timing attack (équivalent Node.js)
        usleep(rand(100000, 200000)); // 100-200ms

        $user = User::where('email', $request->email)->first();

        // Vérification compte verrouillé (équivalent lockUntil Node.js)
        if ($user && $user->isLocked()) {
            return response()->json([
                'error' => 'Compte temporairement verrouillé. Réessayez dans quelques minutes.',
            ], 423);
        }

        if (!$user || !Hash::check($request->password, $user->password)) {
            RateLimiter::hit($key, 900); // 15 minutes

            // Incrémenter failed_login_attempts
            if ($user) {
                $user->increment('failed_login_attempts');
                // Verrouiller après 5 tentatives (équivalent Node.js)
                if ($user->failed_login_attempts >= 5) {
                    $user->update(['locked_until' => Carbon::now()->addMinutes(15)]);
                }
            }

            return response()->json(['error' => 'Identifiants invalides.'], 401);
        }

        // Vérification email obligatoire
        if (!$user->email_verified) {
            return response()->json(['error' => 'Email non vérifié. Vérifiez votre boîte mail.'], 403);
        }

        // Vérification compte actif
        if (!$user->is_active) {
            return response()->json(['error' => 'Compte désactivé.'], 403);
        }

        // Succès → reset compteur + MAJ last_login
        RateLimiter::clear($key);
        $user->update([
            'failed_login_attempts' => 0,
            'locked_until'          => null,
            'last_login'            => Carbon::now(),
        ]);

        // Créer le token Sanctum (équivalent accessToken + refreshToken JWT)
        $token = $user->createToken('agrosync-app', ['*'], Carbon::now()->addDays(7));

        return response()->json([
            'token'      => $token->plainTextToken,
            'expires_at' => $token->accessToken->expires_at,
            'user'       => [
                'id'     => $user->id,
                'email'  => $user->email,
                'nom'    => $user->nom,
                'prenom' => $user->prenom,
                'role'   => $user->role,
                'plan'   => $user->plan,
                'farmId' => $user->farm_id,
            ],
        ]);
    }

    // ─────────────────────────────────────────────
    // POST /api/auth/logout
    // Équivalent: POST /api/auth/logout (révoque token)
    // Remplace la blacklist Redis → suppression BDD
    // ─────────────────────────────────────────────
    public function logout(Request $request): JsonResponse
    {
        // Révoquer le token courant (équivalent revokeToken + blacklist Redis)
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté avec succès.']);
    }

    // ─────────────────────────────────────────────
    // POST /api/auth/forgot-password
    // Équivalent: POST /api/auth/forgot-password
    // ─────────────────────────────────────────────
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        // Réponse identique qu'il y ait un compte ou non (anti-énumération)
        $user = User::where('email', $request->email)->first();

        if ($user) {
            $resetToken = Str::random(64);
            $user->update([
                'password_reset_token'   => hash('sha256', $resetToken), // Hash SHA-256 comme Node.js
                'password_reset_expires' => Carbon::now()->addHour(),
            ]);

            Mail::to($user->email)->send(new ResetPasswordMail($user, $resetToken));
        }

        // Toujours répondre succès (équivalent Node.js)
        return response()->json([
            'message' => 'Si un compte existe avec cet email, un lien a été envoyé.',
        ]);
    }

    // ─────────────────────────────────────────────
    // POST /api/auth/reset-password
    // ─────────────────────────────────────────────
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token'    => 'required|string',
            'password' => [
                'required', 'min:10', 'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/',
            ],
        ]);

        $hashedToken = hash('sha256', $request->token);

        $user = User::where('password_reset_token', $hashedToken)
                    ->where('password_reset_expires', '>', Carbon::now())
                    ->first();

        if (!$user) {
            return response()->json(['error' => 'Token invalide ou expiré.'], 400);
        }

        $user->update([
            'password'              => Hash::make($request->password),
            'password_reset_token'  => null,
            'password_reset_expires'=> null,
        ]);

        // Révoquer tous les tokens actifs (équivalent Node.js)
        $user->tokens()->delete();

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès.']);
    }

    // ─────────────────────────────────────────────
    // GET /api/auth/verify-email/:token
    // ─────────────────────────────────────────────
    public function verifyEmail(string $token): JsonResponse
    {
        $user = User::where('email_verify_token', $token)
                    ->where('email_verify_expires', '>', Carbon::now())
                    ->first();

        if (!$user) {
            return response()->json(['error' => 'Lien de vérification invalide ou expiré.'], 400);
        }

        $user->update([
            'email_verified'       => true,
            'email_verify_token'   => null,
            'email_verify_expires' => null,
        ]);

        return response()->json(['message' => 'Email vérifié. Vous pouvez vous connecter.']);
    }

    // ─────────────────────────────────────────────
    // GET /api/auth/me
    // ─────────────────────────────────────────────
    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user()->load('farm'));
    }
}
```

---

## 7. Middleware

### 7.1 `CheckRole.php` — Équivalent de `authorize()`

```php
<?php
// app/Http/Middleware/CheckRole.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    /**
     * Équivalent exact de:
     * const authorize = (...roles) => (req, res, next) => { ... }
     *
     * Usage dans les routes:
     * ->middleware('role:proprietaire,gerant')
     */
    public function handle(Request $request, Closure $next, string ...$roles): mixed
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        if (!in_array($user->role, $roles)) {
            return response()->json([
                'error'    => 'Accès refusé',
                'required' => $roles,
                'current'  => $user->role,
            ], 403);
        }

        return $next($request);
    }
}
```

### 7.2 `CheckPlan.php` — Équivalent de `requirePlan()`

```php
<?php
// app/Http/Middleware/CheckPlan.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckPlan
{
    /**
     * Équivalent exact de:
     * const requirePlan = (...plans) => (req, res, next) => { ... }
     *
     * Usage: ->middleware('plan:professionnel,entreprise')
     */
    public function handle(Request $request, Closure $next, string ...$plans): mixed
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        if (!in_array($user->plan, $plans)) {
            return response()->json([
                'error'         => 'Fonctionnalité non disponible pour votre plan',
                'currentPlan'   => $user->plan,
                'requiredPlans' => $plans,
            ], 403);
        }

        return $next($request);
    }
}
```

### 7.3 Enregistrer les middlewares dans `bootstrap/app.php` (Laravel 11)

```php
// bootstrap/app.php
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(...)
    ->withMiddleware(function (Middleware $middleware) {
        // Enregistrement des alias (équivalent app.use dans Express)
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
            'plan' => \App\Http\Middleware\CheckPlan::class,
        ]);
    })
    ->create();
```

---

## 8. Form Requests (Validation)

> Remplace `express-validator` (transactionRules, animalRules, etc.)

### 8.1 `StoreTransactionRequest.php`

```php
<?php
// app/Http/Requests/StoreTransactionRequest.php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Équivalent: authorize('proprietaire', 'gerant', 'comptable')
        return $this->user()->hasRole('proprietaire', 'gerant', 'comptable');
    }

    public function rules(): array
    {
        return [
            'description' => 'required|string|max:255',
            'montant'     => 'required|numeric|min:0.01',
            'type'        => 'required|in:recette,depense',
            'categorie'   => 'required|string|max:80',
            'secteur'     => 'required|in:elevage,aviculture,herbes,legumes,foret,general,pepiniere,import,export',
            'date'        => 'required|date',
            'notes'       => 'nullable|string|max:5000',
        ];
    }

    public function messages(): array
    {
        return [
            'secteur.in'     => 'Secteur invalide.',
            'type.in'        => 'Type doit être recette ou depense.',
            'montant.min'    => 'Le montant doit être positif.',
        ];
    }
}
```

### 8.2 `StoreAnimalRequest.php`

```php
<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAnimalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('proprietaire', 'gerant', 'veterinaire');
    }

    public function rules(): array
    {
        return [
            'identifiant'    => 'required|string|max:30',
            'espece'         => 'required|in:bovin,ovin,caprin,porcin,equin,autre',
            'race'           => 'nullable|string|max:60',
            'sexe'           => 'required|in:male,femelle',
            'date_naissance' => 'nullable|date|before:today',
            'poids'          => 'nullable|numeric|min:0',
            'lot'            => 'nullable|string|max:60',
            'notes'          => 'nullable|string',
        ];
    }
}
```

---

## 9. Controllers

### 9.1 `ComptabiliteController.php`

```php
<?php
namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Http\Requests\StoreTransactionRequest;
use App\Traits\Auditable;
use Illuminate\Http\{Request, JsonResponse};
use Illuminate\Support\Facades\DB;

class ComptabiliteController extends Controller
{
    use Auditable;

    // ─────────────────────────────────────────────
    // GET /api/comptabilite/transactions
    // Équivalent exact du GET Node.js avec filtres + pagination
    // ─────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $farmId  = $request->user()->farm_id;
        $perPage = min((int) $request->get('limit', 50), 200);

        $query = Transaction::forFarm($farmId)
            ->with('user:id,nom,prenom')
            ->ofType($request->get('type'))
            ->ofSecteur($request->get('secteur'))
            ->betweenDates($request->get('dateFrom'), $request->get('dateTo'));

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'ilike', "%{$search}%")
                  ->orWhere('categorie', 'ilike', "%{$search}%");
            });
        }

        // Totaux (équivalent SUM avec CASE WHEN Node.js)
        $totalsQuery = clone $query;
        $totals = $totalsQuery->selectRaw("
            SUM(CASE WHEN type='recette' THEN montant ELSE 0 END) AS total_recettes,
            SUM(CASE WHEN type='depense' THEN montant ELSE 0 END) AS total_depenses,
            COUNT(*) AS total_transactions
        ")->first();

        $paginated = $query->orderByDesc('date')->orderByDesc('created_at')->paginate($perPage);

        return response()->json([
            'transactions' => $paginated->items(),
            'pagination'   => [
                'page'  => $paginated->currentPage(),
                'limit' => $paginated->perPage(),
                'total' => $paginated->total(),
                'pages' => $paginated->lastPage(),
            ],
            'totals' => $totals,
        ]);
    }

    // ─────────────────────────────────────────────
    // POST /api/comptabilite/transactions
    // ─────────────────────────────────────────────
    public function store(StoreTransactionRequest $request): JsonResponse
    {
        $transaction = Transaction::create([
            ...$request->validated(),
            'farm_id' => $request->user()->farm_id,
            'user_id' => $request->user()->id,
        ]);

        // Équivalent logAudit(req.user, 'transaction.create', ...)
        $this->audit($request->user(), 'transaction.create', 'transaction', $transaction->id, [
            'type'    => $transaction->type,
            'montant' => $transaction->montant,
            'secteur' => $transaction->secteur,
        ], $request);

        return response()->json($transaction, 201);
    }

    // ─────────────────────────────────────────────
    // GET /api/comptabilite/transactions/:id
    // ─────────────────────────────────────────────
    public function show(Request $request, string $id): JsonResponse
    {
        $transaction = Transaction::where('id', $id)
            ->where('farm_id', $request->user()->farm_id)
            ->firstOrFail();

        return response()->json($transaction);
    }

    // ─────────────────────────────────────────────
    // PUT /api/comptabilite/transactions/:id
    // ─────────────────────────────────────────────
    public function update(StoreTransactionRequest $request, string $id): JsonResponse
    {
        $transaction = Transaction::where('id', $id)
            ->where('farm_id', $request->user()->farm_id)
            ->firstOrFail();

        $transaction->update($request->validated());
        $this->audit($request->user(), 'transaction.update', 'transaction', $id, $request->validated(), $request);

        return response()->json($transaction->fresh());
    }

    // ─────────────────────────────────────────────
    // DELETE /api/comptabilite/transactions/:id
    // ─────────────────────────────────────────────
    public function destroy(Request $request, string $id): JsonResponse
    {
        $transaction = Transaction::where('id', $id)
            ->where('farm_id', $request->user()->farm_id)
            ->firstOrFail();

        $transaction->delete();
        $this->audit($request->user(), 'transaction.delete', 'transaction', $id, [], $request);

        return response()->json(['message' => 'Transaction supprimée']);
    }

    // ─────────────────────────────────────────────
    // GET /api/comptabilite/bilan
    // Équivalent exact de la requête GROUP BY secteur
    // ─────────────────────────────────────────────
    public function bilan(Request $request): JsonResponse
    {
        $farmId = $request->user()->farm_id;
        $annee  = $request->get('annee', now()->year);
        $mois   = $request->get('mois');

        $query = Transaction::where('farm_id', $farmId)
            ->whereYear('date', $annee);

        if ($mois) {
            $query->whereMonth('date', $mois);
        }

        // Par secteur
        $parSecteur = (clone $query)
            ->selectRaw("
                secteur,
                SUM(CASE WHEN type='recette' THEN montant ELSE 0 END)    AS recettes,
                SUM(CASE WHEN type='depense' THEN montant ELSE 0 END)    AS depenses,
                SUM(CASE WHEN type='recette' THEN montant ELSE -montant END) AS resultat
            ")
            ->groupBy('secteur')
            ->orderByDesc('recettes')
            ->get();

        // Global
        $global = (clone $query)
            ->selectRaw("
                SUM(CASE WHEN type='recette' THEN montant ELSE 0 END)    AS total_recettes,
                SUM(CASE WHEN type='depense' THEN montant ELSE 0 END)    AS total_depenses,
                SUM(CASE WHEN type='recette' THEN montant ELSE -montant END) AS resultat_net,
                COUNT(*) AS nb_transactions
            ")
            ->first();

        $margeNette = $global->total_recettes > 0
            ? round(($global->resultat_net / $global->total_recettes) * 100, 2)
            : 0;

        return response()->json([
            'periode'    => ['annee' => $annee, 'mois' => $mois],
            'global'     => array_merge($global->toArray(), ['marge_nette_pct' => $margeNette]),
            'parSecteur' => $parSecteur,
        ]);
    }

    // ─────────────────────────────────────────────
    // GET /api/comptabilite/evolution-mensuelle
    // ─────────────────────────────────────────────
    public function evolutionMensuelle(Request $request): JsonResponse
    {
        $year = $request->get('annee', now()->year);

        $evolution = Transaction::where('farm_id', $request->user()->farm_id)
            ->whereYear('date', $year)
            ->selectRaw("
                EXTRACT(MONTH FROM date)::INT AS mois,
                TO_CHAR(date, 'Mon') AS mois_label,
                SUM(CASE WHEN type='recette' THEN montant ELSE 0 END) AS recettes,
                SUM(CASE WHEN type='depense' THEN montant ELSE 0 END) AS depenses
            ")
            ->groupByRaw("EXTRACT(MONTH FROM date), TO_CHAR(date, 'Mon')")
            ->orderBy('mois')
            ->get();

        return response()->json(['annee' => $year, 'evolution' => $evolution]);
    }
}
```

### 9.2 `ElevageController.php`

```php
<?php
namespace App\Http\Controllers;

use App\Models\{Animal, SanteEvent};
use App\Http\Requests\StoreAnimalRequest;
use App\Traits\Auditable;
use Illuminate\Http\{Request, JsonResponse};

class ElevageController extends Controller
{
    use Auditable;

    // GET /api/elevage/animaux
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->get('limit', 50), 200);

        $query = Animal::where('farm_id', $request->user()->farm_id)
            ->active();

        if ($espece = $request->get('espece')) {
            $query->where('espece', $espece);
        }
        if ($etat = $request->get('etat_sante')) {
            $query->where('etat_sante', $etat);
        }
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('identifiant', 'ilike', "%{$search}%")
                  ->orWhere('race', 'ilike', "%{$search}%");
            });
        }

        $paginated = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json([
            'animals'    => $paginated->items(),
            'pagination' => [
                'page'  => $paginated->currentPage(),
                'limit' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    // POST /api/elevage/animaux
    public function store(StoreAnimalRequest $request): JsonResponse
    {
        $animal = Animal::create([
            ...$request->validated(),
            'farm_id' => $request->user()->farm_id,
        ]);

        $this->audit($request->user(), 'animal.create', 'animal', $animal->id, [
            'espece'      => $animal->espece,
            'identifiant' => $animal->identifiant,
        ]);

        return response()->json($animal, 201);
    }

    // GET /api/elevage/animaux/:id
    public function show(Request $request, string $id): JsonResponse
    {
        $animal = Animal::where('id', $id)
            ->where('farm_id', $request->user()->farm_id)
            ->firstOrFail();

        return response()->json($animal);
    }

    // PUT /api/elevage/animaux/:id
    public function update(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'race'           => 'nullable|string|max:60',
            'sexe'           => 'nullable|in:male,femelle',
            'date_naissance' => 'nullable|date',
            'poids'          => 'nullable|numeric|min:0',
            'etat_sante'     => 'nullable|in:excellent,bon,moyen,mauvais,en_traitement,decede',
            'lot'            => 'nullable|string|max:60',
            'notes'          => 'nullable|string',
        ]);

        $animal = Animal::where('id', $id)
            ->where('farm_id', $request->user()->farm_id)
            ->firstOrFail();

        $animal->update($request->validated());

        return response()->json($animal->fresh());
    }

    // DELETE (soft) /api/elevage/animaux/:id
    public function destroy(Request $request, string $id): JsonResponse
    {
        $animal = Animal::where('id', $id)
            ->where('farm_id', $request->user()->farm_id)
            ->firstOrFail();

        $animal->update(['is_active' => false]);
        $this->audit($request->user(), 'animal.delete', 'animal', $id, []);

        return response()->json(['message' => 'Animal archivé']);
    }

    // GET /api/elevage/stats
    public function stats(Request $request): JsonResponse
    {
        $farmId = $request->user()->farm_id;

        $parEspece = Animal::where('farm_id', $farmId)->active()
            ->selectRaw('espece, COUNT(*) AS total')
            ->groupBy('espece')
            ->orderByDesc('total')
            ->get();

        $parEtat = Animal::where('farm_id', $farmId)->active()
            ->selectRaw('etat_sante, COUNT(*) AS total')
            ->groupBy('etat_sante')
            ->get();

        $evenementsRecents = SanteEvent::where('farm_id', $farmId)
            ->orderByDesc('date')
            ->limit(10)
            ->get();

        return response()->json([
            'parEspece'         => $parEspece,
            'parEtat'           => $parEtat,
            'evenementsRecents' => $evenementsRecents,
        ]);
    }
}
```

### 9.3 `DashboardController.php`

```php
<?php
namespace App\Http\Controllers;

use App\Models\{Transaction, Animal, Alerte};
use Illuminate\Http\{Request, JsonResponse};
use Carbon\Carbon;

class DashboardController extends Controller
{
    // GET /api/dashboard/kpis
    public function kpis(Request $request): JsonResponse
    {
        $farmId       = $request->user()->farm_id;
        $startOfMonth = Carbon::now()->startOfMonth();
        $startOfLast  = Carbon::now()->subMonth()->startOfMonth();
        $endOfLast    = Carbon::now()->subMonth()->endOfMonth();

        // Ce mois (équivalent Promise.all Node.js)
        $curr = Transaction::where('farm_id', $farmId)
            ->where('date', '>=', $startOfMonth)
            ->selectRaw("
                SUM(CASE WHEN type='recette' THEN montant ELSE 0 END) AS recettes,
                SUM(CASE WHEN type='depense' THEN montant ELSE 0 END) AS depenses
            ")->first();

        // Mois précédent
        $prev = Transaction::where('farm_id', $farmId)
            ->whereBetween('date', [$startOfLast, $endOfLast])
            ->selectRaw("
                SUM(CASE WHEN type='recette' THEN montant ELSE 0 END) AS recettes,
                SUM(CASE WHEN type='depense' THEN montant ELSE 0 END) AS depenses
            ")->first();

        $resultatNet     = ($curr->recettes ?? 0) - ($curr->depenses ?? 0);
        $resultatNetPrev = ($prev->recettes ?? 0) - ($prev->depenses ?? 0);

        $pct = fn($curr, $prev) => $prev > 0 ? round((($curr - $prev) / $prev) * 100, 1) : null;

        $animauxCount = Animal::where('farm_id', $farmId)->where('is_active', true)->count();
        $alerteCount  = Alerte::where('farm_id', $farmId)->where('is_read', false)->count();

        $recentTransactions = Transaction::where('farm_id', $farmId)
            ->orderByDesc('date')->orderByDesc('created_at')
            ->limit(5)
            ->get(['description', 'montant', 'type', 'secteur', 'date']);

        return response()->json([
            'periode' => ['mois' => now()->month, 'annee' => now()->year],
            'kpis' => [
                'recettes'    => ['valeur' => (float)($curr->recettes ?? 0), 'delta_pct' => $pct($curr->recettes ?? 0, $prev->recettes ?? 0)],
                'depenses'    => ['valeur' => (float)($curr->depenses ?? 0), 'delta_pct' => $pct($curr->depenses ?? 0, $prev->depenses ?? 0)],
                'resultatNet' => ['valeur' => (float)$resultatNet, 'delta_pct' => $pct($resultatNet, $resultatNetPrev)],
                'margeNette'  => ['valeur' => $curr->recettes > 0 ? round(($resultatNet / $curr->recettes) * 100, 1) : 0],
                'animaux'     => ['valeur' => $animauxCount],
                'alertes'     => ['valeur' => $alerteCount],
            ],
            'recentTransactions' => $recentTransactions,
        ]);
    }

    // GET /api/dashboard/repartition-secteurs
    public function repartitionSecteurs(Request $request): JsonResponse
    {
        $year  = $request->get('annee', now()->year);
        $month = $request->get('mois', now()->month);

        $result = Transaction::where('farm_id', $request->user()->farm_id)
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->where('type', 'recette')
            ->selectRaw("
                secteur,
                SUM(montant) AS recettes
            ")
            ->groupBy('secteur')
            ->orderByDesc('recettes')
            ->get();

        return response()->json($result);
    }
}
```

### 9.4 `FarmController.php`

```php
<?php
namespace App\Http\Controllers;

use App\Models\Farm;
use Illuminate\Http\{Request, JsonResponse};

class FarmController extends Controller
{
    // GET /api/farms/me — Équivalent GET /api/farms/me Node.js
    public function show(Request $request): JsonResponse
    {
        $farm = Farm::findOrFail($request->user()->farm_id);
        return response()->json($farm->only(['id','nom','adresse','region','superficie_ha','plan','plan_expires']));
    }

    // PATCH /api/farms/me — Équivalent PATCH /api/farms/me Node.js
    // Middleware: role:proprietaire
    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'nom'           => 'sometimes|string|max:120',
            'adresse'       => 'nullable|string',
            'region'        => 'nullable|string|max:80',
            'superficie_ha' => 'nullable|numeric|min:0',
        ]);

        $farm = Farm::findOrFail($request->user()->farm_id);
        $farm->update($request->validated());

        return response()->json($farm->fresh());
    }
}
```

### 9.5 `RapportController.php`

```php
<?php
namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\{Request, JsonResponse};

class RapportController extends Controller
{
    // GET /api/rapports/annuel
    // Middleware: plan:professionnel,entreprise
    public function annuel(Request $request): JsonResponse
    {
        $farmId = $request->user()->farm_id;
        $year   = $request->get('annee', now()->year);

        $query = Transaction::where('farm_id', $farmId)->whereYear('date', $year);

        $bilan = (clone $query)->selectRaw("
            SUM(CASE WHEN type='recette' THEN montant ELSE 0 END)    AS total_recettes,
            SUM(CASE WHEN type='depense' THEN montant ELSE 0 END)    AS total_depenses,
            SUM(CASE WHEN type='recette' THEN montant ELSE -montant END) AS resultat_net,
            COUNT(*) AS nb_transactions
        ")->first();

        $evolution = (clone $query)->selectRaw("
            EXTRACT(MONTH FROM date)::INT AS mois,
            SUM(CASE WHEN type='recette' THEN montant ELSE 0 END) AS recettes,
            SUM(CASE WHEN type='depense' THEN montant ELSE 0 END) AS depenses
        ")->groupByRaw("EXTRACT(MONTH FROM date)")->orderBy('mois')->get();

        $topCategories = (clone $query)->selectRaw("categorie, SUM(montant) AS total, type")
            ->groupBy('categorie', 'type')
            ->orderByDesc('total')
            ->limit(10)
            ->get();

        $farm = $request->user()->farm;

        return response()->json([
            'ferme'         => $farm->only(['nom', 'adresse', 'region']),
            'periode'       => ['annee' => $year],
            'bilan'         => array_merge($bilan->toArray(), [
                'marge_nette_pct' => $bilan->total_recettes > 0
                    ? round(($bilan->resultat_net / $bilan->total_recettes) * 100, 2) : 0,
            ]),
            'evolution'     => $evolution,
            'topCategories' => $topCategories,
            'genere_le'     => now()->toISOString(),
        ]);
    }
}
```

---

## 10. Routes API

```php
<?php
// routes/api.php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\{
    DashboardController, ComptabiliteController,
    ElevageController, AvicultureController,
    HerbesController, FarmController, RapportController
};

// ─────────────────────────────────────────────
// AUTH — Public (pas de middleware auth)
// Rate limiting: équivalent express-rate-limit strict sur /auth
// ─────────────────────────────────────────────
Route::prefix('auth')->middleware('throttle:10,15')->group(function () {
    Route::post('register',        [AuthController::class, 'register']);
    Route::post('login',           [AuthController::class, 'login']);
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password',  [AuthController::class, 'resetPassword']);
    Route::get('verify-email/{token}', [AuthController::class, 'verifyEmail']);
});

// ─────────────────────────────────────────────
// ROUTES PROTÉGÉES
// Équivalent: router.use(authenticate)
// ─────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'throttle:200,15'])->group(function () {

    // Auth (connecté)
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me',      [AuthController::class, 'me']);
    });

    // Dashboard
    Route::prefix('dashboard')->group(function () {
        Route::get('kpis',                 [DashboardController::class, 'kpis']);
        Route::get('repartition-secteurs', [DashboardController::class, 'repartitionSecteurs']);
    });

    // Ferme
    Route::prefix('farms')->group(function () {
        Route::get('me',   [FarmController::class, 'show']);
        Route::patch('me', [FarmController::class, 'update'])->middleware('role:proprietaire');
    });

    // Comptabilité
    Route::prefix('comptabilite')->group(function () {
        Route::get('transactions',       [ComptabiliteController::class, 'index']);
        Route::post('transactions',      [ComptabiliteController::class, 'store']);
            // Équivalent: authorize('proprietaire','gerant','comptable') dans StoreTransactionRequest
        Route::get('transactions/{id}',  [ComptabiliteController::class, 'show']);
        Route::put('transactions/{id}',  [ComptabiliteController::class, 'update']);
        Route::delete('transactions/{id}', [ComptabiliteController::class, 'destroy'])
            ->middleware('role:proprietaire,gerant');
        Route::get('bilan',              [ComptabiliteController::class, 'bilan']);
        Route::get('evolution-mensuelle', [ComptabiliteController::class, 'evolutionMensuelle']);
    });

    // Élevage
    Route::prefix('elevage')->group(function () {
        Route::get('animaux',        [ElevageController::class, 'index']);
        Route::post('animaux',       [ElevageController::class, 'store']);
        Route::get('animaux/{id}',   [ElevageController::class, 'show']);
        Route::put('animaux/{id}',   [ElevageController::class, 'update'])
            ->middleware('role:proprietaire,gerant,veterinaire');
        Route::delete('animaux/{id}', [ElevageController::class, 'destroy'])
            ->middleware('role:proprietaire,gerant');
        Route::get('stats',          [ElevageController::class, 'stats']);
    });

    // Aviculture
    Route::prefix('aviculture')->group(function () {
        Route::get('lots',  [AvicultureController::class, 'index']);
        Route::post('lots', [AvicultureController::class, 'store']);
    });

    // Herbes & Aromates
    Route::prefix('herbes')->group(function () {
        Route::get('cultures',  [HerbesController::class, 'index']);
        Route::post('cultures', [HerbesController::class, 'store']);
    });

    // Rapports — Plan Pro/Entreprise requis
    Route::prefix('rapports')->middleware('plan:professionnel,entreprise')->group(function () {
        Route::get('annuel', [RapportController::class, 'annuel']);
    });
});
```

---

## 11. Utilitaires

### 11.1 `Auditable.php` Trait — Équivalent de `audit.js`

```php
<?php
// app/Traits/Auditable.php
namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Http\Request;

trait Auditable
{
    /**
     * Équivalent exact de:
     * const logAudit = async (user, action, entityType, entityId, changes, req) => { ... }
     */
    protected function audit(
        $user,
        string $action,
        string $entityType,
        string $entityId,
        array $changes = [],
        ?Request $request = null
    ): void {
        try {
            AuditLog::create([
                'user_id'     => $user->id,
                'farm_id'     => $user->farm_id,
                'action'      => $action,
                'entity_type' => $entityType,
                'entity_id'   => $entityId,
                'changes'     => $changes,
                'ip_address'  => $request?->ip(),
                'user_agent'  => $request?->userAgent(),
            ]);
        } catch (\Throwable $e) {
            // Ne pas bloquer l'opération si l'audit échoue (même comportement Node.js)
            \Log::error('[AUDIT] Erreur enregistrement: ' . $e->getMessage());
        }
    }
}
```

### 11.2 `VerifyEmailMail.php` — Équivalent `mailer.js verify-email`

```php
<?php
// app/Mail/VerifyEmailMail.php
namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\{Content, Envelope};

class VerifyEmailMail extends Mailable
{
    public function __construct(
        public readonly \App\Models\User $user,
        public readonly string $token
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: '✅ Vérifiez votre compte AgroSync');
    }

    public function content(): Content
    {
        $verifyUrl = config('app.url') . '/api/auth/verify-email/' . $this->token;

        return new Content(
            htmlString: view('emails.verify-email', [
                'user'      => $this->user,
                'verifyUrl' => $verifyUrl,
            ])->render()
        );
    }
}
```

### 11.3 `ResetPasswordMail.php` — Équivalent `mailer.js reset-password`

```php
<?php
namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\{Content, Envelope};

class ResetPasswordMail extends Mailable
{
    public function __construct(
        public readonly \App\Models\User $user,
        public readonly string $token
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: '🔐 Réinitialisation de mot de passe — AgroSync');
    }

    public function content(): Content
    {
        $resetUrl = env('FRONTEND_URL') . '/reset-password?token=' . $this->token;

        return new Content(
            htmlString: view('emails.reset-password', [
                'user'     => $this->user,
                'resetUrl' => $resetUrl,
            ])->render()
        );
    }
}
```

---

## 12. Redis & Cache

> Redis remplace la blacklist JWT. Avec Sanctum, les tokens sont en BDD → Redis est optionnel mais utile pour le cache.

```php
// config/database.php — section Redis
'redis' => [
    'client' => env('REDIS_CLIENT', 'predis'), // Équivalent createClient() redis.js

    'default' => [
        'url'      => env('REDIS_URL'),
        'host'     => env('REDIS_HOST', '127.0.0.1'),
        'password' => env('REDIS_PASSWORD'),
        'port'     => env('REDIS_PORT', '6379'),
        'database' => '0',
    ],

    'cache' => [
        'host'     => env('REDIS_HOST', '127.0.0.1'),
        'password' => env('REDIS_PASSWORD'),
        'port'     => env('REDIS_PORT', '6379'),
        'database' => '1',
    ],
],
```

```php
// Exemple d'utilisation du cache Redis (équivalent redis.setEx Node.js)
use Illuminate\Support\Facades\Cache;

// Cache les KPIs 5 minutes
$kpis = Cache::remember("kpis:farm:{$farmId}", 300, function () use ($farmId) {
    // ... requêtes
});

// Invalider le cache lors d'une nouvelle transaction
Cache::forget("kpis:farm:{$farmId}");
```

---

## 13. Frontend — Adaptation des appels API

> Les URLs et la structure JSON sont **identiques**.
> Seul le token change : Sanctum utilise un Bearer token simple (pas access+refresh JWT).

```javascript
// assets/api-client.js — Version Laravel/Sanctum
// Remplace la logique de refresh token JWT

const API = {
  baseUrl: 'https://api.agrosync.ma',

  getToken() {
    return localStorage.getItem('agrosync_token');
  },

  setToken(token) {
    localStorage.setItem('agrosync_token', token);
  },

  async request(url, options = {}) {
    const token = this.getToken();

    const response = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    // Token expiré ou révoqué → redirection login
    // Sanctum retourne 401 directement (pas de refresh token séparé)
    if (response.status === 401) {
      this.setToken(null);
      window.location.href = '/login.html';
      return;
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  },

  get: (url) => API.request(url, { method: 'GET' }),
  post: (url, data) => API.request(url, { method: 'POST', body: JSON.stringify(data) }),
  put: (url, data) => API.request(url, { method: 'PUT', body: JSON.stringify(data) }),
  patch: (url, data) => API.request(url, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (url) => API.request(url, { method: 'DELETE' }),
};
```

```javascript
// login.html — Adaptation pour Laravel/Sanctum
async function login(email, password) {
  const data = await API.post('/api/auth/login', { email, password });
  API.setToken(data.token);      // ← Plus d'accessToken/refreshToken séparés
  window.location.href = '/dashboard.html';
}

// forgot-password.html — Identique (même endpoint)
// Les URLs /api/auth/* sont exactement les mêmes
```

---

## 14. Tableau de Correspondance Complète

| Fichier Node.js | Équivalent Laravel | Notes |
|---|---|---|
| `server.js` | `bootstrap/app.php` + `routes/api.php` | Point d'entrée |
| `config/database.js` | `config/database.php` + `.env` | Pool PG → PDO |
| `config/redis.js` | `config/database.php` (redis section) | Predis client |
| `middleware/auth.js` → `authenticate` | `auth:sanctum` middleware Laravel | JWT → Sanctum tokens |
| `middleware/auth.js` → `authorize()` | `CheckRole.php` + `->middleware('role:...')` | Identique |
| `middleware/auth.js` → `requirePlan()` | `CheckPlan.php` + `->middleware('plan:...')` | Identique |
| `middleware/auth.js` → `generateTokens()` | `$user->createToken(...)` Sanctum | Access+Refresh → 1 token |
| `middleware/auth.js` → `revokeToken()` | `$user->currentAccessToken()->delete()` | BDD au lieu de Redis |
| `middleware/validation.js` | `Form Request` classes | `authorize()` + `rules()` |
| `routes/auth.js` | `AuthController.php` | Toutes les routes auth |
| `routes/dashboard.js` | `DashboardController.php` | KPIs identiques |
| `routes/comptabilite.js` | `ComptabiliteController.php` | CRUD + bilan + évolution |
| `routes/elevage.js` | `ElevageController.php` | CRUD animaux + stats |
| `routes/aviculture.js` | `AvicultureController.php` | Lots avicoles |
| `routes/herbes.js` | `HerbesController.php` | Cultures herbes |
| `routes/farms.js` | `FarmController.php` | Info ferme |
| `routes/rapports.js` | `RapportController.php` | Plan Pro requis |
| `utils/audit.js` → `logAudit()` | `Auditable` trait | Même comportement |
| `utils/mailer.js` → `sendEmail()` | `Mail::to()->send()` + Mailable | Templates identiques |
| `config/schema.sql` | `database/migrations/*.php` | Tables identiques |
| `package.json` → `helmet` | `config/cors.php` + Sanctum CSRF | Headers sécurité |
| `package.json` → `express-rate-limit` | `throttle:10,15` middleware | Rate limiting natif |
| `package.json` → `bcrypt` (12 rounds) | `Hash::make()` bcrypt cost 12 (config) | `config/hashing.php` |
| `package.json` → `morgan` | `telescope` (dev) + `activity log` | Logging HTTP |
| `package.json` → `uuid` | `$table->uuid()` Eloquent natif | UUID auto |
| `schema.sql` → Row Level Security | Scope `forFarm($farmId)` dans chaque query | Laravel = scope, pas RLS |
| `schema.sql` → `updatedAt` trigger | `$table->timestampsTz()` Eloquent auto | Natif Laravel |
| `blacklist Redis` JWT | Suppression token Sanctum en BDD | Plus fiable |

---

## Commandes de démarrage rapide

```bash
# 1. Créer le projet
composer create-project laravel/laravel agrosync-laravel

# 2. Installer les dépendances
composer require laravel/sanctum predis/predis

# 3. Configurer le .env (PostgreSQL + Redis + Mail)

# 4. Générer la clé
php artisan key:generate

# 5. Créer les migrations
php artisan make:migration create_farms_table
php artisan make:migration create_users_table
# ... (une par table)

# 6. Lancer les migrations
php artisan migrate

# 7. Publier Sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate

# 8. Démarrer le serveur
php artisan serve --port=3000    # Même port que Node.js
```

> **💡 Conseil :** Commencez par `AuthController` + `ComptabiliteController` + les migrations.
> Ces deux fichiers couvrent 70% de la logique critique de votre application.
