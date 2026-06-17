import { Routes } from '@angular/router';

import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },

  {
    path: '',
    loadComponent: () => import('@core/layout/estructura/principal/principal'),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('@features/dashboard/dashboard'),
      },
      {
        path: 'mantenedores/usuarios',
        loadComponent: () => import('@features/mantenedores/usuarios/usuarios-list'),
      },
      {
        path: 'mantenedores/cliente',
        loadComponent: () => import('@features/laboratorio/administracion/clientes/clientes-list'),
      },
      {
        path: 'administracion/clientes',
        loadComponent: () => import('@features/laboratorio/administracion/clientes/clientes-list'),
      },
      {
        path: 'administracion/empresas',
        loadComponent: () => import('@features/administracion/empresas/empresas-list'),
      },
      {
        path: 'administracion/usuarios',
        loadComponent: () => import('@features/administracion/usuarios/usuarios-list'),
      },
      {
        path: 'administracion/menus',
        loadComponent: () => import('@features/administracion/menu/menu-list'),
      },
      {
        path: 'mantenedores/especie',
        loadComponent: () => import('@features/mantenedores/especies/especies-list'),
      },
      {
        path: 'mantenedores/categoria',
        loadComponent: () => import('@features/mantenedores/categorias/categorias-list'),
      },
      {
        path: 'mantenedores/examen',
        loadComponent: () => import('@features/mantenedores/examenes/examenes-list'),
      },
      {
        path: 'mantenedores/raza',
        loadComponent: () => import('@features/mantenedores/raza/razas-list'),
      },
      {
        path: 'datoPersonal/datosPersonales',
        loadComponent: () =>
          import('@features/dato-personal/modifica-datos-personales/modifica-datos-personales').then(
            (m) => m.ModificaDatosPersonales,
          ),
      },
      {
        path: 'datoPersonal/cambioContrasena',
        loadComponent: () =>
          import('@features/dato-personal/cambio-contrasena/cambio-contrasena').then(
            (m) => m.CambioContrasena,
          ),
      },
    ],
  },

  /*{
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@features/dashboard/dashboard').then((m) => m.Dashboard),
  },
  */
  {
    path: 'sin-acceso',
    loadComponent: () =>
      import('@features/access/access-denied/access-denied').then((m) => m.AccessDenied),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
