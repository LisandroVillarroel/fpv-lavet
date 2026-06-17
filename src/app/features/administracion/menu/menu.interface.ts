import { MenuItem } from '@shared/interfaces/usuario.interface';

export type MenuNombre = 'Laboratorio' | 'Veterinaria' | 'Propietario' | 'Administración';
export type MenuEstado = 'Activo' | 'Inactivo';

export interface IMenu {
  _id?: string;
  nombreMenu: MenuNombre;
  menuItem: MenuItem[];
  estado: MenuEstado;
  usuarioCrea_id?: string;
  usuarioModifica_id?: string;
  fechaHora_crea?: Date | string;
  fechaHora_modifica?: Date | string;
}

export interface ApiResponse<T> {
  error: boolean;
  data: T;
  codigo: number;
  mensaje: string;
}
