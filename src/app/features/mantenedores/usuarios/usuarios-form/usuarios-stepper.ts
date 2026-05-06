import { Component, inject } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
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
    <mat-stepper linear orientation="horizontal">
      <mat-step label="Datos de Usuario">
        <app-usuarios-form (formCompleted)="onUsuarioFormCompleted($event)" [data]="data" />
        <div>
          <button mat-button matStepperNext [disabled]="!usuarioGuardado">
            Siguiente: Permisos
          </button>
        </div>
      </mat-step>
      <mat-step label="Permisos de Menú">
        <app-usuarios-permisos-menu />
        <!-- Botones de navegación ocultos por requerimiento -->
      </mat-step>
    </mat-stepper>
    <!-- Botón 'Cerrar' oculto por requerimiento --> `,
})
export default class UsuariosStepper {
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
      tipoEmpresa?: 'Laboratorio' | 'Veterinaria' | 'Usuario';
    };
  };

  modo = this.data.modo;
  usuarioGuardado: any = null;

  onUsuarioFormCompleted(usuario: any) {
    this.usuarioGuardado = usuario;
  }

  cerrar() {
    this.dialogRef.close();
  }
}
