import { Component, computed, inject, input, signal, WritableSignal } from '@angular/core';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MenuItemComponent } from './menu-item/menu-item.component';

import SidenavHeaderComponent from './sidenav-header/sidenav-header.component';
import { StorageService } from '@core/guards/storage.service';

import { loginInterface, menuItems as defaultMenuItems } from '@core/auth/loginInterface';
import { MenuItem } from './menu-items';

//import { AppStore } from '../../../app.store';

@Component({
  selector: 'app-custom-sidenav',
  template: `
    <app-sidenav-header [collapsed]="collapsed()" />
    <mat-nav-list class="[--mat-list-active-indicator-shape:0px] mb-6">
      @for (item of menuItems(); track item.id) {
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

  menuItems = computed(() => {
    const storedData = this._storage();
    const items = storedData?.user?.MenuItem || defaultMenuItems;
    return this.convertToMenuItems(items);
  });

  private convertToMenuItems(items: any[]): MenuItem[] {
    return items.map((item, index) => ({
      id: Number(item._id) || index,
      iconoNombre: item.iconoNombre,
      despliegaNombre: item.despliegaNombre,
      route: item.route,
      tipoPermiso: item.tipoPermiso,
      subItems: item.children ? this.convertToMenuItems(item.children) : [],
      indeterminate: signal(item.indeterminate || false),
      seleccionado: signal(item.seleccionado || false),
    }));
  }

  filtrarMenu(menu: MenuItem[], rutasPermitidas: number[]): MenuItem[] {
    return menu.filter((item) => rutasPermitidas.includes(item.id));
  }

  constructor() {}
}
