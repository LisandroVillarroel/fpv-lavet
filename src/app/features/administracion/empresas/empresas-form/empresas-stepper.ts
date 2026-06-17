import { Component, EventEmitter, ViewChild, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';

import TituloComponentePopup from '@app/shared/ui/tituloComponentePopup';
import { Empresa } from '@features/administracion/empresas/empresasInterface';
import { EmpresasForm } from '@features/administracion/empresas/empresas-form/agrega-modifica/empresas-form';
import EmpresasPermisosMenuComponent from './empresas-permisos/empresas-permisos-menu';

@Component({
  selector: 'app-empresas-stepper',
  standalone: true,
  imports: [MatStepperModule, EmpresasForm, EmpresasPermisosMenuComponent, TituloComponentePopup],
  template: `<app-TituloComponentePopup
      [titulo]="modo === 'agregar' ? 'Agregar Empresa' : 'Editar Empresa'"
    />
    <mat-stepper
      linear
      orientation="horizontal"
      #stepper
      (selectionChange)="onStepSelectionChange($event, empresasFormCmp)"
    >
      <mat-step label="Datos de la empresa" [completed]="canAdvanceToPermisos(empresasFormCmp)">
        <app-empresas-form
          [data]="data"
          (formCompleted)="onEmpresaFormCompleted($event)"
          (cancelarForm)="onCancelarForm()"
          (avanzarPermisos)="onAvanzarPermisos()"
          #empresasFormCmp
        />
      </mat-step>
      <mat-step label="Permisos de Menú">
        @if (selectedIndex() === 1) {
          <app-empresas-permisos-menu [modo]="modo" [empresa]="empresaActual" />
        }
      </mat-step>
    </mat-stepper>`,
})
export default class EmpresasStepper {
  empresaGuardada = new EventEmitter<Empresa>();
  @ViewChild('stepper') stepper!: MatStepper;

  private readonly dialogRef = inject(MatDialogRef<EmpresasStepper>);
  readonly data = inject(MAT_DIALOG_DATA) as {
    modo: 'agregar' | 'editar';
    empresa?: Empresa;
  };

  modo = this.data.modo;
  empresaActual = this.data.empresa;
  readonly selectedIndex = signal(0);

  onStepSelectionChange(event: { selectedIndex: number }, empresasFormCmp: EmpresasForm) {
    const nextIndex =
      event.selectedIndex === 1 && !this.canAdvanceToPermisos(empresasFormCmp)
        ? 0
        : event.selectedIndex;
    this.selectedIndex.set(nextIndex);
  }

  canAdvanceToPermisos(empresasFormCmp: EmpresasForm | undefined): boolean {
    const formInvalido = empresasFormCmp?.isFormInvalid?.() ?? true;
    const tipoEmpresaFormulario = empresasFormCmp?.empresaForm?.tipoEmpresa?.().value?.();
    const tipoEmpresaPersistido = this.empresaActual?.tipoEmpresa;
    const tipoEmpresaPendienteDeGuardar =
      this.modo === 'editar' &&
      !!tipoEmpresaFormulario &&
      !!tipoEmpresaPersistido &&
      tipoEmpresaFormulario !== tipoEmpresaPersistido;
    const empresaPersistida = !!this.empresaActual?._id;

    return empresaPersistida && !formInvalido && !tipoEmpresaPendienteDeGuardar;
  }

  onAvanzarPermisos() {
    if (!this.canAdvanceToPermisos(undefined)) {
      return;
    }

    setTimeout(() => {
      this.stepper.next();
    });
  }

  onCancelarForm() {
    this.dialogRef.close('cancel');
  }

  onEmpresaFormCompleted(empresa: Empresa) {
    this.empresaActual = empresa;
    this.data.empresa = empresa;
    this.empresaGuardada.emit(empresa);
  }
}
