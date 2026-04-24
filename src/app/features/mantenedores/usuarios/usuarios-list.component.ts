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
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UsuarioService } from '@features/mantenedores/usuarios/usuarios.service';
import { UsuariosFormComponent } from '@features/mantenedores/usuarios/usuarios-form/usuarios-form.component';
import { UsuariosViewComponent } from '@features/mantenedores/usuarios/usuarios-view/usuarios-view.component';
import { TituloComponente } from '@shared/ui/tituloComponente';
import { StorageService } from '@core/guards/storage.service';
import { loginInterface } from '@core/auth/loginInterface';
import { IUsuario } from '@features/mantenedores/usuarios/usuariosInterface';
import { combineLatest } from 'rxjs';
import { map, switchAll } from 'rxjs';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  templateUrl: './usuarios-list.component.html',
  styleUrls: ['./usuarios-list.component.scss'],
  imports: [
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCardModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    FormsModule,
    TituloComponente,
  ],
})
export default class UsuariosListComponent implements OnInit, AfterViewInit {
  readonly #storage = inject(StorageService);
  #usuarioService = inject(UsuarioService);
  _storage = signal(this.#storage.get<loginInterface>('sesion-lavet'));
  empresaId = this._storage()?.user?.empresa?.empresaId || '';
  displayedColumns: string[] = [
    'index',
    'usuario',
    'rutUsuario',
    'nombres',
    'apellidoPaterno',
    'opciones',
  ];
  trigger = signal(0);
  usuariosSignal = toSignal(
    combineLatest([toObservable(this.trigger)]).pipe(
      map(() => {
        const obs = this.#usuarioService.obtenerUsuarios(this.empresaId);
        obs.subscribe({
          next: (data) => console.log('[usuariosSignal] datos recibidos:', data),
          error: (err) => console.error('[usuariosSignal] error:', err),
        });
        // Solo devolver el array de usuarios
        return obs.pipe(map((res: any) => res.data ?? []));
      }),
      switchAll(),
    ),
    { initialValue: [] },
  );

  dataSource = computed(() => new MatTableDataSource<IUsuario>(this.usuariosSignal()));

  private matPaginatorIntl = inject(MatPaginatorIntl);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  readonly dialog = inject(MatDialog);

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

  agregar(enterAnimationDuration: string, exitAnimationDuration: string): void {
    const dialogRef = this.dialog.open(UsuariosFormComponent, {
      maxWidth: '98vw',
      maxHeight: '98vh',
      height: '95%',
      width: '80%',
      position: { top: '2%' },
      enterAnimationDuration,
      exitAnimationDuration,
      panelClass: 'full-screen-modal',
      data: { modo: 'agregar', empresaId: this.empresaId },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.trigger.update((v) => v + 1);
    });
  }

  editar(usuario: IUsuario): void {
    const dialogRef = this.dialog.open(UsuariosFormComponent, {
      width: '700px',
      data: { modo: 'editar', usuario, empresaId: this.empresaId },
      disableClose: true,
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.trigger.update((v) => v + 1);
    });
  }

  consultar(usuario: IUsuario): void {
    this.dialog.open(UsuariosViewComponent, {
      width: '700px',
      data: { usuario },
      disableClose: false,
      autoFocus: false,
    });
  }

  eliminar(usuario: IUsuario): void {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      // Se asume que USUARIO es el identificador
      this.#usuarioService.eliminarUsuario((usuario as any).USUARIO).subscribe({
        next: () => {
          this.trigger.update((v) => v + 1);
        },
        error: () => {},
      });
    }
  }
}
