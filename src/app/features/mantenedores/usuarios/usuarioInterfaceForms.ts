export interface IUsuarioFormulario {
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
  tipoUsuario: 'Laboratorio' | 'Veterinaria' | 'Propietario';
  veterinaria?: IVeterinariaFormulario;
  estadoUsuario: 'Activo' | 'Bloqueado' | 'Suspendido';
}

export interface IVeterinariaFormulario {
  tipoVeterinario: string; //(Dr. - Dra. - Tec.Vet., etc)
  rolVeterinario: string; //(administrador-veterinario)
  porcentajeComisionVeterinario: number;
}
