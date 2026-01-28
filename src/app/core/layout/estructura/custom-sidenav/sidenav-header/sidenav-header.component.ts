import { Component, computed, inject, input, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { StorageService } from '@core/guards/storage.service';
import { environment } from '@envs/environment';
import { loginInterface } from '@features/auth/interface/loginInterface';

//import { AppStore } from '../../../../app.store';

@Component({
  selector: 'app-sidenav-header',
  imports: [
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    RouterLink,
    NgOptimizedImage,
  ],
  template: `
    <div class="pt-6 flex flex-col items-center text-center">
      <div
        class="mb-3 avatar-wrapper"
        [style.width.px]="profilePicSize()"
        [style.height.px]="profilePicSize()"
      >
        <img
          class="avatar-img pr-4"
          [ngSrc]="imagenUsuario()"
          fill
          priority
          decoding="async"
          alt="Foto de usuario"
        />
      </div>
      <div class="justificar">
        <div
          class="text-center mb-2 h-[3rem] {{
            collapsed() ? 'h-0! opacity-0' : ''
          }}"
        >
          <h2>
            {{
              _storage()?.usuarioLogin?.nombres +
                ' ' +
                _storage()?.usuarioLogin?.apellidoPaterno
            }}
          </h2>
          <p>{{ _storage()?.usuarioLogin?.cargo }}</p>
        </div>
        <button
          class="padingLateral v-align-middle"
          mat-icon-button
          [matMenuTriggerFor]="menu"
        >
          <mat-icon>expand_more</mat-icon>
        </button>
        <mat-menu #menu="matMenu">
          <button mat-menu-item routerLink="/datoPersonal/datosPersonales">
            Datos Personales
          </button>
          <button mat-menu-item routerLink="/datoPersonal/cambioContrasena">
            Contraseña
          </button>
        </mat-menu>
      </div>
    </div>
  `,
  styles: `

  :host * {
    transition-property: width, height, opacity;
    transition-duration: 500ms;
    transition-timing-function: ease-in-out;
  }
  h2{
    font-size: 14px;
  }
   p{
    font-size: 12px;
  }

  .justificar{
  display: flex ;
  justify-content: center ;
  align-items: center ;
  gap: 5px ;
  flex-direction: row ;
  }

  .avatar-wrapper {
    position: relative;
    border-radius: 9999px;
    overflow: hidden;
    margin: 0 auto;
    margin-right:100px
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
  _storage = signal(this.#storage.get<loginInterface>('sesion'));
  profilePicSize = computed(() => (this.collapsed() ? 32 : 100));
  imagenUsuario = signal(
    this._storage()?.usuarioLogin.nombreFoto != ''
      ? environment.apiUrlImagenes +
          '/imagenes/fotos/' +
          this._storage()?.usuarioLogin.nombreFoto +
          '?t=' +
          this.marcaDeTiempo
      : './person-placeholder.png'
  );
}
