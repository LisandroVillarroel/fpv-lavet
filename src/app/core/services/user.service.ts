import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@envs/environment';
import { IUsuario } from '@shared/interfaces/usuario.interface';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type ApiResponse<T> = {
  error: boolean;
  data: T;
  codigo: number;
  mensaje: string;
};

type PasswordChangeResponse = ApiResponse<null>;

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly _http = inject(HttpClient);

  /**
   * Obtiene el usuario autenticado usando el token actual
   */
  getProfile(): Observable<IUsuario> {
    return this._http.get<IUsuario>(`${environment.apiBaseUrl}/auth/me`);
  }

  updateThemeColor(userId: string, temaColorSistema: string): Observable<ApiResponse<IUsuario>> {
    return this._http.put<ApiResponse<IUsuario>>(
      `${environment.apiBaseUrl}/usuario/${userId}/tema-color`,
      { temaColorSistema },
    );
  }

  updateProfile(
    userId: string,
    payload: Partial<IUsuario> & { fotoBase64?: string; [key: string]: unknown },
  ): Observable<IUsuario> {
    return this._http
      .put<ApiResponse<IUsuario>>(`${environment.apiBaseUrl}/usuario/${userId}`, payload)
      .pipe(map((response) => response.data));
  }

  changePassword(
    contrasenaActual: string,
    nuevaContrasena: string,
  ): Observable<PasswordChangeResponse> {
    return this._http.post<PasswordChangeResponse>(
      `${environment.apiBaseUrl}/auth/change-password`,
      {
        contrasenaActual,
        nuevaContrasena,
      },
    );
  }
}
