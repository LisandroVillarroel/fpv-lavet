import {
  Component,
  signal,
  inject,
  ViewChild,
  OnInit,
  AfterViewInit,
  computed,
} from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TituloComponente } from '@shared/ui/tituloComponente';
import { StorageService } from '@core/guards/storage.service';
import { loginInterface } from '@core/auth/loginInterface';
import { combineLatest } from 'rxjs';
import { map, switchAll } from 'rxjs';
import { IEspecie } from './especie.interface';
import { EspeciesService } from './especies.service';
import { EspeciesPopupComponent } from './especies-popup';
import { NotificacioAlertnService } from '@app/shared/servicios/notificacionAlert';

@Component({
  selector: 'app-especies-list',
  standalone: true,
  templateUrl: './especies-list.html',
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
export default class EspeciesList implements OnInit, AfterViewInit {
  readonly #storage = inject(StorageService);
  #especiesService = inject(EspeciesService);
  notificacion = inject(NotificacioAlertnService);

  _storage = signal(this.#storage.get<loginInterface>('sesion-lavet'));
  empresaId = this._storage()?.user?.empresa?.empresaId || '';
  displayedColumns: string[] = ['index', 'nombre', 'estado', 'opciones'];
  trigger = signal(0);
  especiesSignal = toSignal(
    combineLatest([toObservable(this.trigger)]).pipe(
      map(() => this.#especiesService.getAll(this.empresaId)),
      switchAll(),
    ),
    { initialValue: [] },
  );

  dataSource = computed(() => new MatTableDataSource<IEspecie>(this.especiesSignal()));

  private matPaginatorIntl = inject(MatPaginatorIntl);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  readonly dialog = inject(MatDialog);

  ngOnInit(): void {
    console.log('EspeciesList ngOnInit called', this.especiesSignal());
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
    const dialogRef = this.dialog.open(EspeciesPopupComponent, {
      width: '600px',
      data: { empresa_Id: this.empresaId },
      enterAnimationDuration,
      exitAnimationDuration,
      panelClass: 'full-screen-modal',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.trigger.update((v) => v + 1);
    });
  }

  editar(
    especie: IEspecie,
    enterAnimationDuration: string = '800ms',
    exitAnimationDuration: string = '500ms',
  ): void {
    const dialogRef = this.dialog.open(EspeciesPopupComponent, {
      width: '600px',
      data: { ...especie, empresa_Id: this.empresaId },
      enterAnimationDuration,
      exitAnimationDuration,
      panelClass: 'full-screen-modal',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.trigger.update((v) => v + 1);
    });
  }

  async eliminar(especie: IEspecie) {
    const respuesta = await this.notificacion.confirmacionSelectiva(
      'ESPECIE',
      '¿Está seguro de eliminar esta especie?',
      'Eliminar',
      'Cancelar',
    );

    if (respuesta) {
      this.#especiesService.remove(especie._id!).subscribe({
        next: () => {
          this.trigger.update((v) => v + 1);
        },
        error: () => {},
      });
    }
  }
}
