export interface ICategoria {
  _id?: string;
  nombre: string;
  sigla: string;
  empresa_Id: string;
  estado: 'Activo' | 'Borrado';
  usuarioCrea_id: string;
  fechaHora_Crea?: Date;
  usuarioModifica_id?: string;
  fechaHora_Modifica?: Date;
}
