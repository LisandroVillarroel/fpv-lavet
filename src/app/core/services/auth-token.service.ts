import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';

import { environment } from '../../../environments/environment';

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

  private readonly _token = signal<string | null>(this.restoreToken());
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
    this._token.set(null);
    this.storage?.removeItem(SESSION_KEY);
  }

  /**
   * Persiste el token y el usuario autenticado en localStorage de forma segura.
   * @param token Token de acceso JWT
   * @param user  Usuario autenticado (sin datos sensibles)
   */
  persistToken(token: string, user?: any): void {
    this._token.set(token);
    // Solo guarda datos públicos del usuario
    console.log('Persistiendo token en storage con usuario:', user);
    const safeUser = user ? this.sanitizeUser(user) : null;
    console.log('Usuario sanitizado para storage:', safeUser);
    const session = { user: safeUser, tokens: { accessToken: token } };
    console.log('Sesión a guardar en storage:', session);
    this.storage?.setItem(SESSION_KEY, JSON.stringify(session));
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

  private restoreToken(): string | null {
    if (!this._isBrowser) {
      return null;
    }

    // Lee el token de la sesión compartida
    const sharedSession = this.getStorage();
    if (sharedSession?.tokens?.accessToken) {
      return sharedSession.tokens.accessToken;
    }

    // Como último recurso, intenta leer de los query params (para primera carga)
    if (this._isBrowser && this._document.defaultView?.location) {
      const urlParams = new URLSearchParams(this._document.defaultView.location.search);
      const tokenFromUrl = urlParams.get('token');
      if (tokenFromUrl) {
        // Crea una sesión nueva solo con el token
        const session = { user: null, tokens: { accessToken: tokenFromUrl } };
        this.storage?.setItem(SESSION_KEY, JSON.stringify(session));
        return tokenFromUrl;
      }
    }

    return null;
  }

  getStorage(): AuthSession | null {
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

  getAuthorizationHeader(): string | null {
    const current = this._token();
    return current ? `Bearer ${current}` : null;
  }

  redirectToPortal(): void {
    void this._document.defaultView?.open(environment.portalUrl, '_self');
  }
}
