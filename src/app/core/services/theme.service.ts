import { inject, Injectable, signal } from '@angular/core';
import { StorageService } from '@core/guards/storage.service';
import { loginInterface } from '@core/auth/loginInterface';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  readonly #storage = inject(StorageService);
  private readonly sessionKey = 'sesion-lavet';
  private readonly themes = [
    'rose-red-theme',
    'azure-blue-theme',
    'magenta-violet-theme',
    'cyan-orange-theme',
  ];
  currentTheme = signal<string>(this.getTheme());

  constructor() {
    this.removeLegacyThemeKeys();
    this.initTheme();
  }

  private getTheme(): string {
    const sessionTheme = this.#storage.get<loginInterface>(this.sessionKey)?.user?.temaColorSistema;
    if (sessionTheme && this.themes.includes(sessionTheme)) {
      return sessionTheme;
    }

    return 'azure-blue-theme';
  }

  setTheme(theme: string) {
    this.updateStoredSessionTheme(theme);
    this.currentTheme.set(theme);
    this.updateBodyClass(theme);
  }

  syncThemeFromSession(theme: string | null | undefined) {
    if (!theme || !this.themes.includes(theme)) {
      return;
    }

    this.setTheme(theme);
  }

  private updateBodyClass(theme: string) {
    const body = document.body;
    body.classList.remove(...this.themes);
    body.classList.add(theme);
  }

  private initTheme() {
    this.updateBodyClass(this.currentTheme());
  }

  private removeLegacyThemeKeys() {
    localStorage.removeItem('app-theme');
    localStorage.removeItem('tema-color-sistema');
  }

  private updateStoredSessionTheme(theme: string) {
    const session = this.#storage.get<loginInterface>(this.sessionKey);
    if (!session) {
      return;
    }

    this.#storage.set(this.sessionKey, {
      ...session,
      user: {
        ...(session.user ?? {}),
        temaColorSistema: theme,
      },
    });
  }
}
