import { Component, computed, inject, input, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { AuthTokenService } from '@core/services/auth-token.service';

@Component({
  selector: 'app-sidenav-header',
  standalone: true,
  imports: [MatButtonModule, MatMenuModule, MatIconModule, RouterLink, NgOptimizedImage],
  template: `
    <div class="header-shell">
      <div
        class="avatar-wrapper avatar-spacing"
        [style.width.px]="profilePicSize()"
        [style.height.px]="profilePicSize()"
      >
        <img
          class="avatar-img"
          [ngSrc]="imagenUsuario()"
          fill
          priority
          decoding="async"
          alt="Foto usuariooo"
        />
      </div>
      <div class="justificar">
        <div class="user-summary" [style.height.rem]="3">
          <button
            class="user-name-button"
            matButton
            [matMenuTriggerFor]="menu"
            [style.fontSize]="
              collapsed() ? 'clamp(0.6rem, 2vw, 0.0rem)' : 'clamp(0.7rem, 2vw, 0.1rem)'
            "
          >
            {{ nombreUsuario() }}
          </button>
          <mat-menu #menu="matMenu">
            <button mat-menu-item routerLink="/datoPersonal/datosPersonales">
              Datos Personales
            </button>
            <button mat-menu-item routerLink="/datoPersonal/cambioContrasena">Contraseña</button>
          </mat-menu>

          <p
            [style.fontSize]="
              collapsed() ? 'clamp(0.6rem, 2vw, 0.0rem)' : 'clamp(0.7rem, 2vw, 0.1rem)'
            "
            [style.marginTop.rem]="collapsed() ? 0.5 : 0.1"
          >
            {{ rolUsuario() }}
          </p>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host * {
      transition-property: width, height, opacity;
      transition-duration: 500ms;
      transition-timing-function: ease-in-out;
    }

    .header-shell {
      padding-top: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    h2 {
      font-size: 14px;
    }

    p {
      font-size: 12px;
      margin-bottom: 0;
    }

    .fontNombre {
      font-size: clamp(0.7rem, 2vw, 0.1rem);
    }

    .mat-mdc-button {
      height: 0;
    }

    .justificar {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 5px;
      flex-direction: row;
    }

    .user-summary {
      text-align: center;
    }

    .user-name-button {
      margin-bottom: 0;
    }

    .avatar-spacing {
      margin-top: 0.25rem;
      margin-bottom: 0.25rem;
    }

    .avatar-wrapper {
      position: relative;
      border-radius: 9999px;
      overflow: hidden;
      margin: 0 auto;
    }

    .avatar-img {
      object-fit: cover;
      object-position: center;
    }
  `,
})
export default class SidenavHeaderComponent {
  collapsed = input(false);
  public marcaDeTiempo = Date.now();

  readonly #authToken = inject(AuthTokenService);
  readonly session = this.#authToken.session;

  profilePicSize = computed(() => (this.collapsed() ? 32 : 100));
  nombreUsuario = computed(() => {
    const user = this.session()?.user;
    const fullName = [user?.nombres, user?.apellidoPaterno].filter(Boolean).join(' ').trim();
    return fullName || user?.usuario || 'Usuario';
  });
  rolUsuario = computed(
    () => this.session()?.user?.veterinaria?.rolVeterinario || 'Rol no definido',
  );
  imagenUsuario = signal('./person-placeholder.png');
  /*imagenUsuario = signal(
    this._storage()?.usuarioLogin.nombreFoto != ''
      ? environment.apiUrlImagenes +
          '/imagenes/fotos/' +
          this._storage()?.usuarioLogin.nombreFoto +
          '?t=' +
          this.marcaDeTiempo
      : './person-placeholder.png'
  );
  */
}
