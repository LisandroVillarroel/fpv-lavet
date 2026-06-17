export interface IClienteFormulario {
  _id?: string;
  usuario: string;
  contrasena: string;
  confirmarContrasena: string;
  rutUsuario: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  telefono: string;
  email: string;
  direccion: string;
  region: string;
  comuna: string;
  tipoUsuario: 'Propietario';
  estadoUsuario: 'Activo' | 'Bloqueado' | 'Suspendido';
}
