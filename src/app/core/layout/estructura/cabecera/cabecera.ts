import { Component, effect, inject, model, signal } from '@angular/core';
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
  imports: [
    MatToolbar,
    MatIcon,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
  ],
  styleUrls: ['./cabecera.scss'],
  template: `
    <mat-toolbar
      class="mat-elevation-z3 relative z-10 [view-transition-name:header]"
    >
      <button mat-icon-button (click)="collapsed.set(!collapsed())">
        <mat-icon>menu</mat-icon>
      </button>

      <div class="container-fluid">
        <a>
          <img src="imagenes/logoFinal.png" alt="Logo" class="logo-img me-2" />
        </a>
        <div class="titulo mb-0">Sistema Informático Gestión de Proyectos</div>
        <button
          class="btn-salir"
          matTooltip="Cerrar"
          (click)="logout()"
          matButton
        >
          <mat-icon>exit_to_app</mat-icon>
        </button>
      </div>
      <!--   }-->
    </mat-toolbar>
  `,
})
export class Cabecera {
  /// appStore = inject(AppStore);
  readonly #router = inject(Router);
  readonly #storage = inject(StorageService);

  collapsed = model.required<boolean>();

  darkMode = signal(false);
  setDarkModeClass = effect(() => {
    document.documentElement.classList.toggle('dark', this.darkMode());
  });

  logout() {
    console.log('logout');
    this.#storage.remueve('sesion');
    this.#router.navigate(['/login']);
  }
}
