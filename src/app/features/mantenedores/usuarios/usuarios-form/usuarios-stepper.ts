import { Component } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { UsuariosForm } from './agrega-modifica/usuarios-form';

@Component({
  selector: 'app-usuarios-stepper',
  standalone: true,
  imports: [MatStepperModule, UsuariosForm],
  template: `
    <mat-vertical-stepper linear>
      <mat-step label="Datos de Usuario">
        <app-usuarios-form (formCompleted)="goToNextStep()" />
      </mat-step>
      <mat-step label="Permisos de Menú">
        <!-- <app-usuarios-permisos-menu />-->
      </mat-step>
    </mat-vertical-stepper>
  `,
})
export class UsuariosStepper {
  goToNextStep() {
    // lógica para avanzar el stepper
  }
}
