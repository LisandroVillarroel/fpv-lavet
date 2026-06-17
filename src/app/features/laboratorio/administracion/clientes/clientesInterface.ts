import { IUsuarioEmpresa } from '@features/mantenedores/usuarios/usuariosInterface';
import { MenuItem } from '@shared/interfaces/usuario.interface';

export interface ICliente {
  _id?: string;
  usuario: string;
  contrasena?: string;
  rutUsuario: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  telefono: string;
  email: string;
  direccion: string;
  region: string;
  comuna: string;
  MenuItem?: MenuItem[];
  tipoUsuario: 'Propietario';
  fotoUrl?: string;
  empresa?: IUsuarioEmpresa;
  estadoUsuario: 'Activo' | 'Bloqueado' | 'Suspendido';
  estado?: string;
  usuarioCrea_id?: string;
  fechaHora_Crea?: string;
  usuarioModifica_id?: string;
  fechaHora_Modifica?: string;
}

export interface RespuestaClientes {
  error: string;
  data: [];
  codigo: number;
  mensaje: string;
}
