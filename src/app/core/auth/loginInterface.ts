import { MenuItem } from '@core/layout/estructura/custom-sidenav/menu-items';

export interface autenticaInterface {
  usuario: string;
}
export interface loginInterface {
  user: {
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
    region?: string;
    comuna?: string;
    MenuItem?: MenuItem[];
    tipoUsuario?: 'Laboratorio' | 'Veterinaria' | 'Propietario';
    veterinaria?: IVeterinaria;
    usuarioEmpresa?: IUsuarioEmpresa;
    estadoUsuario?: 'Activo' | 'Bloqueado' | 'Suspendido';
    estado?: string;
    usuarioCrea_id?: string;
    fechaHora_Crea?: string;
    usuarioModifica_id?: string;
    fechaHora_Modifica?: string;
  };
}

export interface respuesta {
  error: string;
  data: loginInterface;
  codigo: number;
  mensaje: string;
}

export interface IUsuarioEmpresa {
  Empresa_Id: string;
  rutEmpresa: string;
  razonSocial: string;
  nombreFantasia: string;
  menu_Id: string;
  tipoEmpresa?: 'Laboratorio' | 'Veterinaria' | 'Usuario';
}

export interface IVeterinaria {
  tipoVeterinario: string; //(Dr. - Dra. - Tec.Vet., etc)
  rolVeterinario: string; //(administrador-veterinario)
  porcentajeComisionVeterinario: number;
}
