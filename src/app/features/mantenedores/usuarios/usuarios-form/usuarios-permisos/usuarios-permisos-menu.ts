import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { AuthTokenService } from '@app/core/services/auth-token.service';
import { MenuItem } from '@app/shared/interfaces/usuario.interface';
import { MatTree, MatTreeModule } from '@angular/material/tree';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { IUsuario } from './../../usuariosInterface';
import { UsuarioService } from './../../usuarios.service';
@Component({
  selector: 'app-usuarios-permisos-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTreeModule, MatCheckboxModule, MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl: './usuarios-permisos-menu.html',
  styleUrls: ['./usuarios-permisos-menu.scss'],
})
export class UsuariosPermisosMenuComponent implements OnInit {
  // IDs de nodos seleccionados
  selectedIds = new Set<string>();
  // Devuelve true si el nodo está seleccionado o alguno de sus hijos lo está
  isChecked(node: MenuItem): boolean {
    return this.selectedIds.has(node._id ?? '');
  }

  isIndeterminate(node: MenuItem): boolean {
    if (!node.children || node.children.length === 0) return false;
    const checkedChildren = node.children.filter(
      (child) => this.isChecked(child) || this.isIndeterminate(child),
    );
    return checkedChildren.length > 0 && checkedChildren.length < node.children.length;
  }

  toggleNodeSelection(node: MenuItem, checked: boolean): void {
    const id = node._id ?? '';
    if (checked) {
      this.selectedIds.add(id);
      // Selecciona todos los hijos recursivamente
      if (node.children) {
        node.children.forEach((child) => this.toggleNodeSelection(child, true));
      }
    } else {
      this.selectedIds.delete(id);
      // Des-selecciona todos los hijos recursivamente
      if (node.children) {
        node.children.forEach((child) => this.toggleNodeSelection(child, false));
      }
    }
    // Si tiene padre, actualizar indeterminate del padre (opcional, visual)
  }

  // Busca recursivamente un MenuItem por _id en el árbol
  private findMenuItemById(items: MenuItem[], id: string): boolean {
    for (const item of items) {
      if (item._id === id) return true;
      if (item.children && item.children.length > 0) {
        if (this.findMenuItemById(item.children, id)) return true;
      }
    }
    return false;
  }
  data = input<{
    modo: 'agregar' | 'editar';
    usuario?: IUsuario;
    empresaId?: string;
    usuarioLogueado?: { _id?: string };
    empresa?: {
      empresaId: string;
      rutEmpresa: string;
      razonSocial: string;
      nombreFantasia: string;
      tipoEmpresa?: 'Laboratorio' | 'Veterinaria' | 'Usuario';
    };
  }>();

  private readonly dialogRef = inject(MatDialogRef<UsuariosPermisosMenuComponent>);
  treeControl = new NestedTreeControl<MenuItem>((node) => node.children);
  dataSource = new MatTreeNestedDataSource<MenuItem>();

  expandedNodes = signal<Record<string, boolean>>({});
  @ViewChild('tree') tree: MatTree<any> | undefined;
  // childrenAccessor para Angular Material Tree
  childrenAccessor = (node: MenuItem) => node.children ?? [];

  private readonly usuarioService = inject(UsuarioService);
  constructor(private authTokenService: AuthTokenService) {}

  ngAfterViewInit() {
    // Si los datos se cargan de forma asíncrona, asegúrate de que estén disponibles antes de expandir.

    // Expandir todos los nodos.
    if (this.tree) {
      this.tree.expandAll();
    }
  }

  ngOnInit(): void {
    const session = this.authTokenService.getStorage();
    let menuItems = session?.user?.empresa?.MenuItem || [];
    // Asegura que todos los nodos tengan _id único
    menuItems = this.ensureMenuItemIds(menuItems);
    this.dataSource.data = this.buildMenuTree(menuItems);
    this.treeControl.dataNodes = this.dataSource.data;
    // Inicializa seleccionados si el usuario ya tiene permisos
    const usuarioMenu = this.data()?.usuario?.MenuItem || [];
    this.collectSelectedIds(usuarioMenu);
  }

  private collectSelectedIds(nodes: MenuItem[]) {
    for (const node of nodes) {
      if (node._id) this.selectedIds.add(node._id);
      if (node.children) this.collectSelectedIds(node.children);
    }
  }

  /**
   * Recorre recursivamente el árbol de MenuItem y asigna un _id único a cada nodo que no lo tenga.
   */
  private ensureMenuItemIds(items: MenuItem[], parentKey: string = ''): MenuItem[] {
    return items.map((item, idx) => {
      // Si ya tiene _id, lo respeta
      let id = item._id;
      if (!id) {
        // Genera un id único basado en el nombre y la posición
        id = `${parentKey}${item.despliegaNombre.replace(/\s+/g, '_')}_${idx}`;
      }
      const children = item.children ? this.ensureMenuItemIds(item.children, id + '-') : undefined;
      return { ...item, _id: id, children };
    });
  }

  /**
   * Convierte un array plano de MenuItem en un árbol anidado usando la propiedad _id y parentId.
   * Si los nodos ya tienen children, los respeta.
   */
  private buildMenuTree(items: MenuItem[]): MenuItem[] {
    // Si ya hay children, asumimos que ya es árbol
    if (items.some((item) => Array.isArray(item.children) && item.children.length > 0)) {
      return items;
    }
    // Si los nodos tienen parentId, construir árbol
    const itemMap = new Map<string, MenuItem & { parentId?: string }>();
    const roots: MenuItem[] = [];
    for (const item of items) {
      itemMap.set(item._id || item.despliegaNombre, { ...item });
    }
    for (const item of items) {
      const parentId = (item as any).parentId;
      if (parentId && itemMap.has(parentId)) {
        const parent = itemMap.get(parentId)!;
        if (!parent.children) parent.children = [];
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

  /**
   * Recolecta todos los nodos seleccionados del árbol (por _id).
   */
  private collectSelectedMenuItems(nodes: MenuItem[]): MenuItem[] {
    const result: MenuItem[] = [];
    for (const node of nodes) {
      if (this.selectedIds.has(node._id ?? '')) {
        // Clona el nodo y filtra hijos seleccionados
        const children = node.children ? this.collectSelectedMenuItems(node.children) : undefined;
        result.push({ ...node, children });
      } else if (node.children) {
        // Si el padre no está seleccionado pero algún hijo sí, agrega solo los hijos seleccionados
        const selectedChildren = this.collectSelectedMenuItems(node.children);
        if (selectedChildren.length > 0) {
          result.push({ ...node, children: selectedChildren });
        }
      }
    }
    return result;
  }

  guardar() {
    // Obtiene el árbol completo del menú
    const fullMenu = this.dataSource.data;
    // Obtiene solo los nodos seleccionados
    console.log('Árbol completo del menú:', fullMenu);
    const seleccionados = this.collectSelectedMenuItems(fullMenu);
    console.log('Nodos seleccionados:', seleccionados);
    // Actualiza el usuario en el input con el menú seleccionado
    if (this.data()?.usuario) {
      this.data()!.usuario!.MenuItem = seleccionados;
      // Llama al backend para actualizar el usuario
      this.usuarioService
        .modificarUsuario(this.data()!.usuario!._id!, this.data()!.usuario!)
        .subscribe({
          next: (usuarioActualizado) => {
            // Cierra el diálogo y retorna los datos actualizados
            this.dialogRef.close({ usuario: usuarioActualizado });
          },
          error: (err) => {
            // Manejo de error simple (puedes mejorar con notificaciones)
            alert('Error al guardar los permisos: ' + (err?.mensaje || err));
          },
        });
    } else {
      this.dialogRef.close();
    }
  }
}
