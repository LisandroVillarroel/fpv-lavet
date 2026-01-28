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
import { MatTooltipModule } from '@angular/material/tooltip';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PortadaReportesService } from '../portada-reportes.service';
import { ReportQueryParams, RiesgoAbierto } from '../portada-reportes.models';

@Component({
  selector: 'app-riesgos-report',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './riesgos-report.component.html',
  styleUrls: ['./riesgos-report.component.scss'],
})
export default class RiesgosReportComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly reportesService = inject(PortadaReportesService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly dateFormatter = new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly rango = signal<{ inicio: string; fin: string } | null>(null);
  readonly riesgos = signal<RiesgoAbierto[]>([]);

  readonly riesgosCriticos = computed(
    () => this.riesgos().filter((riesgo) => riesgo.impacto === 'Alto').length
  );

  readonly pendientes = computed(
    () =>
      this.riesgos().filter((riesgo) => riesgo.estado === 'Pendiente').length
  );

  readonly proximosHitos = computed(() =>
    this.riesgos()
      .map((riesgo) => riesgo.proximoHito)
      .filter((valor): valor is string => Boolean(valor))
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
  );

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const filtros = this.mapearFiltros(params);
        this.cargarDatos(filtros);
      });
  }

  volverDashboard(): void {
    this.router.navigate(['/portada']);
  }

  exportar(): void {
    const filtros = this.mapearFiltros(this.route.snapshot.queryParamMap);
    this.reportesService
      .exportarReporteRiesgosPdf(filtros)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (archivo) =>
          this.descargarArchivo(archivo, 'reporte-riesgos.pdf'),
        error: (err) => {
          console.error('Error exportando PDF de riesgos', err);
          this.error.set('No fue posible exportar el PDF de riesgos.');
        },
      });
  }

  formatearFecha(iso: string | null): string {
    if (!iso) {
      return 'Sin fecha definida';
    }
    const fecha = new Date(iso);
    if (Number.isNaN(fecha.getTime())) {
      return 'Sin fecha definida';
    }
    return this.dateFormatter.format(fecha);
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

  private cargarDatos(filtros: ReportQueryParams): void {
    this.cargando.set(true);
    this.error.set(null);

    this.reportesService
      .obtenerReporteRiesgos(filtros)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (respuesta) => {
          this.riesgos.set(respuesta.items);
          this.rango.set(respuesta.rango);
          this.cargando.set(false);
        },
        error: (err) => {
          console.error('Error cargando reporte de riesgos', err);
          this.error.set(
            'No fue posible cargar los riesgos. Intenta nuevamente más tarde.'
          );
          this.riesgos.set([]);
          this.cargando.set(false);
        },
      });
  }

  private mapearFiltros(
    params: import('@angular/router').ParamMap
  ): ReportQueryParams {
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

  extraerSiglaEstado(estado: string | null): string {
    if (!estado) {
      return '—';
    }

    const trimmed = estado.trim();
    const separatorIndex = trimmed.indexOf('-');
    if (separatorIndex === -1) {
      return trimmed || '—';
    }

    const sigla = trimmed.slice(separatorIndex + 1).trim();
    if (sigla.length > 0) {
      return sigla;
    }

    const fallback = trimmed.slice(0, separatorIndex).trim();
    return fallback || trimmed;
  }
}
