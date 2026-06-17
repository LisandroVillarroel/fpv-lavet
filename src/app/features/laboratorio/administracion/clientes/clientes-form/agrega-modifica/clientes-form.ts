import { A11yModule } from '@angular/cdk/a11y';
import { Component, EventEmitter, computed, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { FormField, email, form, required, validate } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { NotificacioAlertnService } from '@app/shared/servicios/notificacionAlert';
import { cleanRut, formatRut, RutFormat, validateRut } from '@app/shared/utiles/rut';
import { emailCompletoValidator } from '@app/shared/utiles/validacionesGlobales';
import { IClienteFormulario } from '@features/laboratorio/administracion/clientes/clienteInterfaceForms';
import { ICliente } from '@features/laboratorio/administracion/clientes/clientesInterface';
import { ClientesService } from '@features/laboratorio/administracion/clientes/clientes.service';

@Component({
  selector: 'app-clientes-form',
  standalone: true,
  templateUrl: './clientes-form.html',
  styleUrls: ['./clientes-form.scss'],
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
  ],
  outputs: ['formCompleted', 'cancelarForm'],
})
export class ClientesForm {
  formCompleted = new EventEmitter<ICliente>();
  cancelarForm = new EventEmitter<void>();

  readonly data = input<{
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
  }>();

  readonly notificacion = inject(NotificacioAlertnService);
  private readonly clientesService = inject(ClientesService);

  readonly regionesComunas = toSignal(this.clientesService.obtenerRegionesComunas(), {
    initialValue: [],
  });

  readonly regiones = computed(() =>
    Array.from(new Set(this.regionesComunas().map((item) => item.region))).sort((a, b) =>
      a.localeCompare(b, 'es', { sensitivity: 'base' }),
    ),
  );

  readonly comunas = computed(() => {
    const regionSeleccionada = this.clienteForm.region().value();
    return (
      this.regionesComunas()
        .find((item) => this.normalizeText(item.region) === this.normalizeText(regionSeleccionada))
        ?.comuna.slice()
        .sort((a, b) =>
          a.descripcion.localeCompare(b.descripcion, 'es', { sensitivity: 'base' }),
        ) ?? []
    );
  });

  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  modo: 'agregar' | 'editar' = 'agregar';

  readonly clienteModel = signal<IClienteFormulario>({
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
    tipoUsuario: 'Propietario',
    estadoUsuario: 'Activo',
  });

  readonly clienteForm = form(this.clienteModel, (schema) => {
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
      const passwordValue = (this.clienteForm.contrasena().value() ?? '').trim();
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
    validate(schema.email, (field) => emailCompletoValidator(field.value() ?? ''));
    required(schema.telefono, { message: 'Teléfono es requerido' });
    required(schema.direccion, { message: 'Dirección es requerido' });
    required(schema.region, { message: 'Región es requerido' });
    required(schema.comuna, { message: 'Comuna es requerido' });
    required(schema.estadoUsuario, { message: 'Estado es requerido' });
  });

  readonly isFormInvalid = computed(() => !this.clienteForm().valid());

  constructor() {
    effect(() => {
      const data = this.data();
      if (!data) {
        return;
      }

      this.modo = data.modo ?? 'agregar';
      if (this.modo === 'editar' && data.cliente) {
        this.clienteModel.set(this.normalizeClienteFormulario(data.cliente));
      }
    });

    effect(() => {
      const region = this.clienteForm.region().value();
      const comunaActual = this.clienteForm.comuna().value();
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
        this.clienteForm.comuna().value.set(comunaCoincidente.descripcion);
        return;
      }

      if (region && comunaActual && !comunaCoincidente) {
        this.clienteForm.comuna().value.set('');
      }
    });
  }

  private normalizeClienteFormulario(cliente?: ICliente): IClienteFormulario {
    return {
      _id: cliente?._id,
      usuario: cliente?.usuario ?? '',
      contrasena: '',
      confirmarContrasena: '',
      rutUsuario: cliente?.rutUsuario ?? '',
      nombres: cliente?.nombres ?? '',
      apellidoPaterno: cliente?.apellidoPaterno ?? '',
      apellidoMaterno: cliente?.apellidoMaterno ?? '',
      email: cliente?.email ?? '',
      telefono: cliente?.telefono ?? '',
      direccion: cliente?.direccion ?? '',
      region: cliente?.region ?? '',
      comuna: cliente?.comuna ?? '',
      tipoUsuario: 'Propietario',
      estadoUsuario: cliente?.estadoUsuario ?? 'Activo',
    };
  }

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

  formatRutField(): void {
    const rutField = this.clienteForm.rutUsuario();
    const currentRut = rutField.value()?.trim() ?? '';
    const formattedRut = currentRut ? formatRut(currentRut, RutFormat.DOTS_DASH) : '';
    if (formattedRut !== currentRut) {
      rutField.value.set(formattedRut);
    }
  }

  async grabaCliente(event?: Event): Promise<void> {
    event?.preventDefault();

    if (!this.clienteForm().valid()) {
      return;
    }

    const cliente = this.clienteModel();
    if (this.modo === 'agregar' && !cliente.contrasena) {
      this.error.set('Contraseña es requerida para crear un cliente');
      return;
    }

    const usuarioLogueadoId = this.data()?.usuarioLogueado?._id ?? '';
    const payload: ICliente = {
      ...cliente,
      empresa: this.data()?.empresa,
      estado: 'Activo',
      tipoUsuario: 'Propietario',
    };

    delete (payload as Partial<ICliente> & { confirmarContrasena?: string }).confirmarContrasena;

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

    this.clientesService.agregarModificarCliente(payload).subscribe({
      next: async (res) => {
        this.formCompleted.emit(res || payload);
        await this.notificacion.confirmacion('Cliente', 'Guardado exitosamente');
      },
      error: (err: unknown) => {
        const message = err instanceof Error ? err.message : 'Error desconocido';
        this.error.set(message);
        this.success.set(null);
      },
    });
  }

  cancelar() {
    this.cancelarForm.emit();
  }
}
