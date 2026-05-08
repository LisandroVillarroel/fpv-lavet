import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EspecieForm } from './especie-form';

@Component({
  selector: 'app-especies-popup',
  standalone: true,
  imports: [EspecieForm],
  template: ` <app-especie-form [data]="data" /> `,
})
export class EspeciesPopupComponent {
  dialogRef = inject(MatDialogRef<EspeciesPopupComponent>);
  data = inject(MAT_DIALOG_DATA);
}
