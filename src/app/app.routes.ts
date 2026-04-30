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
