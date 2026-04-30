import { Component, computed, input, signal } from '@angular/core';
import { RouterLinkActive, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { trigger, transition, style, animate } from '@angular/animations';
import { MenuItem } from '@shared/interfaces/usuario.interface';

@Component({
  selector: 'app-menu-item',
  standalone: true,
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
      [class.menu-item-active]="rla.isActive"
    >
      <mat-icon matListItemIcon class="menu-icon">{{ iconName() }}</mat-icon>

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

    a[mat-list-item] {
      color: var(--mat-sys-on-surface);
      border-radius: 18px;
      margin: 4px 0;
    }

    .menu-icon {
      color: var(--mat-sys-primary);
      opacity: 0.92;
    }

    a[mat-list-item]:hover {
      background: var(--mat-sys-surface-container);
    }

    a[mat-list-item].menu-item-active {
      background: var(--mat-sys-secondary-container);
      color: var(--mat-sys-on-secondary-container);
    }

    a[mat-list-item].menu-item-active .menu-icon {
      color: var(--mat-sys-on-secondary-container);
      opacity: 1;
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
  iconName = computed(() => {
    const iconName = this.item().iconoNombre?.trim();
    if (!iconName) {
      return 'radio_button_checked';
    }

    return iconName;
  });

  nestedItemOpen = signal(false);
}
