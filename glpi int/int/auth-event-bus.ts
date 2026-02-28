/**
 * ═══════════════════════════════════════════════════════
 * lib/auth-event-bus.ts — Bus d'événements d'authentification
 * ═══════════════════════════════════════════════════════
 *
 * Problème résolu :
 *  Avec un seul backend, un 401 doit déclencher une
 *  déconnexion propre et une redirection vers /login.
 *  Sans ce bus, des composants React pourraient rester
 *  en état zombie (partiellement authentifiés).
 *
 * Usage :
 *  - L'intercepteur Axios appelle emitUnauthorized() sur 401
 *  - Le composant AuthProvider écoute onUnauthorized()
 *    et exécute le logout complet (vide le state + redirect)
 *
 * Pattern : EventTarget natif — pas de dépendance externe.
 *           Fonctionne côté client (browser) et SSR (Next.js).
 */

// ─────────────────────────────────────────────
// Guard SSR : EventTarget n'existe pas en Node.js
// ─────────────────────────────────────────────
const isClient = typeof window !== 'undefined';

class AuthEventBus {
  private bus: EventTarget | null;

  // Noms d'événements typés
  static readonly EVENTS = {
    UNAUTHORIZED:   'auth:unauthorized',   // 401 reçu — session expirée ou invalide
    SESSION_EXPIRED:'auth:session_expired', // Token expiré (code TOKEN_EXPIRED)
    FORCED_LOGOUT:  'auth:forced_logout',  // Admin a révoqué la session
  } as const;

  constructor() {
    this.bus = isClient ? new EventTarget() : null;
  }

  /**
   * Émettre un événement d'authentification
   * Appelé par l'intercepteur Axios sur réception d'un 401
   */
  emit(
    event: typeof AuthEventBus.EVENTS[keyof typeof AuthEventBus.EVENTS],
    detail?: Record<string, unknown>
  ): void {
    if (!this.bus) return; // SSR — pas d'action

    this.bus.dispatchEvent(
      new CustomEvent(event, { detail: detail ?? {} })
    );
  }

  /**
   * Écouter un événement d'authentification
   * Retourne une fonction de cleanup pour useEffect
   */
  on(
    event: typeof AuthEventBus.EVENTS[keyof typeof AuthEventBus.EVENTS],
    callback: (detail?: Record<string, unknown>) => void
  ): () => void {
    if (!this.bus) return () => {}; // SSR — noop

    const handler = (e: Event) => callback((e as CustomEvent).detail);
    this.bus.addEventListener(event, handler);

    // Retourne la fonction de cleanup (pour useEffect)
    return () => this.bus?.removeEventListener(event, handler);
  }

  /**
   * Raccourci : émettre un 401 générique
   * C'est la méthode appelée par les intercepteurs Axios
   */
  emitUnauthorized(code?: string): void {
    this.emit(AuthEventBus.EVENTS.UNAUTHORIZED, { code });
  }

  /**
   * Raccourci : écouter les 401
   */
  onUnauthorized(callback: (code?: string) => void): () => void {
    return this.on(AuthEventBus.EVENTS.UNAUTHORIZED, (detail) => {
      callback(detail?.code as string | undefined);
    });
  }
}

// Singleton partagé dans toute l'application
export const authBus = new AuthEventBus();

// Export de la classe pour les tests
export { AuthEventBus };
