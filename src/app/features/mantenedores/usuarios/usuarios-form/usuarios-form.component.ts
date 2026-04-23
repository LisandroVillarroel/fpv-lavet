import { Component, computed, inject, signal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { A11yModule } from '@angular/cdk/a11y';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

import { FormField, form, required, email, min } from '@angular/forms/signals';

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
    required(schema.usuario);
    required(schema.rutUsuario);
    required(schema.nombres);
    required(schema.apellidoPaterno);
    required(schema.apellidoMaterno);
    required(schema.email);
    email(schema.email);
    required(schema.telefono);
    required(schema.direccion);
    required(schema.region);
    required(schema.comuna);
    required(schema.tipoUsuario);
    required(schema.veterinaria!.tipoVeterinario);
    required(schema.veterinaria!.rolVeterinario);
    min(schema.veterinaria!.porcentajeComisionVeterinario, 0);
    required(schema.estadoUsuario);
  });

  get tipoVeterinario() {
    return this.usuarioForm.veterinaria!.tipoVeterinario;
  }

  get rolVeterinario() {
    return this.usuarioForm.veterinaria!.rolVeterinario;
  }

  get porcentajeComisionVeterinario() {
    return this.usuarioForm.veterinaria!.porcentajeComisionVeterinario;
  }

  readonly usuarioErrorMessage = computed(() =>
    this.getFieldErrorMessage(this.usuarioForm.usuario, 'Usuario'),
  );

  readonly rutUsuarioErrorMessage = computed(() =>
    this.getFieldErrorMessage(this.usuarioForm.rutUsuario, 'RUT'),
  );

  readonly nombresErrorMessage = computed(() =>
    this.getFieldErrorMessage(this.usuarioForm.nombres, 'Nombres'),
  );

  readonly apellidoPaternoErrorMessage = computed(() =>
    this.getFieldErrorMessage(this.usuarioForm.apellidoPaterno, 'Apellido Paterno'),
  );

  readonly apellidoMaternoErrorMessage = computed(() =>
    this.getFieldErrorMessage(this.usuarioForm.apellidoMaterno, 'Apellido Materno'),
  );

  readonly emailErrorMessage = computed(() =>
    this.getFieldErrorMessage(this.usuarioForm.email, 'Email'),
  );

  readonly telefonoErrorMessage = computed(() =>
    this.getFieldErrorMessage(this.usuarioForm.telefono, 'Teléfono'),
  );

  readonly direccionErrorMessage = computed(() =>
    this.getFieldErrorMessage(this.usuarioForm.direccion, 'Dirección'),
  );

  readonly regionErrorMessage = computed(() =>
    this.getFieldErrorMessage(this.usuarioForm.region, 'Región'),
  );

  readonly comunaErrorMessage = computed(() =>
    this.getFieldErrorMessage(this.usuarioForm.comuna, 'Comuna'),
  );

  readonly tipoUsuarioErrorMessage = computed(() =>
    this.getFieldErrorMessage(this.usuarioForm.tipoUsuario, 'Tipo Usuario'),
  );

  readonly tipoVeterinarioErrorMessage = computed(() =>
    this.getFieldErrorMessage(this.tipoVeterinario, 'Tipo Veterinario'),
  );

  readonly rolVeterinarioErrorMessage = computed(() =>
    this.getFieldErrorMessage(this.rolVeterinario, 'Rol Veterinario'),
  );

  readonly porcentajeComisionVeterinarioErrorMessage = computed(() =>
    this.getFieldErrorMessage(this.porcentajeComisionVeterinario, '% Comisión Veterinario'),
  );

  readonly estadoUsuarioErrorMessage = computed(() =>
    this.getFieldErrorMessage(this.usuarioForm.estadoUsuario, 'Estado'),
  );

  getFieldErrorMessage(field: any, label: string) {
    const errors = field().errors();
    if (!errors?.length) {
      return '';
    }

    if (errors.some((err: any) => err.kind === 'required')) {
      return `${label} es obligatorio`;
    }

    if (errors.some((err: any) => err.kind === 'email')) {
      return 'Email no es válido';
    }

    if (errors.some((err: any) => err.kind === 'min')) {
      return label.includes('Comisión')
        ? 'Porcentaje de comisión es obligatorio y debe ser mayor o igual a 0'
        : `${label} debe ser mayor o igual a 0`;
    }

    return `${label} no es válido`;
  }

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
