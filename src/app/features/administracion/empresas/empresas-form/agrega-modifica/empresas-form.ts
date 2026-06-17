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
import { IEmpresaFormulario } from '@features/administracion/empresas/empresaInterfaceForms';
import { Empresa } from '@features/administracion/empresas/empresasInterface';
import { EmpresasService } from '@features/administracion/empresas/empresas.service';

@Component({
  selector: 'app-empresas-form',
  standalone: true,
  templateUrl: './empresas-form.html',
  styleUrls: ['./empresas-form.scss'],
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
  outputs: ['formCompleted', 'cancelarForm', 'avanzarPermisos'],
})
export class EmpresasForm {
  formCompleted = new EventEmitter<Empresa>();
  cancelarForm = new EventEmitter<void>();
  avanzarPermisos = new EventEmitter<void>();

  readonly data = input<{
    modo: 'agregar' | 'editar';
    empresa?: Empresa;
  }>();

  readonly notificacion = inject(NotificacioAlertnService);
  private readonly empresasService = inject(EmpresasService);
  readonly regionesComunas = toSignal(this.empresasService.obtenerRegionesComunas(), {
    initialValue: [],
  });

  readonly regiones = computed(() =>
    Array.from(new Set(this.regionesComunas().map((item) => item.region))).sort((a, b) =>
      a.localeCompare(b, 'es', { sensitivity: 'base' }),
    ),
  );

  readonly comunas = computed(() => {
    const regionSeleccionada = this.empresaForm.region().value();
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
  modo: 'agregar' | 'editar' = 'agregar';

  readonly empresaModel = signal<IEmpresaFormulario>({
    rutEmpresa: '',
    razonSocial: '',
    nombreFantasia: '',
    direccion: '',
    region: '',
    comuna: '',
    telefono: '',
    emailEmpresa: '',
    contacto: {
      nombreContacto: '',
      emailContacto: '',
      telefonoContacto: '',
    },
    tipoEmpresa: 'Laboratorio',
    MenuItem: [],
    estadoEmpresa: 'Activo',
  });

  readonly empresaForm = form(this.empresaModel, (schema) => {
    required(schema.rutEmpresa, { message: 'RUT empresa es requerido' });
    validate(schema.rutEmpresa, (field) => {
      const value = field.value();
      if (!value) {
        return [];
      }

      return validateRut(cleanRut(value)) ? [] : [{ kind: 'rut', message: 'RUT no es válido' }];
    });
    required(schema.razonSocial, { message: 'Razón social es requerida' });
    required(schema.nombreFantasia, { message: 'Nombre fantasía es requerido' });
    required(schema.direccion, { message: 'Dirección es requerida' });
    required(schema.region, { message: 'Región es requerida' });
    required(schema.comuna, { message: 'Comuna es requerida' });
    required(schema.telefono, { message: 'Teléfono es requerido' });
    required(schema.emailEmpresa, { message: 'Email empresa es requerido' });
    email(schema.emailEmpresa, { message: 'Email empresa no es válido' });
    validate(schema.emailEmpresa, (field) => emailCompletoValidator(field.value() ?? ''));
    required(schema.contacto.nombreContacto, { message: 'Nombre contacto es requerido' });
    required(schema.contacto.emailContacto, { message: 'Email contacto es requerido' });
    email(schema.contacto.emailContacto, { message: 'Email contacto no es válido' });
    validate(schema.contacto.emailContacto, (field) => emailCompletoValidator(field.value() ?? ''));
    required(schema.contacto.telefonoContacto, { message: 'Teléfono contacto es requerido' });
    required(schema.tipoEmpresa, { message: 'Tipo empresa es requerido' });
    required(schema.estadoEmpresa, { message: 'Estado empresa es requerido' });
  });

  readonly isFormInvalid = computed(() => !this.empresaForm().valid());

  constructor() {
    effect(() => {
      const data = this.data();
      if (!data) {
        return;
      }

      this.modo = data.modo ?? 'agregar';
      if (this.modo === 'editar' && data.empresa) {
        this.empresaModel.set(this.normalizeEmpresaFormulario(data.empresa));
      }
    });

    effect(() => {
      const region = this.empresaForm.region().value();
      const comunaActual = this.empresaForm.comuna().value();
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
        this.empresaForm.comuna().value.set(comunaCoincidente.descripcion);
        return;
      }

      if (region && comunaActual && !comunaCoincidente) {
        this.empresaForm.comuna().value.set('');
      }
    });
  }

  private normalizeEmpresaFormulario(empresa?: Empresa): IEmpresaFormulario {
    return {
      _id: empresa?._id,
      rutEmpresa: empresa?.rutEmpresa ?? '',
      razonSocial: empresa?.razonSocial ?? '',
      nombreFantasia: empresa?.nombreFantasia ?? '',
      direccion: empresa?.direccion ?? '',
      region: empresa?.region ?? '',
      comuna: empresa?.comuna ?? '',
      telefono: empresa?.telefono ?? '',
      emailEmpresa: empresa?.emailEmpresa ?? '',
      contacto: {
        nombreContacto: empresa?.contacto?.nombreContacto ?? '',
        emailContacto: empresa?.contacto?.emailContacto ?? '',
        telefonoContacto: empresa?.contacto?.telefonoContacto ?? '',
      },
      tipoEmpresa: empresa?.tipoEmpresa ?? 'Laboratorio',
      MenuItem: empresa?.MenuItem ?? [],
      estadoEmpresa: empresa?.estadoEmpresa ?? 'Activo',
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
    const rutField = this.empresaForm.rutEmpresa();
    const currentRut = rutField.value()?.trim() ?? '';
    const formattedRut = currentRut ? formatRut(currentRut, RutFormat.DOTS_DASH) : '';
    if (formattedRut !== currentRut) {
      rutField.value.set(formattedRut);
    }
  }

  async grabaEmpresa(event?: Event): Promise<void> {
    event?.preventDefault();

    if (!this.empresaForm().valid()) {
      return;
    }

    const empresa = this.empresaModel();
    const tipoEmpresaOriginal = this.data()?.empresa?.tipoEmpresa;
    const payload: Empresa = {
      ...empresa,
      MenuItem:
        this.modo === 'editar' && tipoEmpresaOriginal && tipoEmpresaOriginal !== empresa.tipoEmpresa
          ? []
          : (this.data()?.empresa?.MenuItem ?? empresa.MenuItem),
    };

    this.error.set(null);

    this.empresasService.agregarModificarEmpresa(payload).subscribe({
      next: async (res) => {
        this.formCompleted.emit(res || payload);
        await this.notificacion.confirmacion('Empresa', 'Guardada exitosamente');
        this.avanzarPermisos.emit();
      },
      error: (err: unknown) => {
        const message = err instanceof Error ? err.message : 'Error desconocido';
        this.error.set(message);
      },
    });
  }

  cancelar() {
    this.cancelarForm.emit();
  }
}
