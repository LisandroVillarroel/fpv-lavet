import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@envs/environment';
import {
  PresupuestoResponse,
  ReportQueryParams,
  RiesgosResponse,
} from './portada-reportes.models';

@Injectable({ providedIn: 'root' })
export class PortadaReportesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/dashboard/reportes`;

  obtenerReporteRiesgos(filtros: ReportQueryParams = {}): Observable<RiesgosResponse> {
    return this.http.get<RiesgosResponse>(`${this.baseUrl}/riesgos`, {
      params: this.argumentos(filtros),
    });
  }

  obtenerReportePresupuesto(filtros: ReportQueryParams = {}): Observable<PresupuestoResponse> {
    return this.http.get<PresupuestoResponse>(`${this.baseUrl}/presupuesto`, {
      params: this.argumentos(filtros),
    });
  }

  exportarReporteRiesgosPdf(filtros: ReportQueryParams = {}): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/riesgos/export/pdf`, {
      params: this.argumentos(filtros),
      responseType: 'blob',
    });
  }

  exportarReportePresupuestoPdf(filtros: ReportQueryParams = {}): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/presupuesto/export/pdf`, {
      params: this.argumentos(filtros),
      responseType: 'blob',
    });
  }

  private argumentos(filtros: ReportQueryParams): HttpParams {
    let params = new HttpParams();

    if (filtros.fechaInicio) {
      params = params.set('fechaInicio', filtros.fechaInicio);
    }
    if (filtros.fechaFin) {
      params = params.set('fechaFin', filtros.fechaFin);
    }
    if (filtros.usuario) {
      params = params.set('usuario', filtros.usuario);
    }
    if (typeof filtros.usuarioId === 'number' && !Number.isNaN(filtros.usuarioId)) {
      params = params.set('usuarioId', String(filtros.usuarioId));
    }

    return params;
  }
}
