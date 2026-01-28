import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'riesgos',
  },
  {
    path: 'riesgos',
    loadComponent: () =>
      import('./riesgos').then((m) => m.default),
    data: {
      breadcrumb: 'Riesgos abiertos',
    },
  },
  {
    path: 'presupuesto',
    loadComponent: () =>
      import('./presupuesto').then((m) => m.default),
    data: {
      breadcrumb: 'Presupuesto vs. gasto',
    },
  },
];

export default routes;
