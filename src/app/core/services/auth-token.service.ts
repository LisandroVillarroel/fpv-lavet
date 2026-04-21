import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';

import { environment } from '@envs/environment';

const SESSION_KEY = 'sesion-lavet'; // Llave única y compartida para la sesión

interface AuthSession {
  user: any;
  tokens: {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthTokenService {
  private readonly _router = inject(Router);
  private readonly _document = inject(DOCUMENT);
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _isBrowser = isPlatformBrowser(this._platformId);
  private _isRedirecting = false;

  private readonly _session = signal<AuthSession | null>(this.restoreSession());
  readonly session = this._session.asReadonly();
  private readonly _token = signal<string | null>(this._session()?.tokens.accessToken ?? null);
  readonly token = this._token.asReadonly();

  initializeFromRoute(): void {
    if (!this._isBrowser) {
      return;
    }

    // Ya se inicializó el token en restoreToken() desde la URL
    // Solo necesitamos persistir si viene del sessionStorage compartido
    const sharedSession = this.getStorage();
    if (sharedSession?.tokens?.accessToken && !this._token()) {
      this.persistToken(sharedSession.tokens.accessToken);
    }

    // Limpia el token del URL después de que la navegación inicial complete
    if (this._document.defaultView?.location.search.includes('token=')) {
      setTimeout(() => {
        void this._router.navigate([], {
          queryParams: { token: null },
          replaceUrl: true,
        });
      }, 100);
    }
  }

  /**
   * Elimina completamente la sesión del storage (logout seguro)
   */
  clear(): void {
    this._session.set(null);
    this._token.set(null);
    this.storage?.removeItem(SESSION_KEY);
    this._isRedirecting = false;
  }

  /**
   * Persiste el token y el usuario autenticado en localStorage de forma segura.
   * @param token Token de acceso JWT
   * @param user  Usuario autenticado (sin datos sensibles)
   */
  persistToken(token: string, user?: any): void {
    // Solo guarda datos públicos del usuario
    console.log('Persistiendo token en storage con usuario:', user);
    const safeUser = user ? this.sanitizeUser(user) : null;
    console.log('Usuario sanitizado para storage:', safeUser);
    const currentSession = this._session();
    const session: AuthSession = {
      user: safeUser,
      tokens: {
        accessToken: token,
        refreshToken: currentSession?.tokens.refreshToken,
        expiresIn: currentSession?.tokens.expiresIn,
      },
    };
    console.log('Sesión a guardar en storage:', session);
    this.persistSession(session);
    console.log('Sesión guardada en storage:', this.getStorage());
  }

  /**
   * Elimina campos sensibles del usuario antes de guardar en storage
   */
  private sanitizeUser(user: any): any {
    if (!user) return null;
    // Copia solo los campos públicos necesarios
    const {
      _id,
      usuario,
      temaColorSistema,
      rutUsuario,
      nombres,
      apellidoPaterno,
      apellidoMaterno,
      telefono,
      email,
      direccion,
      usuarioEntidad,
      tipoUsuario,
      veterinaria,
      empresa,
      MenuItem,
      estadoUsuario,
      estado,
    } = user;
    return {
      _id,
      usuario,
      temaColorSistema,
      rutUsuario,
      nombres,
      apellidoPaterno,
      apellidoMaterno,
      telefono,
      email,
      direccion,
      usuarioEntidad,
      tipoUsuario,
      veterinaria,
      empresa,
      MenuItem,
      estadoUsuario,
      estado,
    };
  }

  updateStoredUser(patch: Record<string, unknown>): void {
    const session = this._session();
    if (!session?.user) {
      return;
    }

    const updatedSession: AuthSession = {
      ...session,
      user: {
        ...session.user,
        ...patch,
      },
    };

    this.persistSession(updatedSession);
  }

  private restoreSession(): AuthSession | null {
    if (!this._isBrowser) {
      return null;
    }

    // Lee el token de la sesión compartida
    const sharedSession = this.readStorage();
    if (sharedSession?.tokens?.accessToken) {
      return sharedSession;
    }

    // Como último recurso, intenta leer de los query params (para primera carga)
    if (this._isBrowser && this._document.defaultView?.location) {
      const urlParams = new URLSearchParams(this._document.defaultView.location.search);
      const tokenFromUrl = urlParams.get('token');
      if (tokenFromUrl) {
        // Crea una sesión nueva solo con el token
        const session: AuthSession = { user: null, tokens: { accessToken: tokenFromUrl } };
        this.storage?.setItem(SESSION_KEY, JSON.stringify(session));
        return session;
      }
    }

    return null;
  }

  getStorage(): AuthSession | null {
    return this._session();
  }

  private readStorage(): AuthSession | null {
    if (!this._isBrowser) {
      return null;
    }
    const sessionData = this.storage?.getItem(SESSION_KEY);
    if (!sessionData) {
      return null;
    }
    try {
      return JSON.parse(sessionData) as AuthSession;
    } catch {
      return null;
    }
  }

  private get storage(): Storage | null {
    if (!this._isBrowser) {
      return null;
    }
    return this._document.defaultView?.localStorage ?? null;
  }

  private persistSession(session: AuthSession): void {
    this._session.set(session);
    this._token.set(session.tokens.accessToken);
    this.storage?.setItem(SESSION_KEY, JSON.stringify(session));
  }

  getAuthorizationHeader(): string | null {
    const current = this._token();
    return current ? `Bearer ${current}` : null;
  }

  isTokenExpired(token = this._token()): boolean {
    if (!token) {
      return true;
    }

    const payload = this.decodeJwtPayload(token);
    const exp = payload?.['exp'];

    if (typeof exp !== 'number') {
      return true;
    }

    return exp * 1000 <= Date.now();
  }

  beginExpiredSessionRedirect(): boolean {
    if (this._isRedirecting) {
      return false;
    }

    this._isRedirecting = true;
    return true;
  }

  completeExpiredSessionRedirect(): void {
    this._session.set(null);
    this._token.set(null);
    this.storage?.removeItem(SESSION_KEY);
    this.redirectToPortal();
  }

  handleExpiredSession(redirectDelayMs = 0): void {
    if (!this.beginExpiredSessionRedirect()) {
      return;
    }

    if (redirectDelayMs > 0) {
      this._document.defaultView?.setTimeout(() => {
        this.completeExpiredSessionRedirect();
      }, redirectDelayMs);
      return;
    }

    this.completeExpiredSessionRedirect();
  }

  private decodeJwtPayload(token: string): Record<string, unknown> | null {
    if (!this._isBrowser) {
      return null;
    }

    const [, payload] = token.split('.');
    if (!payload) {
      return null;
    }

    try {
      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const paddedPayload = normalizedPayload.padEnd(
        normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
        '=',
      );
      const decodedPayload = this._document.defaultView?.atob(paddedPayload);
      return decodedPayload ? (JSON.parse(decodedPayload) as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }

  redirectToPortal(): void {
    void this._document.defaultView?.open(environment.portalUrl, '_self');
  }
}
