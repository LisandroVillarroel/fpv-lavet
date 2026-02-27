import { Component, computed, inject, input, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { StorageService } from '@core/guards/storage.service';
import { loginInterface } from '@core/auth/loginInterface';

@Component({
  selector: 'app-sidenav-header',
  imports: [MatButtonModule, MatMenuModule, MatIconModule, RouterLink, NgOptimizedImage],
  template: `
    <div class="pt-6 flex flex-col items-center text-center">
      <div
        class="mb-1 mt-1 avatar-wrapper"
        [style.width.px]="profilePicSize()"
        [style.height.px]="profilePicSize()"
      >
        <img
          class="avatar-img pr-4"
          [ngSrc]="imagenUsuario()"
          fill
          priority
          decoding="async"
          alt="Foto usuariooo"
        />
      </div>
      <div class="justificar">
        <div class="text-center h-[3rem] {{ collapsed() ? 32 : 100 }}">
          <button
            class=" mb-0"
            matButton
            [matMenuTriggerFor]="menu"
            [style.fontSize]="
              collapsed() ? 'clamp(0.6rem, 2vw, 0.0rem)' : 'clamp(0.7rem, 2vw, 0.1rem)'
            "
          >
            {{ _storage()?.user?.nombres + ' ' + _storage()?.user?.apellidoPaterno }}
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
            {{ _storage()?.user?.veterinaria?.rolVeterinario + 'Veterinario' }}
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

  //appStore = inject(AppStore);
  readonly #storage = inject(StorageService);
  _storage = signal(this.#storage.get<loginInterface>('fpi-lavet/session'));
  profilePicSize = computed(() => (this.collapsed() ? 32 : 100));
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
