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
  fotoFile = signal<File | null>(null);
  fotoPreviewUrl = signal<string | null>(this.data.usuario?.fotoUrl ?? null);

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

  private normalizeText(value?: string | null): string {
    return (value ?? '').trim().toLocaleLowerCase('es');
  }

  private findMatchingComuna(
    comunaActual: string,
    comunasDisponibles: Array<{ sigla: string; descripcion: string }>,
  ): { sigla: string; descripcion: string } | undefined {
    const comunaNormalizada = this.normalizeText(comunaActual);
    return comunasDisponibles.find(
      (item) =>
        this.normalizeText(item.descripcion) === comunaNormalizada ||
        this.normalizeText(item.sigla) === comunaNormalizada,
    );
  }

  readonly comunas = computed(() => {
    const regionSeleccionada = this.usuarioForm.region().value();
    return (
      this.regionesComunas()
        .find((item) => this.normalizeText(item.region) === this.normalizeText(regionSeleccionada))
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
    confirmarContrasena: '',
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

  private normalizeUsuarioFormulario(usuario?: any): IUsuarioFormulario {
    return {
      _id: usuario?._id,
      usuario: usuario?.usuario ?? '',
      contrasena: '',
      confirmarContrasena: '',
      rutUsuario: usuario?.rutUsuario ?? '',
      nombres: usuario?.nombres ?? '',
      apellidoPaterno: usuario?.apellidoPaterno ?? '',
      apellidoMaterno: usuario?.apellidoMaterno ?? '',
      email: usuario?.email ?? '',
      telefono: usuario?.telefono ?? '',
      direccion: usuario?.direccion ?? '',
      region: usuario?.region ?? '',
      comuna: usuario?.comuna ?? '',
      tipoUsuario: usuario?.tipoUsuario ?? 'Veterinaria',
      veterinaria: {
        ...this.defaultVeterinaria,
        ...(usuario?.veterinaria ?? {}),
        tipoVeterinario: usuario?.veterinaria?.tipoVeterinario ?? '',
        rolVeterinario: usuario?.veterinaria?.rolVeterinario ?? '',
        porcentajeComisionVeterinario: usuario?.veterinaria?.porcentajeComisionVeterinario ?? 0,
      },
      estadoUsuario: usuario?.estadoUsuario ?? 'Activo',
    };
  }

  usuarioForm = form(this.usuarioModel, (schema) => {
    validate(schema.usuario, (field) => {
      if (this.modo === 'editar') {
        return [];
      }
      return field.value() ? [] : [{ kind: 'required', message: 'Usuario es requerido' }];
    });
    validate(schema.contrasena, (field) => {
      const value = (field.value() ?? '').trim();
      if (this.modo === 'editar') {
        return [];
      }
      if (!value) {
        return [{ kind: 'required', message: 'La contraseña es obligatoria' }];
      }
      return value.length >= 6
        ? []
        : [{ kind: 'minlength', message: 'La contraseña debe tener al menos 6 caracteres' }];
    });
    required(schema.rutUsuario, { message: 'RUT es requerido' });
    validate(schema.rutUsuario, (field) => {
      const value = field.value();
      if (!value) {
        return [];
      }
      return validateRut(cleanRut(value)) ? [] : [{ kind: 'rut', message: 'RUT no es válido' }];
    });
    validate(schema.confirmarContrasena, (field) => {
      const confirmationValue = (field.value() ?? '').trim();
      const passwordValue = (this.usuarioForm.contrasena().value() ?? '').trim();
      if (this.modo === 'editar' && !passwordValue) {
        return [];
      }
      if (!confirmationValue) {
        return [{ kind: 'required', message: 'La confirmación es obligatoria' }];
      }
      return confirmationValue === passwordValue
        ? []
        : [{ kind: 'mismatch', message: 'Las contraseñas no coinciden' }];
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
      this.usuarioModel.set(this.normalizeUsuarioFormulario(this.data.usuario));
      this.fotoPreviewUrl.set(this.data.usuario.fotoUrl ?? null);
    }

    effect(() => {
      const region = this.usuarioForm.region().value();
      const comunaActual = this.usuarioForm.comuna().value();
      const regionesComunasDisponibles = this.regionesComunas();
      const comunasDisponibles = this.comunas();

      if (!regionesComunasDisponibles.length) {
        return;
      }

      const regionCoincidente = regionesComunasDisponibles.find(
        (item) => this.normalizeText(item.region) === this.normalizeText(region),
      );

      if (region && !regionCoincidente) {
        return;
      }

      const comunaCoincidente = comunaActual
        ? this.findMatchingComuna(comunaActual, comunasDisponibles)
        : undefined;

      if (comunaActual && comunaCoincidente && comunaCoincidente.descripcion !== comunaActual) {
        this.usuarioForm.comuna().value.set(comunaCoincidente.descripcion);
        return;
      }

      if (region && comunaActual && !comunaCoincidente) {
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

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onFileDropped(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.setFotoFile(file);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (file) {
      this.setFotoFile(file);
    }
  }

  setFotoFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.error.set('Solo se permiten imágenes');
      return;
    }
    this.fotoFile.set(file);
    this.fotoPreviewUrl.set(URL.createObjectURL(file));
  }

  private readFileAsBase64(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result?.toString() ?? '';
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async guardar(event?: Event): Promise<void> {
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
      estado: 'Activo',
      empresa: this.data.empresa,
      fotoUrl: this.data.usuario?.fotoUrl,
    };

    const selectedPhoto = this.fotoFile();
    if (selectedPhoto) {
      payload.fotoBase64 = await this.readFileAsBase64(selectedPhoto);
    }

    delete payload.confirmarContrasena;

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
