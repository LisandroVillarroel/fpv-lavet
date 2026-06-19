import { MenuItem } from '@shared/interfaces/usuario.interface';

export interface IEmpresaFormulario {
  _id?: string;
  rutEmpresa: string;
  razonSocial: string;
  nombreFantasia: string;
  direccion: string;
  region: string;
  comuna: string;
  telefono: string;
  emailEmpresa: string;
  contacto: {
    nombreContacto: string;
    emailContacto: string;
    telefonoContacto: string;
  };
  tipoEmpresa: 'Laboratorio' | 'Veterinaria' | 'Administración';
  copiarDatosOrigen?: boolean;
  MenuItem: MenuItem[];
  estadoEmpresa: 'Activo' | 'Bloqueado';
}
