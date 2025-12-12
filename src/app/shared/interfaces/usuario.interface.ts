export interface IUsuarioEntidad {
  idEmpresa: string;
  rutEmpresa: string;
  razonSocial: string;
  nombreFantasia: string;
  menu_Id: string;
  tipoEmpresa?: 'Laboratorio' | 'Veterinaria' | 'Usuario';
}

export interface MenuItem {
  _id?: string;
  despliegaNombre: string;
  iconoNombre: string;
  route?: string;
  tipoPermiso?: string;
  indeterminate?: boolean;
  seleccionado?: boolean;
  children?: MenuItem[];
}

export interface IUsuario {
  _id?: string;
  usuario?: string;
  contrasena?: string;
  rutUsuario: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  usuarioEntidad?: IUsuarioEntidad;
  tipoUsuario?: 'Laboratorio' | 'Veterinaria' | 'Usuario';
  MenuItem?: MenuItem[];
  usuarioCrea_id?: string;
  usuarioModifica_id?: string;
  estadoUsuario?: 'Activo' | 'Inactivo';
  estado?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface AuthSession {
  user: IUsuario;
  tokens: AuthTokens;
}
