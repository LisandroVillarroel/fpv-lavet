import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@envs/environment';
import { IRaza } from './raza.interface';

@Injectable({ providedIn: 'root' })
export class RazasService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl + '/raza';

  obtenerTodas(empresa_Id: string): Observable<IRaza[]> {
    return this.http
      .get<{ error: boolean; data: IRaza[] }>(`${this.baseUrl}?empresa_Id=${empresa_Id}`)
      .pipe(map((resp) => resp.data));
  }

  obtenerPorId(id: string): Observable<IRaza> {
    return this.http
      .get<{ error: boolean; data: IRaza }>(`${this.baseUrl}/${id}`)
      .pipe(map((resp) => resp.data));
  }

  crear(data: Partial<IRaza>): Observable<IRaza> {
    return this.http
      .post<{ error: boolean; data: IRaza }>(this.baseUrl, data)
      .pipe(map((resp) => resp.data));
  }

  actualizar(id: string, data: Partial<IRaza>): Observable<IRaza> {
    return this.http
      .put<{ error: boolean; data: IRaza }>(`${this.baseUrl}/${id}`, data)
      .pipe(map((resp) => resp.data));
  }

  eliminar(id: string): Observable<IRaza> {
    return this.http
      .delete<{ error: boolean; data: IRaza }>(`${this.baseUrl}/${id}`)
      .pipe(map((resp) => resp.data));
  }
}
