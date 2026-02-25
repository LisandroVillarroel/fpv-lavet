import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },

  {
    path: '',
    loadComponent: () => import('@core/layout/estructura/principal/principal'),
    //  canActivate: [privadoGuard()],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('@features/dashboard/dashboard.component'),
      },
    ],
    //loadComponent: () => import('./componentes/portada/portada.component'),
  },

  /*{
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  */
  {
    path: 'sin-acceso',
    loadComponent: () =>
      import('./features/access/access-denied/access-denied.component').then(
        (m) => m.AccessDeniedComponent,
      ),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
