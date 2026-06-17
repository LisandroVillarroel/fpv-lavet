export interface IExamen {
  _id?: string;
  codigoExamen: number;
  codigoInterno: number;
  nombre: string;
  sigla: string;
  precio: number;
  tiempoPreparacion: string;
  categoria: string;
  empresa_Id: string;
  usuarioCrea_id: string;
  fechaHora_Crea?: Date;
  usuarioModifica_id?: string;
  fechaHora_Modifica?: Date;
  estado: 'Activo' | 'Borrado';
}
