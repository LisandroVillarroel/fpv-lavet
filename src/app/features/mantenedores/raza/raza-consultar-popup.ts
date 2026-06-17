import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { IRaza } from './raza.interface';

@Component({
  selector: 'app-raza-consultar-popup',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatListModule],
  template: `
    <h2 mat-dialog-title>Consultar Raza</h2>
    <mat-dialog-content>
      <mat-list>
        <mat-list-item><strong>Nombre:</strong>&nbsp;{{ data.nombre }}</mat-list-item>
        <mat-list-item><strong>Especie:</strong>&nbsp;{{ data.especieNombre }}</mat-list-item>
        <mat-list-item><strong>Estado:</strong>&nbsp;{{ data.estado }}</mat-list-item>
      </mat-list>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button color="primary" (click)="cerrar()">Cerrar</button>
    </mat-dialog-actions>
  `,
})
export class RazaConsultarPopupComponent {
  readonly dialogRef = inject(MatDialogRef<RazaConsultarPopupComponent>);
  readonly data = inject(MAT_DIALOG_DATA) as IRaza;

  cerrar() {
    this.dialogRef.close();
  }
}
