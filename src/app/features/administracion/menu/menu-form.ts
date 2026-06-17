import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import { loginInterface } from '@core/auth/loginInterface';
import { StorageService } from '@core/guards/storage.service';
import TituloComponentePopup from '@shared/ui/tituloComponentePopup';
import { MenuItem } from '@shared/interfaces/usuario.interface';
import { IMenu, MenuEstado, MenuNombre } from './menu.interface';
import { MenuService } from './menu.service';

type EditableMenuItemField = 'despliegaNombre' | 'iconoNombre' | 'route' | 'tipoPermiso';

@Component({
  selector: 'app-menu-form',
  standalone: true,
  templateUrl: './menu-form.html',
  styleUrls: ['./menu-form.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatIconModule,
    MatCardModule,
    TituloComponentePopup,
  ],
})
export class MenuFormComponent {
  readonly data = input<Partial<IMenu>>();
  private readonly dialogData = inject(MAT_DIALOG_DATA, {
    optional: true,
  }) as Partial<IMenu> | null;
  private readonly dialogRef = inject(MatDialogRef<MenuFormComponent>);
  private readonly menuService = inject(MenuService);
  private readonly storage = inject(StorageService);

  readonly nombresMenu: MenuNombre[] = [
    'Laboratorio',
    'Veterinaria',
    'Propietario',
    'Administración',
  ];
  readonly estadosMenu: MenuEstado[] = ['Activo', 'Inactivo'];
  readonly guardando = signal(false);
  readonly menuModel = signal<IMenu>(this.buildMenuModel());
  readonly expandedNodes = signal<Record<string, boolean>>({});
  private draftIdCounter = 0;

  readonly menuForm = form(this.menuModel, (schema) => {
    required(schema.nombreMenu, { message: 'Nombre del menú es requerido' });
    required(schema.estado, { message: 'Estado es requerido' });
  });

  readonly hasInvalidItems = computed(() => this.hasInvalidMenuItems(this.menuModel().menuItem));
  readonly isFormInvalid = computed(() => !this.menuForm().valid() || this.hasInvalidItems());
  readonly titulo = computed(() => (this.menuModel()._id ? 'Editar Menú' : 'Agregar Menú'));

  constructor() {
    effect(() => {
      this.menuModel.set(this.buildMenuModel(this.data() ?? this.dialogData ?? undefined));
    });
  }

  agregarItemRaiz(): void {
    this.updateMenuItems((items) => {
      items.push(this.createEmptyMenuItem());
    });
  }

  agregarHijo(path: number[]): void {
    this.updateMenuItems((items) => {
      const node = this.getItemByPath(items, path);
      if (!node) {
        return;
      }

      node.children = [...(node.children ?? []), this.createEmptyMenuItem()];
    });
  }

  eliminarItem(path: number[]): void {
    this.updateMenuItems((items) => {
      if (path.length === 1) {
        items.splice(path[0], 1);
        return;
      }

      const parent = this.getItemByPath(items, path.slice(0, -1));
      if (!parent?.children) {
        return;
      }

      parent.children.splice(path[path.length - 1], 1);
      parent.children = [...parent.children];
    });
  }

  actualizarCampo(path: number[], field: EditableMenuItemField, value: string): void {
    this.updateMenuItems((items) => {
      const node = this.getItemByPath(items, path);
      if (!node) {
        return;
      }

      node[field] = value;
    });
  }

  childPath(path: number[], index: number): number[] {
    return [...path, index];
  }

  rootPath(index: number): number[] {
    return [index];
  }

  trackMenuNode(index: number, item: MenuItem): string {
    return item._id ?? `draft-${index}`;
  }

  nodeKey(path: number[]): string {
    return path.join('-');
  }

  hasChildren(node: MenuItem): boolean {
    return !!node.children?.length;
  }

  isExpanded(path: number[]): boolean {
    const key = this.nodeKey(path);
    return this.expandedNodes()[key] ?? true;
  }

  toggleExpanded(path: number[]): void {
    const key = this.nodeKey(path);
    this.expandedNodes.update((state) => ({
      ...state,
      [key]: !(state[key] ?? true),
    }));
  }

  guardar(): void {
    if (this.isFormInvalid() || this.guardando()) {
      return;
    }

    const currentMenu = this.menuModel();
    const usuarioId = this.getUsuarioId();
    const payload: Partial<IMenu> = {
      nombreMenu: currentMenu.nombreMenu,
      estado: currentMenu.estado,
      menuItem: this.sanitizeMenuItems(currentMenu.menuItem),
      ...(currentMenu._id
        ? { usuarioModifica_id: usuarioId }
        : { usuarioCrea_id: currentMenu.usuarioCrea_id ?? usuarioId }),
    };

    this.guardando.set(true);

    const request$ = currentMenu._id
      ? this.menuService.actualizarMenu(currentMenu._id, payload)
      : this.menuService.crearMenu(payload);

    request$.subscribe({
      next: (menu) => {
        this.guardando.set(false);
        this.dialogRef.close(menu);
      },
      error: () => {
        this.guardando.set(false);
      },
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  private buildMenuModel(data?: Partial<IMenu>): IMenu {
    return {
      _id: data?._id,
      nombreMenu: data?.nombreMenu ?? 'Laboratorio',
      menuItem: this.cloneMenuItems(data?.menuItem ?? []),
      estado: data?.estado ?? 'Activo',
      usuarioCrea_id: data?.usuarioCrea_id ?? this.getUsuarioId(),
      usuarioModifica_id: data?.usuarioModifica_id,
      fechaHora_crea: data?.fechaHora_crea,
      fechaHora_modifica: data?.fechaHora_modifica,
    };
  }

  private getUsuarioId(): string {
    const sesion = this.storage.get<loginInterface>('sesion-lavet');
    return sesion?.user?._id || '';
  }

  private createEmptyMenuItem(): MenuItem {
    return {
      _id: this.createDraftId(),
      despliegaNombre: '',
      iconoNombre: '',
      route: '',
      tipoPermiso: '',
      children: [],
    };
  }

  private updateMenuItems(mutator: (items: MenuItem[]) => void): void {
    const nextItems = this.cloneMenuItems(this.menuModel().menuItem);
    mutator(nextItems);
    this.menuModel.update((menu) => ({ ...menu, menuItem: nextItems }));
  }

  private cloneMenuItems(items: MenuItem[]): MenuItem[] {
    return items.map((item) => ({
      ...item,
      children: item.children?.length ? this.cloneMenuItems(item.children) : [],
    }));
  }

  private getItemByPath(items: MenuItem[], path: number[]): MenuItem | undefined {
    let currentItems = items;
    let currentItem: MenuItem | undefined;

    for (const index of path) {
      currentItem = currentItems[index];
      if (!currentItem) {
        return undefined;
      }

      currentItems = currentItem.children ?? [];
    }

    return currentItem;
  }

  private hasInvalidMenuItems(items: MenuItem[]): boolean {
    return items.some((item) => {
      const nombreInvalido = !item.despliegaNombre?.trim();
      const iconoInvalido = !item.iconoNombre?.trim();
      return nombreInvalido || iconoInvalido || this.hasInvalidMenuItems(item.children ?? []);
    });
  }

  private sanitizeMenuItems(items: MenuItem[]): MenuItem[] {
    return items.map((item) => {
      const children = this.sanitizeMenuItems(item.children ?? []);
      const route = item.route?.trim();
      const tipoPermiso = item.tipoPermiso?.trim();
      const itemId = item._id?.startsWith('draft-menu-item-') ? undefined : item._id;

      return {
        ...(itemId ? { _id: itemId } : {}),
        despliegaNombre: item.despliegaNombre.trim(),
        iconoNombre: item.iconoNombre.trim(),
        ...(route ? { route } : {}),
        ...(tipoPermiso ? { tipoPermiso } : {}),
        ...(children.length ? { children } : {}),
      };
    });
  }

  private createDraftId(): string {
    this.draftIdCounter += 1;
    return `draft-menu-item-${this.draftIdCounter}`;
  }
}
