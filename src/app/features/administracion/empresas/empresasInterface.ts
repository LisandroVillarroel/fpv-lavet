import { MenuItem } from '@shared/interfaces/usuario.interface';

export interface EmpresaContacto {
  nombreContacto: string;
  emailContacto: string;
  telefonoContacto: string;
}

export interface Empresa {
  _id?: string;
  rutEmpresa: string;
  razonSocial: string;
  nombreFantasia: string;
  direccion: string;
  region: string;
  comuna: string;
  telefono: string;
  emailEmpresa: string;
  contacto: EmpresaContacto;
  tipoEmpresa: 'Laboratorio' | 'Veterinaria' | 'Administración';
  MenuItem: MenuItem[];
  estadoEmpresa: 'Activo' | 'Bloqueado';
  usuarioCrea?: string;
  usuarioModifica?: string;
  fechaHora_crea?: Date | string;
  fechaHora_modifica?: Date | string;
}

export interface RespuestaEmpresas {
  error: boolean;
  data: Empresa[];
  codigo: number;
  mensaje: string;
}
