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
import { ICliente } from '@features/laboratorio/administracion/clientes/clientesInterface';
import { ClientesService } from '@features/laboratorio/administracion/clientes/clientes.service';
import ClientesStepper from '@features/laboratorio/administracion/clientes/clientes-form/clientes-stepper';
import { ClientesView } from '@features/laboratorio/administracion/clientes/clientes-view/clientes-view';
import { TituloComponente } from '@shared/ui/tituloComponente';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  templateUrl: './clientes-list.html',
  styleUrls: ['./clientes-list.scss'],
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
export default class ClientesList implements OnInit, AfterViewInit {
  readonly #storage = inject(StorageService);
  readonly #clientesService = inject(ClientesService);
  readonly dialog = inject(MatDialog);

  readonly session = signal(this.#storage.get<loginInterface>('sesion-lavet'));
  readonly empresaId = this.session()?.user?.empresa?.empresaId || '';
  readonly displayedColumns: string[] = [
    'index',
    'usuario',
    'rutUsuario',
    'nombres',
    'apellidoPaterno',
    'opciones',
  ];
  readonly trigger = signal(0);
  readonly clientesSignal = toSignal(
    combineLatest([toObservable(this.trigger)]).pipe(
      map(() => this.#clientesService.obtenerClientes(this.empresaId)),
      switchAll(),
    ),
    { initialValue: [] },
  );
  readonly dataSource = computed(() => new MatTableDataSource<ICliente>(this.clientesSignal()));

  private readonly matPaginatorIntl = inject(MatPaginatorIntl);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.matPaginatorIntl.itemsPerPageLabel = 'Registros por Página';
  }

  ngAfterViewInit(): void {
    const dataSource = this.dataSource();
    dataSource.paginator = this.paginator;
    dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    const dataSource = this.dataSource();
    dataSource.filter = filterValue.trim().toLowerCase();

    if (dataSource.paginator) {
      dataSource.paginator.firstPage();
    }
  }

  agregar(enterAnimationDuration: string, exitAnimationDuration: string): void {
    const dialogRef = this.dialog.open(ClientesStepper, {
      maxWidth: '98vw',
      maxHeight: '98vh',
      height: '95%',
      width: '80%',
      position: { top: '2%' },
      enterAnimationDuration,
      exitAnimationDuration,
      panelClass: 'full-screen-modal',
      data: {
        modo: 'agregar',
        empresaId: this.empresaId,
        usuarioLogueado: this.session()?.user,
        empresa: this.session()?.user?.empresa,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.trigger.update((value) => value + 1);
      }
    });
  }

  editar(cliente: ICliente, enterAnimationDuration: string, exitAnimationDuration: string): void {
    const dialogRef = this.dialog.open(ClientesStepper, {
      maxWidth: '98vw',
      maxHeight: '98vh',
      height: '95%',
      width: '80%',
      position: { top: '2%' },
      enterAnimationDuration,
      exitAnimationDuration,
      panelClass: 'full-screen-modal',
      data: {
        modo: 'editar',
        cliente,
        empresaId: this.empresaId,
        usuarioLogueado: this.session()?.user,
        empresa: this.session()?.user?.empresa,
      },
      disableClose: true,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.trigger.update((value) => value + 1);
      }
    });
  }

  consultar(cliente: ICliente): void {
    this.dialog.open(ClientesView, {
      width: '920px',
      maxWidth: '95vw',
      data: { cliente, clienteId: cliente._id },
      disableClose: false,
      autoFocus: false,
    });
  }

  eliminar(cliente: ICliente): void {
    if (confirm('¿Está seguro de eliminar este cliente?')) {
      this.#clientesService.eliminarCliente(cliente._id ?? '').subscribe({
        next: () => {
          this.trigger.update((value) => value + 1);
        },
        error: () => {},
      });
    }
  }
}
