import { Component, inject, ViewChild, EventEmitter } from '@angular/core';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { UsuariosPermisosMenuComponent } from './usuarios-permisos/usuarios-permisos-menu';
import { UsuariosForm } from './agrega-modifica/usuarios-form';
import TituloComponentePopup from '@app/shared/ui/tituloComponentePopup';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IUsuario } from './../usuariosInterface';

@Component({
  selector: 'app-usuarios-stepper',
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
          [data]="data"
          (formCompleted)="onUsuarioFormCompleted($event)"
          (cancelarForm)="onCancelarForm()"
          (avanzarPermisos)="onAvanzarPermisos()"
          #usuariosFormCmp
        />
        <!-- Botón 'Siguiente: Permisos' oculto por requerimiento -->
      </mat-step>
      <mat-step label="Permisos de Menú">
        <app-usuarios-permisos-menu [data]="data" />
        <!-- Botones de navegación ocultos por requerimiento -->
      </mat-step>
    </mat-stepper>
    <!-- Botón 'Cerrar' oculto por requerimiento --> `,
})
export default class UsuariosStepper {
  usuarioGuardado = new EventEmitter<any>();
  private usuarioGuardadoValue: any = null;
  // Evita avanzar al tab de permisos si el formulario no es válido
  onStepSelectionChange(event: any, usuariosFormCmp: any) {
    // Si intenta ir al paso 1 (índice 1) y el formulario no es válido o no está guardado, cancela el cambio
    if (event.selectedIndex === 1) {
      const formInvalido = usuariosFormCmp?.isFormInvalid && usuariosFormCmp.isFormInvalid();
      // En modo 'agregar', solo permite avanzar si está guardado y el form es válido
      if (this.modo === 'agregar' && (!this.usuarioGuardado || formInvalido)) {
        setTimeout(() => {
          this.stepper.selectedIndex = 0;
        });
      }
      // En modo 'editar', permite avanzar si el form es válido
      if (this.modo === 'editar' && formInvalido) {
        setTimeout(() => {
          this.stepper.selectedIndex = 0;
        });
      }
    }
  }
  @ViewChild('stepper') stepper!: MatStepper;
  private readonly dialogRef = inject(MatDialogRef<UsuariosStepper>);
  readonly data = inject(MAT_DIALOG_DATA) as {
    modo: 'agregar' | 'editar';
    usuario?: IUsuario;
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

  onAvanzarPermisos() {
    // Avanza al siguiente paso del stepper
    setTimeout(() => {
      this.stepper.next();
    });
  }

  onCancelarForm() {
    this.cerrar();
  }

  onUsuarioFormCompleted(usuario: any) {
    this.usuarioGuardado.emit(usuario);
    this.usuarioGuardadoValue = usuario;
    this.data.usuario = usuario; // Asegura que el usuario actualizado se pase al menú de permisos
  }

  cerrar() {
    this.dialogRef.close('cancel');
  }
}
