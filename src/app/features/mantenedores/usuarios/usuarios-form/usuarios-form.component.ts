import { Component, computed, inject, signal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { A11yModule } from '@angular/cdk/a11y';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

import { FormField, form, required, email, min, validate } from '@angular/forms/signals';

import { cleanRut, formatRut, RutFormat, validateRut } from '@fdograph/rut-utilities';
import { UsuarioService } from '@features/mantenedores/usuarios/usuarios.service';
import TituloComponentePopup from '@shared/ui/tituloComponentePopup';
import {
  IUsuarioFormulario,
  IVeterinariaFormulario,
} from '@features/mantenedores/usuarios/usuarioInterfaceForms';

@Component({
  selector: 'app-usuarios-form',
  standalone: true,
  templateUrl: './usuarios-form.component.html',
  styleUrls: ['./usuarios-form.component.scss'],
  imports: [
    A11yModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    FormField,
    TituloComponentePopup,
  ],
})
export class UsuariosFormComponent {
  private readonly usuarioService = inject(UsuarioService);
  private readonly dialogRef = inject(MatDialogRef<UsuariosFormComponent>);
  readonly data = inject(MAT_DIALOG_DATA) as any;

  private readonly defaultVeterinaria: IVeterinariaFormulario = {
    tipoVeterinario: '',
    rolVeterinario: '',
    porcentajeComisionVeterinario: 0,
  };

  modo: 'agregar' | 'editar';
  error = signal<string | null>(null);

  usuarioModel = signal<IUsuarioFormulario>({
    usuario: '',
    contrasena: '',
    rutUsuario: '',
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    email: '',
    telefono: '',
    direccion: '',
    region: '',
    comuna: '',
    tipoUsuario: 'Veterinaria',
    veterinaria: { ...this.defaultVeterinaria },
    estadoUsuario: 'Activo',
  });

  usuarioForm = form(this.usuarioModel, (schema) => {
    required(schema.usuario, { message: 'Usuario es requerido' });
    required(schema.rutUsuario, { message: 'RUT es requerido' });
    validate(schema.rutUsuario, (field) => {
      const value = field.value();
      if (!value) {
        return [];
      }
      return validateRut(cleanRut(value)) ? [] : [{ kind: 'rut', message: 'RUT no es válido' }];
    });
    required(schema.nombres, { message: 'Nombres es requerido' });
    required(schema.apellidoPaterno, { message: 'Apellido Paterno es requerido' });
    required(schema.apellidoMaterno, { message: 'Apellido Materno es requerido' });
    required(schema.email, { message: 'Email es requerido' });
    email(schema.email, { message: 'Email no es válido' });
    required(schema.telefono, { message: 'Teléfono es requerido' });
    required(schema.direccion, { message: 'Dirección es requerido' });
    required(schema.region, { message: 'Región es requerido' });
    required(schema.comuna, { message: 'Comuna es requerido' });
    required(schema.tipoUsuario, { message: 'Tipo Usuario es requerido' });
    required(schema.veterinaria!.tipoVeterinario, { message: 'Tipo Veterinario es requerido' });
    required(schema.veterinaria!.rolVeterinario, { message: 'Rol Veterinario es requerido' });
    min(schema.veterinaria!.porcentajeComisionVeterinario, 0, {
      message: 'Porcentaje Comisión Veterinario debe ser mayor o igual a 0',
    });
    required(schema.estadoUsuario, { message: 'Estado es requerido' });
  });

  readonly isFormInvalid = computed(() => !this.usuarioForm().valid());

  constructor() {
    this.modo = this.data.modo;

    if (this.modo === 'editar' && this.data.usuario) {
      this.usuarioModel.set({
        ...this.data.usuario,
        veterinaria: {
          ...this.defaultVeterinaria,
          ...(this.data.usuario.veterinaria ?? {}),
        },
      });
    }
  }

  formatRutField(): void {
    const rutField = this.usuarioForm.rutUsuario();
    const currentRut = rutField.value()?.trim() ?? '';
    const formattedRut = currentRut ? formatRut(currentRut, RutFormat.DOTS_DASH) : '';
    if (formattedRut !== currentRut) {
      rutField.value.set(formattedRut);
    }
  }

  guardar(): void {
    if (!this.usuarioForm().valid()) {
      return;
    }

    this.error.set(null);
    const usuario = this.usuarioModel();
    this.usuarioService.agregarModificarUsuario(usuario).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (_err: unknown) => {
        this.error.set(`Error al ${this.modo === 'agregar' ? 'agregar' : 'modificar'} usuario`);
      },
    });
  }

  cancelar() {
    this.dialogRef.close();
  }
}
