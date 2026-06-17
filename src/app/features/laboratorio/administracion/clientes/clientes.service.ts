import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UsuarioService } from '@features/mantenedores/usuarios/usuarios.service';
import { environment } from '@envs/environment';
import { ICliente } from '@features/laboratorio/administracion/clientes/clientesInterface';

type ApiResponse<T> = {
  error: boolean;
  data: T;
  codigo: number;
  mensaje: string;
};

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly http = inject(HttpClient);
  private readonly usuarioService = inject(UsuarioService);

  obtenerClientes(empresaId: string): Observable<ICliente[]> {
    return this.http
      .get<ApiResponse<ICliente[]>>(`${environment.apiBaseUrl}/cliente/empresa/${empresaId}`)
      .pipe(map((response) => response.data ?? []));
  }

  obtenerClientePorId(id: string): Observable<ICliente | null> {
    return this.http
      .get<ApiResponse<ICliente | null>>(`${environment.apiBaseUrl}/cliente/${id}`)
      .pipe(map((response) => response.data ?? null));
  }

  agregarCliente(cliente: ICliente): Observable<ICliente> {
    return this.http
      .post<ApiResponse<ICliente>>(`${environment.apiBaseUrl}/cliente`, this.mapCliente(cliente))
      .pipe(map((response) => response.data));
  }

  modificarCliente(id: string, cliente: ICliente): Observable<ICliente> {
    return this.http
      .put<
        ApiResponse<ICliente>
      >(`${environment.apiBaseUrl}/cliente/${id}`, this.mapCliente(cliente))
      .pipe(map((response) => response.data));
  }

  agregarModificarCliente(cliente: ICliente): Observable<ICliente> {
    return cliente._id ? this.modificarCliente(cliente._id, cliente) : this.agregarCliente(cliente);
  }

  obtenerRegionesComunas() {
    return this.usuarioService.obtenerRegionesComunas();
  }

  eliminarCliente(id: string): Observable<unknown> {
    return this.http.delete(`${environment.apiBaseUrl}/cliente/${id}`);
  }

  private mapCliente(cliente: ICliente): ICliente {
    return {
      ...cliente,
      tipoUsuario: 'Propietario',
    };
  }
}
