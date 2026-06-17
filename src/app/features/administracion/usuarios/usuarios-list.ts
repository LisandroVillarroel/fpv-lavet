import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { combineLatest, map, of, switchAll } from 'rxjs';

import { loginInterface } from '@core/auth/loginInterface';
import { StorageService } from '@core/guards/storage.service';
import { EmpresasService } from '@features/administracion/empresas/empresas.service';
import { Empresa } from '@features/administracion/empresas/empresasInterface';
import { UsuarioService } from '@features/mantenedores/usuarios/usuarios.service';
import { IUsuario } from '@features/mantenedores/usuarios/usuariosInterface';
import { UsuariosView } from '@features/mantenedores/usuarios/usuarios-view/usuarios-view';
import { TituloComponente } from '@shared/ui/tituloComponente';

import UsuariosStepper from './usuarios-form/usuarios-stepper';

@Component({
  selector: 'app-administracion-usuarios-list',
  standalone: true,
  templateUrl: './usuarios-list.html',
  styleUrls: ['../../mantenedores/usuarios/usuarios-list.scss'],
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
export default class UsuariosAdministracionList implements OnInit, AfterViewInit {
  readonly #storage = inject(StorageService);
  readonly #usuarioService = inject(UsuarioService);
  readonly #empresasService = inject(EmpresasService);

  readonly dialog = inject(MatDialog);
  readonly _storage = signal(this.#storage.get<loginInterface>('sesion-lavet'));
  readonly empresas = toSignal(this.#empresasService.obtenerEmpresas(), { initialValue: [] });
  readonly selectedEmpresaId = signal('');
  readonly selectedEmpresa = computed(
    () => this.empresas().find((empresa) => empresa._id === this.selectedEmpresaId()) ?? null,
  );

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
    combineLatest([toObservable(this.trigger), toObservable(this.selectedEmpresaId)]).pipe(
      map(([, empresaId]) =>
        empresaId ? this.#usuarioService.obtenerUsuarios(empresaId) : of<IUsuario[]>([]),
      ),
      switchAll(),
    ),
    { initialValue: [] },
  );

  dataSource = computed(() => new MatTableDataSource<IUsuario>(this.usuariosSignal()));

  private readonly matPaginatorIntl = inject(MatPaginatorIntl);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    effect(() => {
      const empresas = this.empresas();
      const selectedEmpresaId = this.selectedEmpresaId();

      if (selectedEmpresaId || !empresas.length) {
        return;
      }

      this.selectedEmpresaId.set(empresas[0]._id ?? '');
    });
  }

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

  onEmpresaChange(empresaId: string): void {
    this.selectedEmpresaId.set(empresaId);
    this.trigger.update((value) => value + 1);
  }

  agregar(enterAnimationDuration: string, exitAnimationDuration: string): void {
    const empresa = this.selectedEmpresa();
    if (!empresa?._id) {
      return;
    }

    const dialogRef = this.dialog.open(UsuariosStepper, {
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
        empresaId: empresa._id,
        usuarioLogueado: this._storage()?.user,
        empresa: this.mapEmpresaToUsuarioEmpresa(empresa),
      },
    });

    if (dialogRef.componentInstance?.usuarioGuardado) {
      dialogRef.componentInstance.usuarioGuardado.subscribe(() => {
        this.trigger.update((value) => value + 1);
      });
    }

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.trigger.update((value) => value + 1);
      }
    });
  }

  editar(usuario: IUsuario, enterAnimationDuration: string, exitAnimationDuration: string): void {
    const empresa = this.selectedEmpresa();

    const dialogRef = this.dialog.open(UsuariosStepper, {
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
        usuario,
        empresaId: usuario.empresa?.empresaId ?? empresa?._id,
        usuarioLogueado: this._storage()?.user,
        empresa: empresa ? this.mapEmpresaToUsuarioEmpresa(empresa) : undefined,
      },
      disableClose: true,
      autoFocus: false,
    });

    if (dialogRef.componentInstance?.usuarioGuardado) {
      dialogRef.componentInstance.usuarioGuardado.subscribe(() => {
        this.trigger.update((value) => value + 1);
      });
    }

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.trigger.update((value) => value + 1);
      }
    });
  }

  consultar(usuario: IUsuario): void {
    this.dialog.open(UsuariosView, {
      width: '920px',
      maxWidth: '95vw',
      data: { usuario },
      disableClose: false,
      autoFocus: false,
    });
  }

  eliminar(usuario: IUsuario): void {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      this.#usuarioService
        .eliminarUsuario((usuario as { USUARIO?: string }).USUARIO ?? '')
        .subscribe({
          next: () => {
            this.trigger.update((value) => value + 1);
          },
          error: () => {},
        });
    }
  }

  private mapEmpresaToUsuarioEmpresa(empresa: Empresa) {
    return {
      empresaId: empresa._id ?? '',
      rutEmpresa: empresa.rutEmpresa,
      razonSocial: empresa.razonSocial,
      nombreFantasia: empresa.nombreFantasia,
      tipoEmpresa: empresa.tipoEmpresa,
      MenuItem: empresa.MenuItem,
    };
  }
}
