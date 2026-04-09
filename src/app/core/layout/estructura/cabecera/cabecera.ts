import { Component, effect, inject, model, signal } from '@angular/core';
import { AuthTokenService } from '@core/services/auth-token.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { StorageService } from '@core/guards/storage.service';

///import { AppStore } from '../../../app.store';

@Component({
  selector: 'app-cabecera',
  imports: [MatToolbar, MatIcon, MatButtonModule, MatMenuModule, MatDividerModule],
  styleUrls: ['./cabecera.scss'],
  template: `
    <mat-toolbar class="cabecera" color="primary">
      <button mat-icon-button (click)="collapsed.set(!collapsed())">
        <mat-icon>menu</mat-icon>
      </button>

      <div class="container-fluid">
        <mat-icon aria-hidden="true">pets</mat-icon>
        <span class="titulo mb-0">SISTEMA VETERINARIO</span>

        <button class="btn-salir" matTooltip="Cerrar" (click)="logout()" matButton>
          <mat-icon>exit_to_app</mat-icon>
        </button>
      </div>
      <!--   }-->
    </mat-toolbar>
  `,
})
export class Cabecera {
  /// appStore = inject(AppStore);
  readonly #storage = inject(StorageService);
  readonly #authToken = inject(AuthTokenService);

  collapsed = model.required<boolean>();

  darkMode = signal(false);
  setDarkModeClass = effect(() => {
    document.documentElement.classList.toggle('dark', this.darkMode());
  });

  logout() {
    // Limpia todas las sesiones relevantes
    this.#storage.remueve('sesion-lavet');
    localStorage.removeItem('fpv-lavet/token');
    // Redirige al login de fpi-lavet
    this.#authToken.redirectToPortal();
  }
}
