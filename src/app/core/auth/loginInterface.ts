import { MenuItemData } from '@core/layout/estructura/custom-sidenav/menu-items';

export interface autenticaInterface {
  usuario: string;
}
export interface loginInterface {
  usuarioLogin: {
    usuario: string;
    rutEmpresa: string;
    rut: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    nombreFoto: string;
    cargo: string;
    accessToken: string;
  };
  menuItem: MenuItemData[];
  menuUsuario: [];
}

export interface respuesta {
  error: string;
  data: loginInterface;
  codigo: number;
  mensaje: string;
}

export interface empresaConectadaI {
  empresa_Id: string;
  rutEmpresa: string;
  razonSocial: string;
  nombreFantasia: string;
  menu_Id: string;
  tipoEmpresa: string; // Administrador, Cliente, Laboratorio
}

export interface UsuarioEmpresaI {
  empresa_Id: string;
  rutEmpresa: string;
  razonSocial: string;
  nombrefatasia: string;
}

export interface IUsuarioReseteaContrasena {
  usuario: string;
  contrasena: string;
}
