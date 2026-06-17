import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@envs/environment';
import { ICategoria } from './categoria.interface';

@Injectable({ providedIn: 'root' })
export class CategoriasService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl + '/categoria';

  getAll(empresa_Id: string): Observable<ICategoria[]> {
    return this.http
      .get<{ error: boolean; data: ICategoria[] }>(`${this.baseUrl}?empresa_Id=${empresa_Id}`)
      .pipe(map((resp) => resp.data));
  }

  getById(id: string): Observable<ICategoria> {
    return this.http.get<ICategoria>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<ICategoria>): Observable<Partial<ICategoria>> {
    return this.http.post<Partial<ICategoria>>(this.baseUrl, data);
  }

  update(id: string, data: Partial<ICategoria>): Observable<ICategoria> {
    return this.http.put<ICategoria>(`${this.baseUrl}/${id}`, data);
  }

  remove(id: string): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
