export interface IEspecie {
  _id?: string;
  nombre: string;
  empresa_Id: string;
  estado: 'Activo' | 'Borrado';
  usuarioCrea_id: string;
  fechaHora_Crea?: Date;
  usuarioModifica_id?: string;
  fechaHora_Modifica?: Date;
}
