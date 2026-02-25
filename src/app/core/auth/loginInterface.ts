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

export interface MenuItem {
  _id?: string;
  despliegaNombre: string;
  iconoNombre: string;
  route?: string;
  tipoPermiso?: string;
  indeterminate?: boolean;
  seleccionado?: boolean;
  children?: MenuItem[];
}

export interface IVeterinaria {
  tipoVeterinario: string; //(Dr. - Dra. - Tec.Vet., etc)
  rolVeterinario: string; //(administrador-veterinario)
  porcentajeComisionVeterinario: number;
}

export const menuItems: MenuItem[] = [
  {
    _id: '1',
    iconoNombre: 'dashboard',
    despliegaNombre: 'Portada',
    route: 'portada',
    tipoPermiso: '',
    seleccionado: false,
    children: [],
  },
  {
    _id: '2',
    iconoNombre: 'emoji_objects',
    despliegaNombre: 'Proyectos',
    route: 'proyectos',
    tipoPermiso: '',
    seleccionado: false,
    children: [],
  },
  {
    _id: '3',
    iconoNombre: 'folder_open',
    despliegaNombre: 'Fichas',
    route: 'fichas',
    tipoPermiso: '',
    seleccionado: false,
    children: [],
  },
  {
    _id: '4',
    iconoNombre: 'format_list_bulleted',
    despliegaNombre: 'Mantenedores',
    route: 'mantenedores',
    tipoPermiso: '',
    seleccionado: false,
    children: [
      {
        _id: '4-1',
        iconoNombre: 'group',
        despliegaNombre: 'Usuarios',
        route: 'usuarios',
        tipoPermiso: '',
        seleccionado: false,
        children: [],
      },
      {
        _id: '4-2',
        iconoNombre: 'rule_settings',
        despliegaNombre: 'Estados',
        route: 'estados',
        tipoPermiso: '',
        seleccionado: false,
        children: [],
      },
      {
        _id: '4-3',
        iconoNombre: 'handshake',
        despliegaNombre: 'Clientes',
        route: 'cliente',
        tipoPermiso: '',
        seleccionado: false,
        children: [],
      },
    ],
  },
];
