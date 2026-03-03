/**
 * lib/auth-event-bus.ts
 *
 * Bus d'  v  nements simple pour g  rer la d  connexion synchronis  e.
 * Permet au client Axios de signaler une session expir  e (401)
 * au AuthProvider sans couplage direct.
 */

type AuthEvent = 'logout' | 'session-expired';

class AuthEventBus extends EventTarget {
  /** Signale une d  connexion (manuelle ou forc  e) */
  emit(event: AuthEvent) {
    this.dispatchEvent(new Event(event));
    console.warn(`[AuthEventBus] Event emitted: ${event}`);
  }

  /** S'abonne    un   v  nement */
  on(event: AuthEvent, callback: () => void) {
    this.addEventListener(event, callback);
    return () => this.removeEventListener(event, callback);
  }
}

export const authEventBus = new AuthEventBus();
