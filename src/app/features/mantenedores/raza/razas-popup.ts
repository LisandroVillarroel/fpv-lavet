import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RazaForm } from './raza-form';

@Component({
  selector: 'app-razas-popup',
  standalone: true,
  imports: [RazaForm],
  template: `<app-raza-form [data]="data" />`,
})
export class RazasPopupComponent {
  readonly dialogRef = inject(MatDialogRef<RazasPopupComponent>);
  readonly data = inject(MAT_DIALOG_DATA);
}
