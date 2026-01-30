import { Component, computed, inject, input, signal } from '@angular/core';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MenuItemComponent } from './menu-item/menu-item.component';

import SidenavHeaderComponent from './sidenav-header/sidenav-header.component';
import { StorageService } from '@core/guards/storage.service';

import { MenuItemData } from './menu-items';
import { loginInterface } from '@core/auth/loginInterface';

//import { AppStore } from '../../../app.store';

@Component({
  selector: 'app-custom-sidenav',
  template: `
    <app-sidenav-header [collapsed]="collapsed()" />
    <mat-nav-list class="[--mat-list-active-indicator-shape:0px] mb-6">
      @for (item of menuItems(); track item.despliegaNombre) {
        <app-menu-item [item]="item" [collapsed]="collapsed()" />
      }
    </mat-nav-list>
  `,
  styles: [
    `
      :host * {
        transition-property: width, height, opacity;
        transition-duration: 500ms;
        transition-timing-function: ease-in-out;
      }
    `,
  ],
  imports: [
    MatSidenavModule,
    MatListModule,
    RouterModule,
    MatIconModule,
    MenuItemComponent,
    SidenavHeaderComponent,
  ],
})
export class CustomSidenavComponent {
  // appStore = inject(AppStore);
  readonly #storage = inject(StorageService);
  _storage = signal(this.#storage.get<loginInterface>('sesion'));
  collapsed = input<boolean>(false);

  //menuItems = this._storage()?.menuItem;
  menuItems = computed(
    () =>
      this.filtrarMenu(
        this._storage()?.menuItem || [],
        this._storage()?.menuUsuario!,
      ) || [],
  );

  filtrarMenu(menu: MenuItemData[], rutasPermitidas: number[]): MenuItemData[] {
    return menu
      .map((item) => {
        // Si el elemento tiene subItems, se mapea para filtrar sus subItems

        // Si el elemento no tiene subItems, se verifica directamente su ruta
        if (rutasPermitidas.includes(item.id)) {
          return item;
        }
        if (item.subItems) {
          const subItemsFiltrados = item.subItems.filter((subItem) =>
            rutasPermitidas.includes(subItem.id),
          );

          // Si el elemento tiene subItems permitidos, se devuelve el objeto completo
          // con los subItems filtrados.
          if (subItemsFiltrados.length > 0) {
            return { ...item, subItems: subItemsFiltrados };
          }
          // Si no hay subItems permitidos, se retorna `null` o `undefined`
          return null;
        }
        // Si no cumple ninguna condición, se retorna `null` o `undefined`
        return null;
      })
      .filter((item) => item !== null) as MenuItemData[]; // Finalmente, se eliminan los elementos nulos
  }

  constructor() {}
}
