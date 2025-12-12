import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';

import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'fpv-lavet/token';
const SESSION_KEY = 'fpi-lavet/session'; // Llave compartida del login

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
    const sharedSession = this.getSharedSession();
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

  clear(): void {
    this._token.set(null);
    this.storage?.removeItem(TOKEN_KEY);
  }

  private persistToken(token: string): void {
    this._token.set(token);
    this.storage?.setItem(TOKEN_KEY, token);
  }

  private restoreToken(): string | null {
    if (!this._isBrowser) {
      return null;
    }

    // Primero intenta leer de la sesión compartida
    const sharedSession = this.getSharedSession();
    if (sharedSession?.tokens?.accessToken) {
      // Guarda en localStorage para uso futuro
      this.storage?.setItem(TOKEN_KEY, sharedSession.tokens.accessToken);
      return sharedSession.tokens.accessToken;
    }

    // Intenta leer del storage local
    const storedToken = this.storage?.getItem(TOKEN_KEY);
    if (storedToken) {
      return storedToken;
    }

    // Como último recurso, intenta leer de los query params (para primera carga)
    if (this._isBrowser && this._document.defaultView?.location) {
      const urlParams = new URLSearchParams(
        this._document.defaultView.location.search
      );
      const tokenFromUrl = urlParams.get('token');
      if (tokenFromUrl) {
        // Guarda en localStorage para uso futuro
        this.storage?.setItem(TOKEN_KEY, tokenFromUrl);
        return tokenFromUrl;
      }
    }

    return null;
  }

  private getSharedSession(): AuthSession | null {
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
