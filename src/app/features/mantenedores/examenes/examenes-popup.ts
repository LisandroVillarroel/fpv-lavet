import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ExamenForm } from './examen-form';

@Component({
  selector: 'app-examenes-popup',
  standalone: true,
  imports: [ExamenForm],
  template: ` <app-examen-form [data]="data" /> `,
})
export class ExamenesPopupComponent {
  dialogRef = inject(MatDialogRef<ExamenesPopupComponent>);
  data = inject(MAT_DIALOG_DATA);
}
