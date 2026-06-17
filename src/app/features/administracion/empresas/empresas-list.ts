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

import { Empresa } from '@features/administracion/empresas/empresasInterface';
import { EmpresasService } from '@features/administracion/empresas/empresas.service';
import EmpresasStepper from '@features/administracion/empresas/empresas-form/empresas-stepper';
import { EmpresasView } from '@features/administracion/empresas/empresas-view/empresas-view';
import { TituloComponente } from '@shared/ui/tituloComponente';

@Component({
  selector: 'app-empresas-list',
  standalone: true,
  templateUrl: './empresas-list.html',
  styleUrls: ['./empresas-list.scss'],
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
export default class EmpresasList implements OnInit, AfterViewInit {
  readonly #empresasService = inject(EmpresasService);
  readonly dialog = inject(MatDialog);
  readonly displayedColumns: string[] = [
    'index',
    'rutEmpresa',
    'razonSocial',
    'nombreFantasia',
    'tipoEmpresa',
    'opciones',
  ];
  readonly trigger = signal(0);
  readonly empresasSignal = toSignal(
    combineLatest([toObservable(this.trigger)]).pipe(
      map(() => this.#empresasService.obtenerEmpresas()),
      switchAll(),
    ),
    { initialValue: [] },
  );
  readonly dataSource = computed(() => new MatTableDataSource<Empresa>(this.empresasSignal()));

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
    const dialogRef = this.dialog.open(EmpresasStepper, {
      maxWidth: '98vw',
      maxHeight: '98vh',
      height: '95%',
      width: '80%',
      position: { top: '2%' },
      enterAnimationDuration,
      exitAnimationDuration,
      panelClass: 'full-screen-modal',
      data: { modo: 'agregar' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.trigger.update((value) => value + 1);
      }
    });
  }

  editar(empresa: Empresa, enterAnimationDuration: string, exitAnimationDuration: string): void {
    console.log('Editar empresa:', empresa); // Agrega este log para verificar el objeto empresa
    const dialogRef = this.dialog.open(EmpresasStepper, {
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
        empresa,
      },
      disableClose: false,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.trigger.update((value) => value + 1);
      }
    });
  }

  consultar(empresa: Empresa): void {
    this.dialog.open(EmpresasView, {
      width: '920px',
      maxWidth: '95vw',
      data: { empresa, empresaId: empresa._id },
      disableClose: false,
      autoFocus: false,
    });
  }

  eliminar(empresa: Empresa): void {
    if (confirm('¿Está seguro de eliminar esta empresa?')) {
      this.#empresasService.eliminarEmpresa(empresa._id ?? '').subscribe({
        next: () => {
          this.trigger.update((value) => value + 1);
        },
        error: () => {},
      });
    }
  }
}
