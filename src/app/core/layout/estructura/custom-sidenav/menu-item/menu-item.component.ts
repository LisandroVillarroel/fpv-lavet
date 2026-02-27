import { Component, computed, input, signal } from '@angular/core';
import { RouterLinkActive, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { trigger, transition, style, animate } from '@angular/animations';
import { MenuItem } from '../menu-items';

@Component({
  selector: 'app-menu-item',
  imports: [RouterModule, RouterLinkActive, MatListModule, MatIconModule],
  template: `
    <a
      mat-list-item
      [style.--mat-list-list-item-leading-icon-start-space]="indentation()"
      [routerLink]="routeHistory() + '/' + item().route"
      (click)="nestedItemOpen.set(!nestedItemOpen())"
      routerLinkActive
      #rla="routerLinkActive"
      [activated]="rla.isActive"
    >
      <img
        [src]="'/imagenes/iconosMenu/' + item().iconoNombre + '.png'"
        [alt]="item().despliegaNombre"
        class="w-6 h-6 object-contain"
        [class.opacity-100]="rla.isActive"
        [class.opacity-60]="!rla.isActive"
        [style.filter]="rla.isActive ? 'brightness(1.2)' : 'brightness(1)'"
        matListItemIcon
      />

      @if (!collapsed()) {
        <span matListItemTitle>{{ item().despliegaNombre }}</span>
      }
      @if (item().children?.length !== 0 && item().children != undefined) {
        <span matListItemMeta>
          @if (nestedItemOpen()) {
            <mat-icon>expand_less</mat-icon>
          } @else {
            <mat-icon>expand_more</mat-icon>
          }
        </span>
      }
    </a>
    @if (nestedItemOpen()) {
      <div @expandContractMenu>
        @for (subItem of item().children; track subItem.route) {
          <app-menu-item
            [item]="subItem"
            [routeHistory]="routeHistory() + '/' + item().route"
            [collapsed]="collapsed()"
          />
        }
      </div>
    }
  `,
  styles: `
    :host * {
      transition-property: margin-inline-start, opacity, height, filter;
      transition-duration: 500ms;
      transition-timing-function: ease-in-out;
    }

    img[matListItemIcon] {
      opacity: 0.6;
    }

    a[routerLinkActive] img[matListItemIcon] {
      opacity: 1;
      filter: brightness(1.3);
    }
  `,
  animations: [
    trigger('expandContractMenu', [
      transition(':enter', [
        style({ opacity: 0, height: '0px' }),
        animate('500ms ease-in-out', style({ opacity: 1, height: '*' })),
      ]),
      transition(':leave', [animate('500ms ease-in-out', style({ opacity: 0, height: '0px' }))]),
    ]),
  ],
})
export class MenuItemComponent {
  item = input.required<MenuItem>();
  collapsed = input.required<boolean>();
  routeHistory = input('');

  level = computed(() => this.routeHistory().split('/').length - 1);
  indentation = computed(() => (this.collapsed() ? '16px' : `${16 + this.level() * 16}px`));

  nestedItemOpen = signal(false);
}
