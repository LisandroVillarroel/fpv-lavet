import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly themeKey = 'app-theme';
  private readonly themes = [
    'rose-red-theme',
    'azure-blue-theme',
    'magenta-violet-theme',
    'cyan-orange-theme',
  ];
  currentTheme = signal<string>(this.getTheme());

  constructor() {
    this.initTheme();
  }

  private getTheme(): string {
    const savedTheme = localStorage.getItem(this.themeKey);
    return savedTheme && this.themes.includes(savedTheme) ? savedTheme : 'azure-blue-theme';
  }

  setTheme(theme: string) {
    localStorage.setItem(this.themeKey, theme);
    this.currentTheme.set(theme);
    this.updateBodyClass(theme);
  }

  private updateBodyClass(theme: string) {
    const body = document.body;
    body.classList.remove(...this.themes);
    body.classList.add(theme);
  }

  private initTheme() {
    this.updateBodyClass(this.currentTheme());
  }
}
