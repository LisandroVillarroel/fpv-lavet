import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@envs/environment';
import { IExamen } from './examen.interface';

type ExamenApiResponse = Omit<IExamen, 'categoria'> & {
  categoria?: string | { _id?: string; nombre?: string } | null;
};

@Injectable({ providedIn: 'root' })
export class ExamenesService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl + '/examen';

  getAll(empresa_Id: string): Observable<IExamen[]> {
    return this.http
      .get<{
        error: boolean;
        data: ExamenApiResponse[];
      }>(`${this.baseUrl}?empresa_Id=${empresa_Id}`)
      .pipe(map((resp) => resp.data.map((examen) => this.normalizarExamen(examen))));
  }

  getById(id: string): Observable<IExamen> {
    return this.http
      .get<{ error: boolean; data: ExamenApiResponse }>(`${this.baseUrl}/${id}`)
      .pipe(map((resp) => this.normalizarExamen(resp.data)));
  }

  create(data: Partial<IExamen>): Observable<Partial<IExamen>> {
    return this.http
      .post<{ error: boolean; data: ExamenApiResponse }>(this.baseUrl, data)
      .pipe(map((resp) => this.normalizarExamen(resp.data)));
  }

  update(id: string, data: Partial<IExamen>): Observable<IExamen> {
    return this.http
      .put<{ error: boolean; data: ExamenApiResponse }>(`${this.baseUrl}/${id}`, data)
      .pipe(map((resp) => this.normalizarExamen(resp.data)));
  }

  remove(id: string): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  private normalizarExamen(examen: ExamenApiResponse): IExamen {
    return {
      ...examen,
      categoriaNombre:
        typeof examen.categoria === 'string' ? undefined : (examen.categoria?.nombre ?? undefined),
      categoria:
        typeof examen.categoria === 'string' ? examen.categoria : (examen.categoria?._id ?? ''),
    };
  }
}
