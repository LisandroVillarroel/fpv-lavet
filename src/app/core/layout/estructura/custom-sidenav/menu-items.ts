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

export const menuItems: MenuItem[] = [
  {
    _id: '1',
    iconoNombre: 'portada',
    despliegaNombre: 'Portada',
    route: 'portada',
    tipoPermiso: '',
    seleccionado: false,
    children: [],
  },
  {
    _id: '2',
    iconoNombre: 'proyecto',
    despliegaNombre: 'Proyectos',
    route: 'proyectos',
    tipoPermiso: '',
    seleccionado: false,
    children: [],
  },
  {
    _id: '3',
    iconoNombre: 'ficha',
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
        iconoNombre: 'usuario',
        despliegaNombre: 'Usuarios',
        route: 'usuarios',
        tipoPermiso: '',
        seleccionado: false,
        children: [],
      },
      {
        _id: '4-2',
        iconoNombre: 'estado',
        despliegaNombre: 'Estados',
        route: 'estados',
        tipoPermiso: '',
        seleccionado: false,
        children: [],
      },
      {
        _id: '4-3',
        iconoNombre: 'cliente',
        despliegaNombre: 'Clientes',
        route: 'cliente',
        tipoPermiso: '',
        seleccionado: false,
        children: [],
      },
    ],
  },
];
