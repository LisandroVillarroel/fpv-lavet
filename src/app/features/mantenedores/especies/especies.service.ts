import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IEspecie } from './especie.interface';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@envs/environment';

@Injectable({ providedIn: 'root' })
export class EspeciesService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl + '/especie';

  getAll(empresa_Id: string): Observable<IEspecie[]> {
    return this.http
      .get<{ error: boolean; data: IEspecie[] }>(`${this.baseUrl}?empresa_Id=${empresa_Id}`)
      .pipe(map((resp) => resp.data));
  }

  getById(id: string): Observable<IEspecie> {
    return this.http.get<IEspecie>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<IEspecie>): Observable<Partial<IEspecie>> {
    // Permitir crear sin exigir campos obligatorios del modelo completo
    return this.http.post<Partial<IEspecie>>(this.baseUrl, data);
  }

  update(id: string, data: Partial<IEspecie>): Observable<IEspecie> {
    return this.http.put<IEspecie>(`${this.baseUrl}/${id}`, data);
  }

  remove(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
