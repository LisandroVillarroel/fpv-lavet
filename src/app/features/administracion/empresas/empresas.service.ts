import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@envs/environment';
import { UsuarioService } from '@features/mantenedores/usuarios/usuarios.service';
import { Empresa } from '@features/administracion/empresas/empresasInterface';
import { MenuItem } from '@shared/interfaces/usuario.interface';

type ApiResponse<T> = {
  error: boolean;
  data: T;
  codigo: number;
  mensaje: string;
};

type MenuResponse = {
  _id?: string;
  nombreMenu: 'Laboratorio' | 'Veterinaria' | 'Administración';
  menuItem: MenuItem[];
};

const extractMenuItems = (response: ApiResponse<MenuResponse | null>): MenuItem[] => {
  if (response.error) {
    return [];
  }

  const data = response.data as
    | (MenuResponse & { MenuItem?: MenuItem[]; _doc?: { menuItem?: MenuItem[]; MenuItem?: MenuItem[] } })
    | MenuItem[]
    | null;

  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== 'object') {
    return [];
  }

  if (Array.isArray(data.menuItem)) {
    return data.menuItem;
  }

  if (Array.isArray(data.MenuItem)) {
    return data.MenuItem;
  }

  if (Array.isArray(data._doc?.menuItem)) {
    return data._doc.menuItem;
  }

  if (Array.isArray(data._doc?.MenuItem)) {
    return data._doc.MenuItem;
  }

  return [];
};

@Injectable({ providedIn: 'root' })
export class EmpresasService {
  private readonly http = inject(HttpClient);
  private readonly usuarioService = inject(UsuarioService);

  obtenerEmpresas(): Observable<Empresa[]> {
    return this.http
      .get<ApiResponse<Empresa[]>>(`${environment.apiBaseUrl}/empresa/consultaTotal`)
      .pipe(map((response) => response.data ?? []));
  }

  obtenerEmpresaPorId(id: string): Observable<Empresa | null> {
    return this.http
      .get<ApiResponse<Empresa | null>>(`${environment.apiBaseUrl}/empresa/consulta/${id}`)
      .pipe(map((response) => response.data ?? null));
  }

  agregarEmpresa(empresa: Empresa): Observable<Empresa> {
    return this.http
      .post<ApiResponse<Empresa>>(`${environment.apiBaseUrl}/empresa`, empresa)
      .pipe(map((response) => response.data));
  }

  modificarEmpresa(id: string, empresa: Empresa): Observable<Empresa> {
    return this.http
      .put<ApiResponse<Empresa>>(`${environment.apiBaseUrl}/empresa/modificar/${id}`, empresa)
      .pipe(map((response) => response.data));
  }

  agregarModificarEmpresa(empresa: Empresa): Observable<Empresa> {
    return empresa._id ? this.modificarEmpresa(empresa._id, empresa) : this.agregarEmpresa(empresa);
  }

  modificarMenuEmpresa(id: string, MenuItem: MenuItem[]): Observable<Empresa> {
    return this.http
      .put<
        ApiResponse<Empresa>
      >(`${environment.apiBaseUrl}/empresa/modificar-menu/${id}`, { MenuItem })
      .pipe(map((response) => response.data));
  }

  eliminarEmpresa(id: string): Observable<Empresa> {
    return this.http
      .put<ApiResponse<Empresa>>(`${environment.apiBaseUrl}/empresa/eliminar/${id}`, {})
      .pipe(map((response) => response.data));
  }

  obtenerMenuPorTipo(tipoEmpresa?: Empresa['tipoEmpresa']): Observable<MenuItem[]> {
    const normalizedTipoEmpresa = tipoEmpresa?.trim();
    console.log('Obteniendo menú para tipoEmpresa:', normalizedTipoEmpresa);

    if (!normalizedTipoEmpresa) {
      return of([]);
    }

    console.log('Realizando solicitud HTTP para menú con tipoEmpresa:', normalizedTipoEmpresa);
    return this.http
      .get<ApiResponse<MenuResponse | null>>(
        `${environment.apiBaseUrl}/menu/${encodeURIComponent(normalizedTipoEmpresa)}`,
      )
      .pipe(
        map((response) => {
          console.log('Respuesta cruda del menú por tipo:', response);
          const menuItems = extractMenuItems(response);
          console.log('MenuItems extraídos:', menuItems);
          return menuItems;
        }),
      );
  }

  obtenerRegionesComunas() {
    return this.usuarioService.obtenerRegionesComunas();
  }
}
