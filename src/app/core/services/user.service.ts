import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { IUsuario } from '../../shared/interfaces/usuario.interface';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly _http = inject(HttpClient);

  /**
   * Obtiene el usuario autenticado usando el token actual
   */
  getProfile(): Observable<IUsuario> {
    return this._http.get<IUsuario>(`${environment.apiBaseUrl}/auth/me`);
  }
}
