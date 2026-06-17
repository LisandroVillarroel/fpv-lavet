import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTree, MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { Subscription } from 'rxjs';

import { EmpresasService } from '@features/administracion/empresas/empresas.service';
import { UsuarioService } from '@features/mantenedores/usuarios/usuarios.service';
import { IUsuario } from '@features/mantenedores/usuarios/usuariosInterface';
import { MenuItem } from '@shared/interfaces/usuario.interface';

type EmpresaSeleccionable = {
  empresaId: string;
  rutEmpresa: string;
  razonSocial: string;
  nombreFantasia: string;
  tipoEmpresa?: 'Laboratorio' | 'Veterinaria' | 'Administración';
  MenuItem?: MenuItem[];
};

@Component({
  selector: 'app-usuarios-permisos-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTreeModule, MatCheckboxModule, MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl:
    '../../../../mantenedores/usuarios/usuarios-form/usuarios-permisos/usuarios-permisos-menu.html',
  styleUrls: [
    '../../../../mantenedores/usuarios/usuarios-form/usuarios-permisos/usuarios-permisos-menu.scss',
  ],
})
export class UsuariosPermisosMenuComponent {
  selectedIds = new Set<string>();
  private loadedEmpresaId: string | null = null;
  private pendingEmpresaId: string | null = null;
  private empresaSubscription: Subscription | null = null;

  data = input<{
    modo: 'agregar' | 'editar';
    usuario?: IUsuario;
    empresaId?: string;
    usuarioLogueado?: { _id?: string };
    empresa?: EmpresaSeleccionable;
  }>();

  private readonly dialogRef = inject(MatDialogRef<UsuariosPermisosMenuComponent>);
  private readonly empresasService = inject(EmpresasService);
  private readonly usuarioService = inject(UsuarioService);

  treeControl = new NestedTreeControl<MenuItem>((node) => node.children);
  dataSource = new MatTreeNestedDataSource<MenuItem>();
  expandedNodes = signal<Record<string, boolean>>({});

  @ViewChild('tree') tree: MatTree<MenuItem> | undefined;

  childrenAccessor = (node: MenuItem) => node.children ?? [];

  constructor() {
    effect(() => {
      const data = this.data();
      const empresaId =
        data?.empresaId || data?.usuario?.empresa?.empresaId || data?.empresa?.empresaId;
      const usuarioMenu = data?.usuario?.MenuItem || [];

      if (!empresaId) {
        this.empresaSubscription?.unsubscribe();
        this.empresaSubscription = null;
        this.loadedEmpresaId = null;
        this.pendingEmpresaId = null;
        this.dataSource.data = [];
        this.treeControl.dataNodes = [];
        this.selectedIds.clear();
        return;
      }

      if (this.loadedEmpresaId === empresaId) {
        this.selectedIds.clear();
        this.collectSelectedIds(usuarioMenu);
        return;
      }

      if (this.pendingEmpresaId === empresaId) {
        return;
      }

      this.empresaSubscription?.unsubscribe();
      this.pendingEmpresaId = empresaId;

      this.empresaSubscription = this.empresasService.obtenerEmpresaPorId(empresaId).subscribe({
        next: (empresa) => {
          this.pendingEmpresaId = null;
          this.loadedEmpresaId = empresaId;
          const menuItems = this.ensureMenuItemIds(empresa?.MenuItem ?? []);
          this.dataSource.data = this.buildMenuTree(menuItems);
          this.treeControl.dataNodes = this.dataSource.data;
          this.selectedIds.clear();
          this.collectSelectedIds(usuarioMenu);

          queueMicrotask(() => {
            if (this.tree) {
              this.tree.expandAll();
            }
          });
        },
        error: () => {
          this.pendingEmpresaId = null;
          this.loadedEmpresaId = null;
          this.dataSource.data = [];
          this.treeControl.dataNodes = [];
          this.selectedIds.clear();
        },
      });
    });
  }

  ngAfterViewInit() {
    if (this.tree) {
      this.tree.expandAll();
    }
  }

  isChecked(node: MenuItem): boolean {
    return this.selectedIds.has(node._id ?? '');
  }

  isIndeterminate(node: MenuItem): boolean {
    if (!node.children || node.children.length === 0) {
      return false;
    }
    const checkedChildren = node.children.filter(
      (child) => this.isChecked(child) || this.isIndeterminate(child),
    );
    return checkedChildren.length > 0 && checkedChildren.length < node.children.length;
  }

  toggleNodeSelection(node: MenuItem, checked: boolean): void {
    const id = node._id ?? '';
    if (checked) {
      this.selectedIds.add(id);
      if (node.children) {
        node.children.forEach((child) => this.toggleNodeSelection(child, true));
      }
    } else {
      this.selectedIds.delete(id);
      if (node.children) {
        node.children.forEach((child) => this.toggleNodeSelection(child, false));
      }
    }
  }

  private collectSelectedIds(nodes: MenuItem[]) {
    for (const node of nodes) {
      if (node._id) {
        this.selectedIds.add(node._id);
      }
      if (node.children) {
        this.collectSelectedIds(node.children);
      }
    }
  }

  private ensureMenuItemIds(items: MenuItem[], parentKey: string = ''): MenuItem[] {
    return items.map((item, idx) => {
      let id = item._id;
      if (!id) {
        id = `${parentKey}${item.despliegaNombre.replace(/\s+/g, '_')}_${idx}`;
      }
      const children = item.children ? this.ensureMenuItemIds(item.children, `${id}-`) : undefined;
      return { ...item, _id: id, children };
    });
  }

  private buildMenuTree(items: MenuItem[]): MenuItem[] {
    if (items.some((item) => Array.isArray(item.children) && item.children.length > 0)) {
      return items;
    }

    const itemMap = new Map<string, MenuItem & { parentId?: string }>();
    const roots: MenuItem[] = [];
    for (const item of items) {
      itemMap.set(item._id || item.despliegaNombre, { ...item });
    }
    for (const item of items) {
      const parentId = (item as MenuItem & { parentId?: string }).parentId;
      if (parentId && itemMap.has(parentId)) {
        const parent = itemMap.get(parentId)!;
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(itemMap.get(item._id || item.despliegaNombre)!);
      } else {
        roots.push(itemMap.get(item._id || item.despliegaNombre)!);
      }
    }
    return roots;
  }

  hasChild = (_: number, node: MenuItem) => !!node.children && node.children.length > 0;

  isExpanded(node: MenuItem): boolean {
    return !!this.expandedNodes()[node._id || node.despliegaNombre];
  }

  toggleNode(node: MenuItem): void {
    const key = node._id || node.despliegaNombre;
    this.expandedNodes.set({
      ...this.expandedNodes(),
      [key]: !this.expandedNodes()[key],
    });
  }

  cancelar() {
    this.dialogRef.close();
  }

  private collectSelectedMenuItems(nodes: MenuItem[]): MenuItem[] {
    const result: MenuItem[] = [];
    for (const node of nodes) {
      if (this.selectedIds.has(node._id ?? '')) {
        const children = node.children ? this.collectSelectedMenuItems(node.children) : undefined;
        result.push({ ...node, children });
      } else if (node.children) {
        const selectedChildren = this.collectSelectedMenuItems(node.children);
        if (selectedChildren.length > 0) {
          result.push({ ...node, children: selectedChildren });
        }
      }
    }
    return result;
  }

  guardar() {
    const fullMenu = this.dataSource.data;
    const seleccionados = this.collectSelectedMenuItems(fullMenu);

    if (this.data()?.usuario?._id) {
      this.data()!.usuario!.MenuItem = seleccionados;
      this.usuarioService
        .modificarUsuario(this.data()!.usuario!._id!, this.data()!.usuario!)
        .subscribe({
          next: (usuarioActualizado) => {
            this.dialogRef.close({ usuario: usuarioActualizado });
          },
          error: (err) => {
            alert('Error al guardar los permisos: ' + (err?.mensaje || err));
          },
        });
    } else {
      this.dialogRef.close();
    }
  }
}
