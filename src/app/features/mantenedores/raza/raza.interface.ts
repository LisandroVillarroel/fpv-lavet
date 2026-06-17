export interface IRaza {
  _id?: string;
  nombre: string;
  empresa_Id: string;
  especieNombre: string;
  estado: 'Activo' | 'Borrado';
  usuarioCrea_id?: string;
  fechaHora_Crea?: Date;
  usuarioModifica_id?: string;
  fechaHora_Modifica?: Date;
}
