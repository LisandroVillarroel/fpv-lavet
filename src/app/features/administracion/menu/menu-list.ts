import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { combineLatest, map, switchAll } from 'rxjs';

import { NotificacioAlertnService } from '@app/shared/servicios/notificacionAlert';
import { IMenu } from './menu.interface';
import { MenuFormComponent } from './menu-form';
import { MenuService } from './menu.service';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  templateUrl: './menu-list.html',
  imports: [
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    ReactiveFormsModule,
    FormsModule,
  ],
})
export default class MenuList implements OnInit, AfterViewInit {
  private readonly menuService = inject(MenuService);
  private readonly matPaginatorIntl = inject(MatPaginatorIntl);
  private readonly notificacion = inject(NotificacioAlertnService);

  readonly dialog = inject(MatDialog);
  readonly displayedColumns: string[] = ['index', 'nombreMenu', 'estado', 'items', 'opciones'];
  readonly trigger = signal(0);
  readonly menusSignal = toSignal(
    combineLatest([toObservable(this.trigger)]).pipe(
      map(() => this.menuService.obtenerMenus()),
      switchAll(),
    ),
    { initialValue: [] },
  );
  readonly dataSource = computed(() => new MatTableDataSource<IMenu>(this.menusSignal()));

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.matPaginatorIntl.itemsPerPageLabel = 'Registros por Página';
  }

  ngAfterViewInit(): void {
    this.dataSource().paginator = this.paginator;
    this.dataSource().sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource().filter = filterValue.trim().toLowerCase();

    const paginator = this.dataSource().paginator;
    if (paginator) {
      paginator.firstPage();
    }
  }

  agregar(enterAnimationDuration: string = '800ms', exitAnimationDuration: string = '500ms'): void {
    const dialogRef = this.dialog.open(MenuFormComponent, {
      width: '1100px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      enterAnimationDuration,
      exitAnimationDuration,
      panelClass: 'full-screen-modal',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.trigger.update((value) => value + 1);
      }
    });
  }

  editar(
    menu: IMenu,
    enterAnimationDuration: string = '800ms',
    exitAnimationDuration: string = '500ms',
  ): void {
    const dialogRef = this.dialog.open(MenuFormComponent, {
      width: '1100px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      enterAnimationDuration,
      exitAnimationDuration,
      panelClass: 'full-screen-modal',
      data: menu,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.trigger.update((value) => value + 1);
      }
    });
  }

  async eliminar(menu: IMenu): Promise<void> {
    const respuesta = await this.notificacion.confirmacionSelectiva(
      'MENÚ',
      `¿Está seguro de eliminar el menú ${menu.nombreMenu}?`,
      'Eliminar',
      'Cancelar',
    );

    if (!respuesta || !menu._id) {
      return;
    }

    this.menuService.eliminarMenu(menu._id).subscribe({
      next: () => {
        this.trigger.update((value) => value + 1);
      },
      error: () => {},
    });
  }

  contarItems(items: IMenu['menuItem']): number {
    return items.reduce((total, item) => total + 1 + this.contarItems(item.children ?? []), 0);
  }
}
