export interface IUsuarioEmpresa {
  empresaId: string;
  rutEmpresa: string;
  razonSocial: string;
  nombreFantasia: string;
  tipoEmpresa?: 'Laboratorio' | 'Veterinaria' | 'Usuario';
  MenuItem?: MenuItem[];
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
  temaColorSistema?: string;
  rutUsuario: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  empresa?: IUsuarioEmpresa;
  tipoUsuario?: 'Laboratorio' | 'Veterinaria' | 'Usuario';
  veterinaria?: IVeterinaria;
  MenuItem?: MenuItem[];
  usuarioCrea_id?: string;
  usuarioModifica_id?: string;
  estadoUsuario?: 'Activo' | 'Inactivo';
  estado?: string;
}

export interface IVeterinaria {
  tipoVeterinario: string; //(Dr. - Dra. - Tec.Vet., etc)
  rolVeterinario: string; //(administrador-veterinario)
  porcentajeComisionVeterinario: number;
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
