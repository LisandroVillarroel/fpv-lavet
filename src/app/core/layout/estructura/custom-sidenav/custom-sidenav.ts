import { Component, computed, inject, input } from '@angular/core';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MenuItemComponent } from './menu-item/menu-item';


import { MenuItem } from '@shared/interfaces/usuario.interface';
import { AuthTokenService } from '@core/services/auth-token.service';
import SidenavHeader from "./sidenav-header/sidenav-header";

@Component({
  selector: 'app-custom-sidenav',
  standalone: true,
  template: `
    <app-sidenav-header [collapsed]="collapsed()" />
    <mat-nav-list class="[--mat-list-active-indicator-shape:0px] mb-6">
      @for (item of menuItems(); track item._id ?? $index) {
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
    SidenavHeader,
    SidenavHeader,
  ],
})
export default class CustomSidenavComponent {
  // appStore = inject(AppStore);
  readonly #authToken = inject(AuthTokenService);
  collapsed = input<boolean>(false);

  menuItems = computed(() => {
    const storedData = this.#authToken.session();
    const items = storedData?.user?.MenuItem || [];
    return this.convertToMenuItems(items);
  });

  private convertToMenuItems(items: MenuItem[]): MenuItem[] {
    return items.map((item) => ({
      _id: item._id,
      iconoNombre: item.iconoNombre,
      despliegaNombre: item.despliegaNombre,
      route: item.route,
      tipoPermiso: item.tipoPermiso,
      children: item.children ? this.convertToMenuItems(item.children) : [],
      indeterminate: item.indeterminate || false,
      seleccionado: item.seleccionado || false,
    }));
  }

  filtrarMenu(menu: MenuItem[], rutasPermitidas: string[]): MenuItem[] {
    return menu.filter((item) => item._id && rutasPermitidas.includes(item._id));
  }

  constructor() {}
}
