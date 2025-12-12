import { Injectable, inject, signal } from '@angular/core';
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

  private readonly _token = signal<string | null>(this.restoreToken());

  readonly token = this._token.asReadonly();

  initializeFromRoute(): void {
    // Primero intenta leer el token del sessionStorage compartido
    const sharedSession = this.getSharedSession();
    if (sharedSession?.tokens?.accessToken) {
      this.persistToken(sharedSession.tokens.accessToken);
      return;
    }

    // Si no existe, intenta obtenerlo de los query params (compatibilidad)
    const maybeToken =
      this._router.routerState.snapshot.root.queryParamMap.get('token');
    if (maybeToken) {
      this.persistToken(maybeToken);
      void this._router.navigate([], {
        queryParams: { token: null },
        replaceUrl: true,
      });
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
    // Primero intenta leer de la sesión compartida
    const sharedSession = this.getSharedSession();
    if (sharedSession?.tokens?.accessToken) {
      return sharedSession.tokens.accessToken;
    }
    // Si no, lee del storage local
    return this.storage?.getItem(TOKEN_KEY) ?? null;
  }

  private getSharedSession(): AuthSession | null {
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
    return this._document.defaultView?.localStorage ?? null; // Cambiado a localStorage
  }

  getAuthorizationHeader(): string | null {
    const current = this._token();
    return current ? `Bearer ${current}` : null;
  }

  redirectToPortal(): void {
    void this._document.defaultView?.open(environment.portalUrl, '_self');
  }
}
