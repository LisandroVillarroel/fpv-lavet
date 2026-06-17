import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@envs/environment';
import { ApiResponse, IMenu } from './menu.interface';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/menu`;

  obtenerMenus(): Observable<IMenu[]> {
    return this.http
      .get<ApiResponse<IMenu[]>>(`${this.baseUrl}`)
      .pipe(map((response) => response.data ?? []));
  }

  crearMenu(payload: Partial<IMenu>): Observable<IMenu> {
    return this.http
      .post<ApiResponse<IMenu>>(this.baseUrl, payload)
      .pipe(map((response) => response.data));
  }

  actualizarMenu(id: string, payload: Partial<IMenu>): Observable<IMenu> {
    return this.http
      .put<ApiResponse<IMenu>>(`${this.baseUrl}/${id}`, payload)
      .pipe(map((response) => response.data));
  }

  eliminarMenu(id: string): Observable<IMenu> {
    return this.http
      .delete<ApiResponse<IMenu>>(`${this.baseUrl}/${id}`)
      .pipe(map((response) => response.data));
  }
}
