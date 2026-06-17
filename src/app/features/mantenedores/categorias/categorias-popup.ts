import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CategoriaForm } from './categoria-form';

@Component({
  selector: 'app-categorias-popup',
  standalone: true,
  imports: [CategoriaForm],
  template: ` <app-categoria-form [data]="data" /> `,
})
export class CategoriasPopupComponent {
  dialogRef = inject(MatDialogRef<CategoriasPopupComponent>);
  data = inject(MAT_DIALOG_DATA);
}
