import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  PortadaReportesService,
} from '../portada-reportes.service';
import {
  PresupuestoDetalle,
  PresupuestoResponse,
  ReportQueryParams,
  TendenciaPresupuesto,
} from '../portada-reportes.models';

@Component({
  selector: 'app-presupuesto-report',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  templateUrl: './presupuesto-report.component.html',
  styleUrls: ['./presupuesto-report.component.scss'],
})
export default class PresupuestoReportComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reportesService = inject(PortadaReportesService);

  private readonly formatter = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  });

  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly datos = signal<PresupuestoDetalle[]>([]);
  readonly totales = signal<PresupuestoResponse['totales']>({
    presupuesto: 0,
    ejecutado: 0,
    variacion: 0,
  });
  readonly rango = signal<{ inicio: string; fin: string } | null>(null);

  readonly totalPresupuestado = computed(() => this.totales().presupuesto);

  readonly totalEjecutado = computed(() => this.totales().ejecutado);

  readonly variacionTotal = computed(() => this.totales().variacion);

  readonly porcentajeEjecucion = computed(() =>
    this.totalPresupuestado() === 0
      ? 0
      : Math.round((this.totalEjecutado() / this.totalPresupuestado()) * 100)
  );

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        map((params) => this.mapearFiltros(params)),
        tap(() => {
          this.cargando.set(true);
          this.error.set(null);
        }),
        switchMap((filtros) =>
          this.reportesService.obtenerReportePresupuesto(filtros).pipe(
            catchError((err) => {
              console.error('Error cargando reporte de presupuesto', err);
              this.error.set('No fue posible cargar el detalle de presupuesto.');
              this.datos.set([]);
              this.totales.set({ presupuesto: 0, ejecutado: 0, variacion: 0 });
              this.rango.set(null);
              this.cargando.set(false);
              return of(null);
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((respuesta) => {
        if (!respuesta) {
          return;
        }
        this.datos.set(respuesta.items);
        this.totales.set(respuesta.totales);
        this.rango.set(respuesta.rango);
        this.cargando.set(false);
      });
  }

  volverDashboard(): void {
    this.router.navigate(['/portada']);
  }

  exportar(): void {
    const filtros = this.mapearFiltros(this.route.snapshot.queryParamMap);
    this.reportesService
      .exportarReportePresupuestoPdf(filtros)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (archivo) => this.descargarArchivo(archivo, 'reporte-presupuesto.pdf'),
        error: (err) => {
          console.error('Error exportando PDF de presupuesto', err);
          this.error.set('No fue posible exportar el PDF de presupuesto.');
        },
      });
  }

  formatear(valor: number): string {
    return this.formatter.format(Math.abs(valor));
  }

  claseVariacion(valor: number): string {
    if (valor > 0) {
      return 'variacion-over';
    }
    if (valor < 0) {
      return 'variacion-under';
    }
    return 'variacion-neutral';
  }

  iconoTendencia(valor: TendenciaPresupuesto): string {
    switch (valor) {
      case 'up':
        return 'trending_up';
      case 'down':
        return 'trending_down';
      default:
        return 'trending_flat';
    }
  }

  private mapearFiltros(params: import('@angular/router').ParamMap): ReportQueryParams {
    const filtros: ReportQueryParams = {};
    const fechaInicio = params.get('fechaInicio');
    const fechaFin = params.get('fechaFin');
    const usuario = params.get('usuario');
    const usuarioId = params.get('usuarioId');

    if (fechaInicio) {
      filtros.fechaInicio = fechaInicio;
    }
    if (fechaFin) {
      filtros.fechaFin = fechaFin;
    }
    if (usuario) {
      filtros.usuario = usuario;
    }
    if (usuarioId) {
      const idNumerico = Number(usuarioId);
      if (!Number.isNaN(idNumerico)) {
        filtros.usuarioId = idNumerico;
      }
    }

    return filtros;
  }

  private descargarArchivo(blob: Blob, nombre: string): void {
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombre;
    enlace.style.display = 'none';
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}
