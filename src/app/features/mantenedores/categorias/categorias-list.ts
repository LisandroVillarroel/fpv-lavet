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

import { loginInterface } from '@core/auth/loginInterface';
import { StorageService } from '@core/guards/storage.service';
import { TituloComponente } from '@shared/ui/tituloComponente';
import { NotificacioAlertnService } from '@app/shared/servicios/notificacionAlert';
import { ICategoria } from './categoria.interface';
import { CategoriasPopupComponent } from './categorias-popup';
import { CategoriasService } from './categorias.service';

@Component({
  selector: 'app-categorias-list',
  standalone: true,
  templateUrl: './categorias-list.html',
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
    TituloComponente,
  ],
})
export default class CategoriasList implements OnInit, AfterViewInit {
  readonly #storage = inject(StorageService);
  readonly #categoriasService = inject(CategoriasService);
  readonly notificacion = inject(NotificacioAlertnService);

  readonly _storage = signal(this.#storage.get<loginInterface>('sesion-lavet'));
  readonly empresaId = this._storage()?.user?.empresa?.empresaId || '';
  readonly displayedColumns: string[] = ['index', 'nombre', 'sigla', 'estado', 'opciones'];
  readonly trigger = signal(0);
  readonly categoriasSignal = toSignal(
    combineLatest([toObservable(this.trigger)]).pipe(
      map(() => this.#categoriasService.getAll(this.empresaId)),
      switchAll(),
    ),
    { initialValue: [] },
  );

  readonly dataSource = computed(() => new MatTableDataSource<ICategoria>(this.categoriasSignal()));

  private readonly matPaginatorIntl = inject(MatPaginatorIntl);
  readonly dialog = inject(MatDialog);

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
    if (this.dataSource().paginator) {
      this.dataSource().paginator!.firstPage();
    }
  }

  agregar(enterAnimationDuration: string = '800ms', exitAnimationDuration: string = '500ms'): void {
    const dialogRef = this.dialog.open(CategoriasPopupComponent, {
      width: '600px',
      data: { empresa_Id: this.empresaId },
      enterAnimationDuration,
      exitAnimationDuration,
      panelClass: 'full-screen-modal',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.trigger.update((value) => value + 1);
    });
  }

  editar(
    categoria: ICategoria,
    enterAnimationDuration: string = '800ms',
    exitAnimationDuration: string = '500ms',
  ): void {
    const dialogRef = this.dialog.open(CategoriasPopupComponent, {
      width: '600px',
      data: { ...categoria, empresa_Id: this.empresaId },
      enterAnimationDuration,
      exitAnimationDuration,
      panelClass: 'full-screen-modal',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.trigger.update((value) => value + 1);
    });
  }

  async eliminar(categoria: ICategoria) {
    const respuesta = await this.notificacion.confirmacionSelectiva(
      'CATEGORÍA',
      '¿Está seguro de eliminar esta categoría?',
      'Eliminar',
      'Cancelar',
    );

    if (!respuesta) {
      return;
    }

    this.#categoriasService.remove(categoria._id!).subscribe({
      next: () => {
        this.trigger.update((value) => value + 1);
      },
      error: () => {},
    });
  }
}
