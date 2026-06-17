import { Component, EventEmitter, ViewChild, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';

import TituloComponentePopup from '@app/shared/ui/tituloComponentePopup';
import { IUsuario } from '@features/mantenedores/usuarios/usuariosInterface';
import { MenuItem } from '@shared/interfaces/usuario.interface';

import { UsuariosForm } from './agrega-modifica/usuarios-form';
import { UsuariosPermisosMenuComponent } from './usuarios-permisos/usuarios-permisos-menu';

type EmpresaSeleccionable = {
  empresaId: string;
  rutEmpresa: string;
  razonSocial: string;
  nombreFantasia: string;
  tipoEmpresa?: 'Laboratorio' | 'Veterinaria' | 'Administración';
  MenuItem?: MenuItem[];
};

@Component({
  selector: 'app-administracion-usuarios-stepper',
  standalone: true,
  imports: [MatStepperModule, UsuariosForm, UsuariosPermisosMenuComponent, TituloComponentePopup],
  template: `<app-TituloComponentePopup
      [titulo]="modo === 'agregar' ? 'Agregar Usuario' : 'Editar Usuario'"
    />
    <mat-stepper
      linear
      orientation="horizontal"
      #stepper
      (selectionChange)="onStepSelectionChange($event, usuariosFormCmp)"
    >
      <mat-step label="Datos de Usuario">
        <app-usuarios-form
          [data]="stepperData()"
          (formCompleted)="onUsuarioFormCompleted($event)"
          (cancelarForm)="onCancelarForm()"
          (avanzarPermisos)="onAvanzarPermisos()"
          #usuariosFormCmp
        />
      </mat-step>
      <mat-step label="Permisos de Menú">
        <app-usuarios-permisos-menu [data]="stepperData()" />
      </mat-step>
    </mat-stepper>`,
})
export default class UsuariosStepper {
  usuarioGuardado = new EventEmitter<IUsuario>();
  private usuarioGuardadoValue: IUsuario | null = null;

  @ViewChild('stepper') stepper!: MatStepper;

  private readonly dialogRef = inject(MatDialogRef<UsuariosStepper>);
  readonly data = inject(MAT_DIALOG_DATA) as {
    modo: 'agregar' | 'editar';
    usuario?: IUsuario;
    empresaId?: string;
    usuarioLogueado?: { _id?: string };
    empresa?: EmpresaSeleccionable;
  };
  readonly stepperData = signal({ ...this.data });

  modo = this.stepperData().modo;

  onStepSelectionChange(event: { selectedIndex: number }, usuariosFormCmp: UsuariosForm) {
    if (event.selectedIndex !== 1) {
      return;
    }

    const formInvalido = usuariosFormCmp?.isFormInvalid?.() ?? true;
    const empresaFormulario = usuariosFormCmp?.usuarioForm?.empresaId?.().value?.() ?? '';
    const empresaPersistida = this.stepperData().empresaId ?? '';
    const empresaPendienteDeGuardar =
      this.modo === 'editar' && !!empresaFormulario && empresaFormulario !== empresaPersistida;

    if (this.modo === 'agregar' && (!this.usuarioGuardadoValue || formInvalido)) {
      setTimeout(() => {
        this.stepper.selectedIndex = 0;
      });
      return;
    }

    if (this.modo === 'editar' && (formInvalido || empresaPendienteDeGuardar)) {
      setTimeout(() => {
        this.stepper.selectedIndex = 0;
      });
    }
  }

  onAvanzarPermisos() {
    setTimeout(() => {
      this.stepper.next();
    });
  }

  onCancelarForm() {
    this.cerrar();
  }

  onUsuarioFormCompleted(usuario: IUsuario & { empresa?: EmpresaSeleccionable }) {
    this.usuarioGuardado.emit(usuario);
    this.usuarioGuardadoValue = usuario;
    this.stepperData.update((currentData) => ({
      ...currentData,
      usuario,
      empresa: usuario.empresa ?? currentData.empresa,
      empresaId: usuario.empresa?.empresaId ?? currentData.empresaId,
    }));
  }

  cerrar() {
    this.dialogRef.close('cancel');
  }
}
