import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { environment } from '@envs/environment';

import { IUsuario, respuesta } from '@features/mantenedores/usuarios/usuariosInterface';

type ApiResponse<T> = {
  error: boolean;
  data: T;
  codigo: number;
  mensaje: string;
};

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private _http = inject(HttpClient);

  agregarUsuario(usuario: IUsuario): Observable<IUsuario> {
    return this._http
      .post<ApiResponse<IUsuario>>(`${environment.apiBaseUrl}/usuario`, usuario)
      .pipe(
        mergeMap((response) =>
          response.error
            ? throwError(() => new Error(response.mensaje || 'Error al crear usuario'))
            : [response.data],
        ),
      );
  }

  modificarUsuario(id: string, usuario: IUsuario): Observable<IUsuario> {
    return this._http
      .put<ApiResponse<IUsuario>>(`${environment.apiBaseUrl}/usuario/${id}`, usuario)
      .pipe(
        mergeMap((response) =>
          response.error
            ? throwError(() => new Error(response.mensaje || 'Error al modificar usuario'))
            : [response.data],
        ),
      );
  }

  agregarModificarUsuario(usuario: IUsuario): Observable<IUsuario> {
    return usuario._id ? this.modificarUsuario(usuario._id, usuario) : this.agregarUsuario(usuario);
  }

  obtenerUsuarios(empresaId: string): Observable<IUsuario[]> {
    console.log('Obteniendo usuarios para empresaId:', empresaId);
    return this._http
      .get<ApiResponse<IUsuario[]>>(`${environment.apiBaseUrl}/usuario/empresa/${empresaId}`)
      .pipe(
        mergeMap((response) =>
          response.error
            ? throwError(() => new Error(response.mensaje || 'Error al obtener usuarios'))
            : [response.data ?? []],
        ),
      );
  }

  obtenerTiposVeterinario(
    idEmpresa?: string,
  ): Observable<{ sigla: string; descripcion: string }[]> {
    const params = new HttpParams({ fromObject: idEmpresa ? { idEmpresa } : {} });
    return this._http
      .get<{
        data: { sigla: string; descripcion: string }[];
      }>(`${environment.apiBaseUrl}/tipo-veterinario/consultaTotal`, { params })
      .pipe(map((response) => response.data ?? []));
  }

  obtenerRegionesComunas(): Observable<
    Array<{
      region: string;
      comuna: Array<{ sigla: string; descripcion: string }>;
    }>
  > {
    return this._http
      .get<{
        data: Array<{
          region: string;
          comuna: Array<{ sigla: string; descripcion: string }>;
        }>;
      }>(`${environment.apiBaseUrl}/region-comuna/consultaTotal`)
      .pipe(map((response) => response.data ?? []));
  }

  // usuariosResource eliminado. Usar obtenerUsuarios(empresaId) para peticiones con parámetro.

  eliminarUsuario(id: string): Observable<any> {
    return this._http.delete(`${environment.apiBaseUrl}/usuario/${id}`);
  }
}
