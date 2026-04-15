import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@envs/environment';

import { IUsuario, respuesta } from './usuariosInterface';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private _http = inject(HttpClient);

  agregarModificarUsuario(usuario: IUsuario): Observable<any> {
    return this._http.post(`${environment.apiBaseUrl}/usuario`, usuario);
  }

  obtenerUsuarios(empresaId: string): Observable<IUsuario[]> {
    console.log('Obteniendo usuarios para empresaId:', empresaId);
    return this._http.get<IUsuario[]>(`${environment.apiBaseUrl}/usuario/${empresaId}`);
  }

  // usuariosResource eliminado. Usar obtenerUsuarios(empresaId) para peticiones con parámetro.

  eliminarUsuario(id: string): Observable<any> {
    return this._http.delete(`${environment.apiBaseUrl}/usuario/${id}`);
  }
}
