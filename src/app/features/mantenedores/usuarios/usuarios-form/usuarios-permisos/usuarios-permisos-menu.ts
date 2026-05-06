import {
  ChangeDetectionStrategy,
  Component,
  inject,
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

@Component({
  selector: 'app-usuarios-permisos-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTreeModule, MatCheckboxModule, MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl: './usuarios-permisos-menu.html',
  styleUrls: ['./usuarios-permisos-menu.scss'],
})
export class UsuariosPermisosMenuComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<UsuariosPermisosMenuComponent>);
  treeControl = new NestedTreeControl<MenuItem>((node) => node.children);
  dataSource = new MatTreeNestedDataSource<MenuItem>();

  expandedNodes = signal<Record<string, boolean>>({});
  @ViewChild('tree') tree: MatTree<any> | undefined;
  // childrenAccessor para Angular Material Tree
  childrenAccessor = (node: MenuItem) => node.children ?? [];

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
    const menuItems = session?.user?.empresa?.MenuItem || [];
    // Si los datos ya están anidados, esto no afecta. Si están planos, los transforma.
    this.dataSource.data = this.buildMenuTree(menuItems);
    // Forzar actualización de nodos para el treeControl
    this.treeControl.dataNodes = this.dataSource.data;
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
  guardar() {}
}
