import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@envs/environment';
import {
  DashboardRequest,
  DashboardResponse,
} from './portada.models';

@Injectable({ providedIn: 'root' })
export class PortadaDashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/dashboard`;

  obtenerDashboard(payload: DashboardRequest): Observable<DashboardResponse> {
    const url = `${this.baseUrl}/portada`;

    let params = new HttpParams()
      .set('fechaInicio', payload.fechaInicio)
      .set('fechaFin', payload.fechaFin);

    if (payload.usuario && payload.usuario.trim().length > 0) {
      params = params.set('usuario', payload.usuario.trim());
    }

    if (payload.usuarioId && payload.usuarioId > 0) {
      params = params.set('usuarioId', payload.usuarioId.toString());
    }

    return this.http.get<DashboardResponse>(url, { params });
  }
}
