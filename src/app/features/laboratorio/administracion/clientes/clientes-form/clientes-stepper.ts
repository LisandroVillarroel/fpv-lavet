import { Component, EventEmitter, ViewChild, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';

import TituloComponentePopup from '@app/shared/ui/tituloComponentePopup';
import { ICliente } from '@features/laboratorio/administracion/clientes/clientesInterface';
import { ClientesForm } from '@features/laboratorio/administracion/clientes/clientes-form/agrega-modifica/clientes-form';

@Component({
  selector: 'app-clientes-stepper',
  standalone: true,
  imports: [MatStepperModule, ClientesForm, TituloComponentePopup],
  template: `<app-TituloComponentePopup
      [titulo]="modo === 'agregar' ? 'Agregar Cliente' : 'Editar Cliente'"
    />
    <mat-stepper linear orientation="horizontal" #stepper>
      <mat-step label="Datos del cliente">
        <app-clientes-form
          [data]="data"
          (formCompleted)="onClienteFormCompleted($event)"
          (cancelarForm)="onCancelarForm()"
        />
      </mat-step>
    </mat-stepper>`,
})
export default class ClientesStepper {
  clienteGuardado = new EventEmitter<ICliente>();

  @ViewChild('stepper') stepper!: MatStepper;

  private readonly dialogRef = inject(MatDialogRef<ClientesStepper>);
  readonly data = inject(MAT_DIALOG_DATA) as {
    modo: 'agregar' | 'editar';
    cliente?: ICliente;
    empresaId?: string;
    usuarioLogueado?: { _id?: string };
    empresa?: {
      empresaId: string;
      rutEmpresa: string;
      razonSocial: string;
      nombreFantasia: string;
      tipoEmpresa?: 'Laboratorio' | 'Veterinaria' | 'Administración';
    };
  };

  modo = this.data.modo;

  onCancelarForm() {
    this.dialogRef.close('cancel');
  }

  onClienteFormCompleted(cliente: ICliente) {
    this.clienteGuardado.emit(cliente);
    this.dialogRef.close(cliente);
  }
}
