import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { A11yModule } from '@angular/cdk/a11y';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { email, FormField, form, min, required, validate } from '@angular/forms/signals';
import { finalize, take } from 'rxjs';

import { AuthTokenService } from '@core/services/auth-token.service';
import { UserService } from '@core/services/user.service';
import { NotificacioAlertnService } from '@app/shared/servicios/notificacionAlert';
import { cleanRut, formatRut, RutFormat, validateRut } from '@app/shared/utiles/rut';
import { emailCompletoValidator } from '@app/shared/utiles/validacionesGlobales';
import { UsuarioService } from '@features/mantenedores/usuarios/usuarios.service';
import {
  IUsuarioFormulario,
  IVeterinariaFormulario,
} from '@features/mantenedores/usuarios/usuarioInterfaceForms';
import { IUsuario } from '@shared/interfaces/usuario.interface';

type ProfileUser = IUsuario & {
  fotoUrl?: string;
  region?: string;
  comuna?: string;
  estadoUsuario?: 'Activo' | 'Bloqueado' | 'Suspendido';
};

@Component({
  selector: 'app-modifica-datos-personales',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    A11yModule,
    FormField,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
  ],
  templateUrl: './modifica-datos-personales.html',
  styleUrl: './modifica-datos-personales.scss',
})
export class ModificaDatosPersonales {
  readonly #authToken = inject(AuthTokenService);
  readonly #userService = inject(UserService);
  readonly #usuarioService = inject(UsuarioService);
  readonly #notificacion = inject(NotificacioAlertnService);

  readonly session = this.#authToken.session;
  readonly currentUser = signal<ProfileUser | null>(this.session()?.user as ProfileUser | null);
  readonly empresaId = computed(
    () => this.resolveEmpresaId(this.currentUser()) || this.resolveEmpresaId(this.session()?.user),
  );
  readonly isSaving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly fotoFile = signal<File | null>(null);
  readonly fotoPreviewUrl = signal<string | null>(null);
  readonly tiposVeterinario = signal<Array<{ sigla: string; descripcion: string }>>([]);

  private loadedTiposEmpresaId = '';
  private pendingTiposEmpresaId = '';

  private readonly defaultVeterinaria: IVeterinariaFormulario = {
    tipoVeterinario: '',
    rolVeterinario: '',
    porcentajeComisionVeterinario: 0,
  };

  readonly regionesComunas = toSignal(this.#usuarioService.obtenerRegionesComunas(), {
    initialValue: [],
  });

  readonly regiones = computed(() =>
    Array.from(new Set(this.regionesComunas().map((item) => item.region))).sort((a, b) =>
      a.localeCompare(b, 'es', { sensitivity: 'base' }),
    ),
  );

  readonly formModel = signal<IUsuarioFormulario>({
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

  readonly profileForm = form(this.formModel, (schema) => {
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
    validate(schema.email, (field) => emailCompletoValidator(field.value() ?? ''));
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

  readonly comunas = computed(() => {
    const regionSeleccionada = this.profileForm.region().value();
    return (
      this.regionesComunas()
        .find((item) => this.normalizeText(item.region) === this.normalizeText(regionSeleccionada))
        ?.comuna.slice()
        .sort((a, b) =>
          a.descripcion.localeCompare(b.descripcion, 'es', { sensitivity: 'base' }),
        ) ?? []
    );
  });

  readonly isFormInvalid = computed(() => !this.profileForm().valid());
  readonly nombreUsuario = computed(() => {
    const user = this.currentUser();
    return [user?.nombres, user?.apellidoPaterno].filter(Boolean).join(' ').trim() || user?.usuario;
  });

  constructor() {
    this.#userService
      .getProfile()
      .pipe(take(1))
      .subscribe({
        next: (user) => {
          const profileUser = user as ProfileUser;
          this.currentUser.set(profileUser);
          this.#authToken.updateStoredUser(profileUser as unknown as Record<string, unknown>);
        },
        error: () => {},
      });

    effect(() => {
      const user = this.currentUser();
      if (!user) {
        return;
      }

      this.formModel.set(this.normalizeUsuarioFormulario(user));
      this.fotoPreviewUrl.set(user.fotoUrl ?? null);
      this.loadTiposVeterinario(this.resolveEmpresaId(user));
    });

    effect(() => {
      const region = this.profileForm.region().value();
      const comunaActual = this.profileForm.comuna().value();
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
        this.profileForm.comuna().value.set(comunaCoincidente.descripcion);
        return;
      }

      if (region && comunaActual && !comunaCoincidente) {
        this.profileForm.comuna().value.set('');
      }
    });

    effect(() => {
      const tipoVeterinarioActual = this.profileForm.veterinaria?.tipoVeterinario().value() ?? '';
      const tiposDisponibles = this.tiposVeterinario();

      if (!tipoVeterinarioActual || !tiposDisponibles.length) {
        return;
      }

      const tipoCoincidente = this.findMatchingTipoVeterinario(
        tipoVeterinarioActual,
        tiposDisponibles,
      );

      if (tipoCoincidente && tipoCoincidente.sigla !== tipoVeterinarioActual) {
        this.profileForm.veterinaria?.tipoVeterinario().value.set(tipoCoincidente.sigla);
      }
    });
  }

  formatRutField(): void {
    const rutField = this.profileForm.rutUsuario();
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
      this.errorMessage.set('Solo se permiten imágenes');
      return;
    }
    this.fotoFile.set(file);
    this.fotoPreviewUrl.set(URL.createObjectURL(file));
  }

  async submit(event?: Event): Promise<void> {
    event?.preventDefault();
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.profileForm().valid()) {
      return;
    }

    const user = this.currentUser();
    if (!user?._id) {
      this.errorMessage.set('No fue posible identificar el usuario actual');
      return;
    }

    const payload: Record<string, unknown> & { fotoBase64?: string } = {
      ...user,
      ...this.formModel(),
      empresa: user.empresa,
      MenuItem: user.MenuItem,
      fotoUrl: user.fotoUrl,
      usuario: user.usuario,
      usuarioModifica_id: user._id,
    };

    delete payload['contrasena'];

    const selectedPhoto = this.fotoFile();
    if (selectedPhoto) {
      payload.fotoBase64 = await this.readFileAsBase64(selectedPhoto);
    }

    this.isSaving.set(true);
    this.#userService
      .updateProfile(user._id, payload)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: async (updatedUser) => {
          const profileUser = updatedUser as ProfileUser;
          this.#authToken.updateStoredUser(profileUser as unknown as Record<string, unknown>);
          this.formModel.set(this.normalizeUsuarioFormulario(profileUser));
          this.fotoPreviewUrl.set(profileUser.fotoUrl ?? this.fotoPreviewUrl());
          this.fotoFile.set(null);
          await this.#notificacion.confirmacion('Datos personales', 'Guardados exitosamente');
          this.successMessage.set('Datos personales actualizados correctamente');
        },
        error: (error) => {
          this.errorMessage.set(
            error?.error?.mensaje || 'Ocurrió un error al intentar actualizar los datos',
          );
        },
      });
  }

  private normalizeUsuarioFormulario(usuario?: ProfileUser): IUsuarioFormulario {
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
      tipoUsuario: this.normalizeTipoUsuario(usuario),
      veterinaria: {
        ...this.defaultVeterinaria,
        ...(usuario?.veterinaria ?? {}),
        tipoVeterinario: usuario?.veterinaria?.tipoVeterinario ?? '',
        rolVeterinario: usuario?.veterinaria?.rolVeterinario ?? '',
        porcentajeComisionVeterinario: usuario?.veterinaria?.porcentajeComisionVeterinario ?? 0,
      },
      estadoUsuario: (usuario?.estadoUsuario as 'Activo' | 'Bloqueado' | 'Suspendido') ?? 'Activo',
    };
  }

  private normalizeTipoUsuario(usuario?: IUsuario): 'Laboratorio' | 'Veterinaria' | 'Propietario' {
    if (usuario?.tipoUsuario === 'Laboratorio' || usuario?.tipoUsuario === 'Propietario') {
      return usuario.tipoUsuario;
    }

    return 'Veterinaria';
  }

  private normalizeText(value?: string | null): string {
    return (value ?? '').trim().toLocaleLowerCase('es');
  }

  private resolveEmpresaId(user?: ProfileUser | null): string {
    const empresa = user?.empresa as
      | ({ empresaId?: string; _id?: string } & Record<string, unknown>)
      | undefined;
    return String(empresa?.empresaId ?? empresa?._id ?? '').trim();
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

  private findMatchingTipoVeterinario(
    tipoActual: string,
    tiposDisponibles: Array<{ sigla: string; descripcion: string }>,
  ): { sigla: string; descripcion: string } | undefined {
    const tipoNormalizado = this.normalizeText(tipoActual);
    return tiposDisponibles.find(
      (item) =>
        this.normalizeText(item.sigla) === tipoNormalizado ||
        this.normalizeText(item.descripcion) === tipoNormalizado,
    );
  }

  private loadTiposVeterinario(empresaId: string): void {
    const empresaIdNormalizado = empresaId.trim();

    if (
      !empresaIdNormalizado ||
      empresaIdNormalizado === this.loadedTiposEmpresaId ||
      empresaIdNormalizado === this.pendingTiposEmpresaId
    ) {
      return;
    }

    this.pendingTiposEmpresaId = empresaIdNormalizado;

    this.#usuarioService
      .obtenerTiposVeterinario(empresaIdNormalizado)
      .pipe(take(1))
      .subscribe({
        next: (tipos) => {
          this.pendingTiposEmpresaId = '';
          this.loadedTiposEmpresaId = empresaIdNormalizado;
          this.tiposVeterinario.set(tipos ?? []);
        },
        error: () => {
          this.pendingTiposEmpresaId = '';
          this.tiposVeterinario.set([]);
        },
      });
  }

  private readFileAsBase64(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result?.toString() ?? '');
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
