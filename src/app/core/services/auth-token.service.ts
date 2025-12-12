import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';

import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'fpv-lavet/token';

@Injectable({ providedIn: 'root' })
export class AuthTokenService {
  private readonly _router = inject(Router);
  private readonly _document = inject(DOCUMENT);

  private readonly _token = signal<string | null>(this.restoreToken());

  readonly token = this._token.asReadonly();

  initializeFromRoute(): void {
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
    return this.storage?.getItem(TOKEN_KEY) ?? null;
  }

  private get storage(): Storage | null {
    return this._document.defaultView?.sessionStorage ?? null;
  }

  getAuthorizationHeader(): string | null {
    const current = this._token();
    return current ? `Bearer ${current}` : null;
  }

  redirectToPortal(): void {
    void this._document.defaultView?.open(environment.portalUrl, '_self');
  }
}
