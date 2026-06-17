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
import { IRaza } from './raza.interface';
import { RazaConsultarPopupComponent } from './raza-consultar-popup';
import { RazasPopupComponent } from './razas-popup';
import { RazasService } from './razas.service';

@Component({
  selector: 'app-razas-list',
  standalone: true,
  templateUrl: './razas-list.html',
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
export default class RazasList implements OnInit, AfterViewInit {
  readonly #storage = inject(StorageService);
  readonly #razasService = inject(RazasService);
  readonly #notificacion = inject(NotificacioAlertnService);

  readonly _storage = signal(this.#storage.get<loginInterface>('sesion-lavet'));
  readonly empresaId = this._storage()?.user?.empresa?.empresaId || '';
  readonly displayedColumns: string[] = ['index', 'nombre', 'especieNombre', 'estado', 'opciones'];
  readonly trigger = signal(0);
  readonly razasSignal = toSignal(
    combineLatest([toObservable(this.trigger)]).pipe(
      map(() => this.#razasService.obtenerTodas(this.empresaId)),
      switchAll(),
    ),
    { initialValue: [] },
  );

  readonly dataSource = computed(() => new MatTableDataSource<IRaza>(this.razasSignal()));
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

  aplicarFiltro(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource().filter = filterValue.trim().toLowerCase();
    if (this.dataSource().paginator) {
      this.dataSource().paginator!.firstPage();
    }
  }

  agregar(enterAnimationDuration: string = '800ms', exitAnimationDuration: string = '500ms'): void {
    const dialogRef = this.dialog.open(RazasPopupComponent, {
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

  modificar(
    raza: IRaza,
    enterAnimationDuration: string = '800ms',
    exitAnimationDuration: string = '500ms',
  ): void {
    const dialogRef = this.dialog.open(RazasPopupComponent, {
      width: '600px',
      data: { ...raza, empresa_Id: this.empresaId },
      enterAnimationDuration,
      exitAnimationDuration,
      panelClass: 'full-screen-modal',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.trigger.update((v) => v + 1);
    });
  }

  consultar(
    raza: IRaza,
    enterAnimationDuration: string = '800ms',
    exitAnimationDuration: string = '500ms',
  ): void {
    this.dialog.open(RazaConsultarPopupComponent, {
      width: '520px',
      data: raza,
      enterAnimationDuration,
      exitAnimationDuration,
      panelClass: 'full-screen-modal',
    });
  }

  async eliminar(raza: IRaza) {
    const respuesta = await this.#notificacion.confirmacionSelectiva(
      'RAZA',
      `¿Está seguro de eliminar la raza ${raza.nombre}?`,
      'Eliminar',
      'Cancelar',
    );

    if (respuesta) {
      this.#razasService.eliminar(raza._id!).subscribe({
        next: () => {
          this.trigger.update((v) => v + 1);
        },
        error: () => {},
      });
    }
  }
}
