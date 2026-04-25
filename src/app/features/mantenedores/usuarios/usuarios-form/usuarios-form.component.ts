import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { A11yModule } from '@angular/cdk/a11y';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';

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
    FormsModule,
    FormField,
    TituloComponentePopup,
  ],
})
export class UsuariosFormComponent {
  private readonly usuarioService = inject(UsuarioService);
  private readonly dialogRef = inject(MatDialogRef<UsuariosFormComponent>);
  readonly data = inject(MAT_DIALOG_DATA) as {
    modo: 'agregar' | 'editar';
    usuario?: any;
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
  readonly empresaId = this.data.empresaId ?? '';

  private readonly defaultVeterinaria: IVeterinariaFormulario = {
    tipoVeterinario: '',
    rolVeterinario: '',
    porcentajeComisionVeterinario: 0,
  };

  readonly tiposVeterinario = toSignal(
    this.usuarioService.obtenerTiposVeterinario(this.empresaId),
    {
      initialValue: [],
    },
  );

  readonly regionesComunas = toSignal(this.usuarioService.obtenerRegionesComunas(), {
    initialValue: [],
  });

  readonly regiones = computed(() =>
    Array.from(new Set(this.regionesComunas().map((item) => item.region))).sort((a, b) =>
      a.localeCompare(b, 'es', { sensitivity: 'base' }),
    ),
  );

  readonly comunas = computed(() => {
    const regionSeleccionada = this.usuarioForm.region().value();
    return (
      this.regionesComunas()
        .find((item) => item.region === regionSeleccionada)
        ?.comuna.slice()
        .sort((a, b) =>
          a.descripcion.localeCompare(b.descripcion, 'es', { sensitivity: 'base' }),
        ) ?? []
    );
  });

  modo: 'agregar' | 'editar';
  error = signal<string | null>(null);
  success = signal<string | null>(null);

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
    validate(schema.contrasena, (field) => {
      const value = field.value();
      if (this.modo === 'editar') {
        return [];
      }
      return value ? [] : [{ kind: 'required', message: 'Contraseña es requerida' }];
    });
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

    effect(() => {
      const region = this.usuarioForm.region().value();
      const comunaActual = this.usuarioForm.comuna().value();
      const comunasDisponibles = this.comunas();

      if (
        region &&
        comunaActual &&
        !comunasDisponibles.some((item) => item.descripcion === comunaActual)
      ) {
        this.usuarioForm.comuna().value.set('');
      }
    });
  }

  formatRutField(): void {
    const rutField = this.usuarioForm.rutUsuario();
    const currentRut = rutField.value()?.trim() ?? '';
    const formattedRut = currentRut ? formatRut(currentRut, RutFormat.DOTS_DASH) : '';
    if (formattedRut !== currentRut) {
      rutField.value.set(formattedRut);
    }
  }

  guardar(event?: Event): void {
    event?.preventDefault();

    if (!this.usuarioForm().valid()) {
      return;
    }

    const usuario = this.usuarioModel();
    if (this.modo === 'agregar' && !usuario.contrasena) {
      this.error.set('Contraseña es requerida para crear un usuario');
      return;
    }

    const usuarioLogueadoId = this.data.usuarioLogueado?._id ?? '';

    const payload: any = {
      ...usuario,
      estado: usuario.estadoUsuario,
      empresa: this.data.empresa,
    };

    if (this.modo === 'agregar') {
      payload.usuarioCrea_id = usuarioLogueadoId;
    }

    if (this.modo === 'editar') {
      if (!payload.contrasena) {
        delete payload.contrasena;
      }
      payload.usuarioModifica_id = usuarioLogueadoId;
    }

    this.error.set(null);
    this.success.set(null);
    this.usuarioService.agregarModificarUsuario(payload).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (err: unknown) => {
        const message = err instanceof Error ? err.message : 'Error desconocido';
        this.error.set(message);
        this.success.set(null);
      },
    });
  }

  cancelar() {
    this.dialogRef.close();
  }
}
