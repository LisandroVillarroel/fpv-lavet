import { signal, WritableSignal } from '@angular/core';
// Hay dos porque indeterminate y seleccionado deben estar con signal para poder cambiar los seleccionados
export interface MenuItem {
  id: number;
  iconoNombre: string;
  despliegaNombre: string;
  route?: string;
  tipoPermiso?: string;
  subItems?: MenuItem[];
  indeterminate: WritableSignal<boolean>;
  seleccionado: WritableSignal<boolean>;
}

/*
export const menuItems: MenuItem[] = [
  {
    iconoNombre: 'dashboard',
    despliegaNombre: 'Portada',
    route: 'portada',
  },
  {
    iconoNombre: 'emoji_objects',
    despliegaNombre: 'Proyectos',
    route: 'proyectos',
  },
  {
    iconoNombre: 'folder_open',
    despliegaNombre: 'Fichas',
    route: 'fichas',
  },
  {
    iconoNombre: 'format_list_bulleted',
    despliegaNombre: 'Mantenedores',
    route: 'mantenedores',
    subItems: [
      {
        iconoNombre: 'group',
        despliegaNombre: 'Usuarios',
        route: 'usuarios',
      },
      {
        iconoNombre: 'rule_settings',
        despliegaNombre: 'Estados',
        route: 'estados',
      },
      {
        iconoNombre: 'handshake',
        despliegaNombre: 'Clientes',
        route: 'cliente',
      },
    ],
  },
];
*/
