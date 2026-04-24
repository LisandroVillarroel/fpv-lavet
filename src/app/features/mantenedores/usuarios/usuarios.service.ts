import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@envs/environment';

import { IUsuario, respuesta } from '@features/mantenedores/usuarios/usuariosInterface';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private _http = inject(HttpClient);

  agregarModificarUsuario(usuario: IUsuario): Observable<any> {
    return this._http.post(`${environment.apiBaseUrl}/usuario`, usuario);
  }

  obtenerUsuarios(empresaId: string): Observable<IUsuario[]> {
    console.log('Obteniendo usuarios para empresaId:', empresaId);
    return this._http.get<IUsuario[]>(`${environment.apiBaseUrl}/usuario/empresa/${empresaId}`);
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

  // usuariosResource eliminado. Usar obtenerUsuarios(empresaId) para peticiones con parámetro.

  eliminarUsuario(id: string): Observable<any> {
    return this._http.delete(`${environment.apiBaseUrl}/usuario/${id}`);
  }
}
