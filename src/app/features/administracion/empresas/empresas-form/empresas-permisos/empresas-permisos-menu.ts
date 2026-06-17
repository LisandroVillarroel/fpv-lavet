import { Component, ViewChild, effect, inject, input, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTree, MatTreeModule } from '@angular/material/tree';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';

import { NotificacioAlertnService } from '@app/shared/servicios/notificacionAlert';
import { Empresa } from '@features/administracion/empresas/empresasInterface';
import { EmpresasService } from '@features/administracion/empresas/empresas.service';
import { MenuItem } from '@shared/interfaces/usuario.interface';

@Component({
  selector: 'app-empresas-permisos-menu',
  standalone: true,
  imports: [MatTreeModule, MatCheckboxModule, MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl: './empresas-permisos-menu.html',
  styleUrls: ['./empresas-permisos-menu.scss'],
})
export default class EmpresasPermisosMenuComponent {
  readonly modo = input<'agregar' | 'editar'>('agregar');
  readonly empresa = input<Empresa | undefined>();

  readonly menuError = signal<string | null>(null);
  readonly menuItemsDisponibles = signal<MenuItem[]>([]);
  readonly selectedIds = signal<Set<string>>(new Set());
  readonly childrenAccessor = (node: MenuItem) => node.children ?? [];

  @ViewChild('tree') tree: MatTree<MenuItem> | undefined;

  private readonly dialogRef = inject(MatDialogRef<EmpresasPermisosMenuComponent>);
  private readonly empresasService = inject(EmpresasService);
  private readonly notificacion = inject(NotificacioAlertnService);
  private loadedMenuKey: string | null = null;
  private pendingMenuKey: string | null = null;
  private menuLoadSubscription: Subscription | null = null;

  constructor() {
    effect(() => {
      const empresaActual = this.empresa();
      const tipoEmpresa = empresaActual?.tipoEmpresa;
      console.log('Cargando menú para empresa:', empresaActual?._id, 'Tipoempresa:', tipoEmpresa);
      const requestKey =
        empresaActual?._id && tipoEmpresa ? `${empresaActual._id}:${tipoEmpresa}` : null;
      console.log('Request key para menú:', requestKey);

      if (!empresaActual?._id || !tipoEmpresa || !requestKey) {
        this.menuLoadSubscription?.unsubscribe();
        this.menuLoadSubscription = null;
        this.loadedMenuKey = null;
        this.pendingMenuKey = null;
        this.menuItemsDisponibles.set([]);
        this.selectedIds.set(new Set());
        this.menuError.set(null);
        return;
      }

      const menuEmpresaActual = empresaActual.MenuItem ?? [];
      console.log('Menú actual de la empresa:', menuEmpresaActual);

      if (this.loadedMenuKey === requestKey) {
        console.log('Menú ya cargado para key:', requestKey);
        this.syncSelectedMenu(this.menuItemsDisponibles(), menuEmpresaActual);
        return;
      }

      if (this.pendingMenuKey === requestKey) {
        console.log('Solicitud de menú ya en curso para key:', requestKey);
        return;
      }

      console.log('Realizando solicitud para cargar menú con key:', requestKey);
      console.log('loadedMenuKey:', this.loadedMenuKey);
      console.log('pendingMenuKey:', this.pendingMenuKey);

      this.menuLoadSubscription?.unsubscribe();
      this.pendingMenuKey = requestKey;
      this.menuError.set(null);

      console.log('Tipo de empresa para solicitud de menú:', tipoEmpresa);
      this.menuLoadSubscription = this.empresasService.obtenerMenuPorTipo(tipoEmpresa).subscribe({
        next: (menu) => {
          console.log('Menú obtenido para tipo de empresa:', menu);
          this.pendingMenuKey = null;
          this.loadedMenuKey = requestKey;
          const menuConIds = this.ensureMenuItemIds(menu);
          this.menuItemsDisponibles.set(menuConIds);
          this.syncSelectedMenu(menuConIds, menuEmpresaActual);
        },
        error: () => {
          console.log('Error al cargar menú para tipo de empresa:', tipoEmpresa);
          this.pendingMenuKey = null;
          this.loadedMenuKey = null;
          this.menuItemsDisponibles.set([]);
          this.selectedIds.set(new Set());
          this.menuError.set('No fue posible cargar el menú para el tipo de empresa seleccionado');
        },
      });
    });
  }

  isChecked(node: MenuItem): boolean {
    return this.selectedIds().has(node._id ?? '');
  }

  isIndeterminate(node: MenuItem): boolean {
    if (!node.children?.length) {
      return false;
    }

    const states = node.children.map(
      (child) => this.isChecked(child) || this.isIndeterminate(child),
    );
    const checkedCount = states.filter(Boolean).length;
    return checkedCount > 0 && checkedCount < node.children.length;
  }

  hasChild = (_: number, node: MenuItem) => !!node.children?.length;

  toggleNodeSelection(node: MenuItem, checked: boolean): void {
    const nextSelectedIds = new Set(this.selectedIds());
    this.updateNodeSelection(node, checked, nextSelectedIds);
    this.selectedIds.set(nextSelectedIds);
  }

  cancelar() {
    this.dialogRef.close();
  }

  async guardar() {
    const empresaActual = this.empresa();
    if (!empresaActual?._id) {
      return;
    }

    const menuSeleccionado = this.collectSelectedMenuItems(
      this.menuItemsDisponibles(),
      this.selectedIds(),
    );

    this.empresasService.modificarMenuEmpresa(empresaActual._id, menuSeleccionado).subscribe({
      next: async (empresaActualizada) => {
        await this.notificacion.confirmacion('Empresa', 'Menú guardado exitosamente');
        this.dialogRef.close(empresaActualizada);
      },
      error: () => {
        this.menuError.set('No fue posible guardar el menú de la empresa');
      },
    });
  }

  private ensureMenuItemIds(items: MenuItem[], parentKey: string = ''): MenuItem[] {
    return items.map((item, index) => {
      const id = item._id ?? `${parentKey}${item.despliegaNombre.replace(/\s+/g, '_')}_${index}`;
      return {
        ...item,
        _id: id,
        children: item.children?.length
          ? this.ensureMenuItemIds(item.children, `${id}-`)
          : undefined,
      };
    });
  }

  private collectSelectedIds(nodes: MenuItem[], selectedIds: Set<string>): void {
    for (const node of nodes) {
      if (node._id) {
        selectedIds.add(node._id);
      }
      if (node.children?.length) {
        this.collectSelectedIds(node.children, selectedIds);
      }
    }
  }

  private syncSelectedMenu(menuItems: MenuItem[], menuSeleccionado: MenuItem[]): void {
    const selectedIds = new Set<string>();
    this.collectSelectedIds(menuSeleccionado, selectedIds);
    const selectedMenu = this.collectSelectedMenuItems(menuItems, selectedIds);
    const normalizedSelectedIds = new Set<string>();
    this.collectSelectedIds(selectedMenu, normalizedSelectedIds);
    this.selectedIds.set(normalizedSelectedIds);
  }

  private updateNodeSelection(node: MenuItem, checked: boolean, selectedIds: Set<string>): void {
    const nodeId = node._id ?? '';
    if (checked) {
      selectedIds.add(nodeId);
    } else {
      selectedIds.delete(nodeId);
    }

    if (node.children?.length) {
      for (const child of node.children) {
        this.updateNodeSelection(child, checked, selectedIds);
      }
    }
  }

  private collectSelectedMenuItems(nodes: MenuItem[], selectedIds: Set<string>): MenuItem[] {
    const result: MenuItem[] = [];

    for (const node of nodes) {
      const selectedChildren = node.children?.length
        ? this.collectSelectedMenuItems(node.children, selectedIds)
        : undefined;
      const isSelected = selectedIds.has(node._id ?? '');

      if (isSelected || (selectedChildren?.length ?? 0) > 0) {
        result.push({
          ...node,
          children: selectedChildren,
        });
      }
    }

    return result;
  }
}
