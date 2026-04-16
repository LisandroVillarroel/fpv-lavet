import { Component, inject, model } from '@angular/core';
import { AuthTokenService } from '@core/services/auth-token.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { StorageService } from '@core/guards/storage.service';
import { ThemeService } from '@core/services/theme.service';

///import { AppStore } from '../../../app.store';

@Component({
  selector: 'app-cabecera',
  imports: [MatToolbar, MatIcon, MatButtonModule, MatMenuModule],
  styleUrls: ['./cabecera.scss'],
  template: `
    <mat-toolbar class="cabecera" color="primary">
      <button mat-icon-button (click)="collapsed.set(!collapsed())">
        <mat-icon>menu</mat-icon>
      </button>

      <div class="container-fluid">
        <mat-icon aria-hidden="true">pets</mat-icon>
        <span class="titulo mb-0">SISTEMA VETERINARIO</span>

        <div class="actions-container">
          <button mat-icon-button [matMenuTriggerFor]="themeMenu" matTooltip="Cambiar Tema">
            <mat-icon [style.color]="activeThemeAccent()">palette</mat-icon>
          </button>
          <mat-menu #themeMenu="matMenu" xPosition="before" class="theme-menu-panel">
            @for (section of themeSections; track section.label) {
              <div class="theme-section-label">{{ section.label }}</div>

              @for (theme of section.items; track theme.name) {
                <button
                  mat-menu-item
                  class="theme-menu-item"
                  [class.theme-menu-item-selected]="currentTheme() === theme.name"
                  (click)="setTheme(theme.name)"
                >
                  <span class="theme-copy">
                    <span class="theme-copy-topline">
                      <mat-icon class="theme-radio-icon">
                        {{
                          currentTheme() === theme.name
                            ? 'radio_button_checked'
                            : 'radio_button_unchecked'
                        }}
                      </mat-icon>
                      <span class="theme-label">{{ theme.label }}</span>
                    </span>
                    <span class="theme-description">{{ theme.description }}</span>
                  </span>

                  <span class="theme-preview" aria-hidden="true">
                    <span class="theme-preview-line" [style.background]="theme.previewBottom">
                      <span
                        class="theme-preview-line-accent"
                        [style.background]="theme.previewAccent"
                      ></span>
                    </span>
                  </span>
                </button>
              }
            }
          </mat-menu>

          <button class="btn-salir" matTooltip="Cerrar" (click)="logout()" matButton>
            <mat-icon>exit_to_app</mat-icon>
          </button>
        </div>
      </div>
    </mat-toolbar>
  `,
})
export class Cabecera {
  readonly #storage = inject(StorageService);
  readonly #authToken = inject(AuthTokenService);
  readonly #themeService = inject(ThemeService);
  readonly currentTheme = this.#themeService.currentTheme;
  readonly themeSections = [
    {
      label: 'Temas claros',
      items: [
        {
          name: 'rose-red-theme',
          label: 'Rose & Red',
          description: 'Claro, cálido y suave',
          previewTop: '#fffbff',
          previewSurface: '#fff8f8',
          previewBottom: '#ffd9e1',
          previewAccent: '#d81b60',
        },
        {
          name: 'azure-blue-theme',
          label: 'Azure & Blue',
          description: 'Limpio, frío y equilibrado',
          previewTop: '#fdfbff',
          previewSurface: '#f7f9ff',
          previewBottom: '#d7e3ff',
          previewAccent: '#1976d2',
        },
      ],
    },
    {
      label: 'Temas oscuros',
      items: [
        {
          name: 'magenta-violet-theme',
          label: 'Magenta & Violet',
          description: 'Oscuro, intenso y vibrante',
          previewTop: '#1e1a1d',
          previewSurface: '#151316',
          previewBottom: '#352d33',
          previewAccent: '#d100d1',
        },
        {
          name: 'cyan-orange-theme',
          label: 'Cyan & Orange',
          description: 'Oscuro, técnico y contrastado',
          previewTop: '#191c1c',
          previewSurface: '#111414',
          previewBottom: '#243131',
          previewAccent: '#00acc1',
        },
      ],
    },
  ] as const;

  collapsed = model.required<boolean>();

  activeThemeAccent() {
    for (const section of this.themeSections) {
      const theme = section.items.find((item) => item.name === this.currentTheme());
      if (theme) {
        return theme.previewAccent;
      }
    }

    return 'var(--mat-sys-primary)';
  }

  setTheme(theme: string) {
    this.#themeService.setTheme(theme);
  }

  logout() {
    this.#storage.remueve('sesion-lavet');
    localStorage.removeItem('fpv-lavet/token');
    this.#authToken.redirectToPortal();
  }
}
