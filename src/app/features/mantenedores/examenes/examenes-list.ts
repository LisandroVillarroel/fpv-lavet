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
import { CategoriasService } from '@features/mantenedores/categorias/categorias.service';
import { ICategoria } from '@features/mantenedores/categorias/categoria.interface';
import { TituloComponente } from '@shared/ui/tituloComponente';
import { NotificacioAlertnService } from '@app/shared/servicios/notificacionAlert';
import { IExamen } from './examen.interface';
import { ExamenesPopupComponent } from './examenes-popup';
import { ExamenesService } from './examenes.service';

@Component({
  selector: 'app-examenes-list',
  standalone: true,
  templateUrl: './examenes-list.html',
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
export default class ExamenesList implements OnInit, AfterViewInit {
  readonly #storage = inject(StorageService);
  readonly #examenesService = inject(ExamenesService);
  readonly #categoriasService = inject(CategoriasService);
  readonly notificacion = inject(NotificacioAlertnService);

  readonly _storage = signal(this.#storage.get<loginInterface>('sesion-lavet'));
  readonly empresaId = this._storage()?.user?.empresa?.empresaId || '';
  readonly isAdministracion = computed(
    () => this._storage()?.user?.tipoUsuario === 'Administración',
  );
  readonly categorias = toSignal(this.#categoriasService.getAll(this.empresaId), {
    initialValue: [] as ICategoria[],
  });
  readonly displayedColumns = computed(() => {
    const columns = [
      'index',
      'codigoExamen',
      'nombre',
      'sigla',
      'precio',
      'tiempoPreparacion',
      'categoria',
      'estado',
      'opciones',
    ];

    if (this.isAdministracion()) {
      columns.splice(2, 0, 'codigoInterno');
    }

    return columns;
  });
  readonly trigger = signal(0);
  readonly examenesSignal = toSignal(
    combineLatest([toObservable(this.trigger)]).pipe(
      map(() => this.#examenesService.getAll(this.empresaId)),
      switchAll(),
    ),
    { initialValue: [] },
  );

  readonly dataSource = computed(() => new MatTableDataSource<IExamen>(this.examenesSignal()));

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

  getCategoriaNombre(examen: IExamen): string {
    return (
      examen.categoriaNombre ??
      this.categorias().find((categoria) => categoria._id === examen.categoria)?.nombre ??
      examen.categoria
    );
  }

  agregar(enterAnimationDuration: string = '800ms', exitAnimationDuration: string = '500ms'): void {
    const dialogRef = this.dialog.open(ExamenesPopupComponent, {
      width: '720px',
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
    examen: IExamen,
    enterAnimationDuration: string = '800ms',
    exitAnimationDuration: string = '500ms',
  ): void {
    const dialogRef = this.dialog.open(ExamenesPopupComponent, {
      width: '720px',
      data: { ...examen, empresa_Id: this.empresaId },
      enterAnimationDuration,
      exitAnimationDuration,
      panelClass: 'full-screen-modal',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.trigger.update((value) => value + 1);
    });
  }

  async eliminar(examen: IExamen) {
    const respuesta = await this.notificacion.confirmacionSelectiva(
      'EXAMEN',
      `¿Está seguro de eliminar el examen ${examen.nombre}?`,
      'Eliminar',
      'Cancelar',
    );

    if (!respuesta) {
      return;
    }

    this.#examenesService.remove(examen._id!).subscribe({
      next: () => {
        this.trigger.update((value) => value + 1);
      },
      error: () => {},
    });
  }
}
