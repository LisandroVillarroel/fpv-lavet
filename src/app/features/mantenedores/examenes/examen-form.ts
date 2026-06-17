import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { loginInterface } from '@core/auth/loginInterface';
import { StorageService } from '@core/guards/storage.service';
import { CategoriasService } from '@features/mantenedores/categorias/categorias.service';
import { ICategoria } from '@features/mantenedores/categorias/categoria.interface';
import { IExamen } from './examen.interface';
import { ExamenesService } from './examenes.service';

@Component({
  selector: 'app-examen-form',
  standalone: true,
  templateUrl: './examen-form.html',
  styleUrls: ['./examen-form.scss'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    FormsModule,
  ],
})
export class ExamenForm {
  readonly data = input<Partial<IExamen>>();
  private readonly dialogRef = inject(MatDialogRef<ExamenForm>);
  private readonly examenesService = inject(ExamenesService);
  private readonly categoriasService = inject(CategoriasService);
  private readonly storage = inject(StorageService);
  readonly tiemposPreparacionSugeridos = [
    '15 minutos',
    '30 minutos',
    '1 hora',
    '2 horas',
    '6 horas',
    '12 horas',
    '24 horas',
    '48 horas',
  ];

  readonly empresaId = this.obtenerEmpresaId();
  readonly categorias = toSignal(this.categoriasService.getAll(this.empresaId), {
    initialValue: [] as ICategoria[],
  });

  readonly examenModel = signal<IExamen>({
    _id: this.data()?._id,
    codigoExamen: this.data()?.codigoExamen ?? 0,
    codigoInterno: this.data()?.codigoInterno ?? 0,
    nombre: this.data()?.nombre ?? '',
    sigla: this.data()?.sigla ?? '',
    precio: this.data()?.precio ?? 0,
    tiempoPreparacion: this.data()?.tiempoPreparacion ?? '',
    categoria: this.obtenerCategoriaId(this.data()?.categoria),
    empresa_Id: this.data()?.empresa_Id ?? this.empresaId,
    usuarioCrea_id: this.data()?.usuarioCrea_id ?? this.obtenerUsuarioId(),
    estado: this.data()?.estado ?? 'Activo',
  });

  constructor() {
    effect(
      () => {
        const data = this.data();
        this.examenModel.set({
          _id: data?._id,
          codigoExamen: data?.codigoExamen ?? 0,
          codigoInterno: data?.codigoInterno ?? 0,
          nombre: data?.nombre ?? '',
          sigla: data?.sigla ?? '',
          precio: data?.precio ?? 0,
          tiempoPreparacion: data?.tiempoPreparacion ?? '',
          categoria: this.obtenerCategoriaId(data?.categoria),
          empresa_Id: data?.empresa_Id ?? this.empresaId,
          usuarioCrea_id: data?.usuarioCrea_id ?? this.obtenerUsuarioId(),
          estado: data?.estado ?? 'Activo',
        });
      },
      { allowSignalWrites: true },
    );
  }

  readonly examenForm = form(this.examenModel, (schema) => {
    required(schema.codigoExamen, { message: 'Código examen es requerido' });
    required(schema.codigoInterno, { message: 'Código interno es requerido' });
    required(schema.nombre, { message: 'Nombre es requerido' });
    required(schema.sigla, { message: 'Sigla es requerida' });
    required(schema.precio, { message: 'Precio es requerido' });
    required(schema.tiempoPreparacion, { message: 'Tiempo de preparación es requerido' });
    required(schema.categoria, { message: 'Categoría es requerida' });
  });

  readonly isFormInvalid = computed(() => !this.examenForm().valid());
  readonly guardando = signal(false);

  obtenerEmpresaId(): string {
    const sesion = this.storage.get<loginInterface>('sesion-lavet');
    return sesion?.user?.empresa?.empresaId || '';
  }

  obtenerUsuarioId(): string {
    const sesion = this.storage.get<loginInterface>('sesion-lavet');
    return sesion?.user?._id || '';
  }

  obtenerCategoriaId(categoria: IExamen['categoria'] | undefined): string {
    return categoria ?? '';
  }

  onCodigoExamenChange(codigoExamen: number) {
    this.examenModel.update((prev) => ({ ...prev, codigoExamen }));
  }

  onCodigoInternoChange(codigoInterno: number) {
    this.examenModel.update((prev) => ({ ...prev, codigoInterno }));
  }

  onNombreChange(nombre: string) {
    this.examenModel.update((prev) => ({ ...prev, nombre }));
  }

  onSiglaChange(sigla: string) {
    this.examenModel.update((prev) => ({ ...prev, sigla }));
  }

  onPrecioChange(precio: number | string | null) {
    this.examenModel.update((prev) => ({ ...prev, precio: this.normalizarPrecio(precio) }));
  }

  onTiempoPreparacionChange(tiempoPreparacion: string) {
    this.examenModel.update((prev) => ({
      ...prev,
      tiempoPreparacion: this.normalizarTiempoPreparacion(tiempoPreparacion),
    }));
  }

  onCategoriaChange(categoria: string) {
    this.examenModel.update((prev) => ({ ...prev, categoria }));
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CL', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(precio || 0);
  }

  private normalizarPrecio(precio: number | string | null): number {
    if (typeof precio === 'number') {
      return Number.isFinite(precio) ? Math.max(0, Math.trunc(precio)) : 0;
    }

    const digitos = String(precio ?? '').replace(/\D/g, '');
    if (!digitos) {
      return 0;
    }

    return Math.max(0, Number.parseInt(digitos, 10));
  }

  private normalizarTiempoPreparacion(tiempoPreparacion: string): string {
    const limpio = tiempoPreparacion.trim().replace(/\s+/g, ' ');

    if (!limpio) {
      return '';
    }

    const coincidencia = limpio.match(
      /^(\d+)\s*(min|minuto|minutos|hora|horas|hr|hrs|día|dias|días)$/i,
    );

    if (!coincidencia) {
      return limpio.charAt(0).toUpperCase() + limpio.slice(1);
    }

    const cantidad = Number.parseInt(coincidencia[1], 10);
    const unidadNormalizada = this.normalizarUnidadTiempo(coincidencia[2], cantidad);

    return `${cantidad} ${unidadNormalizada}`;
  }

  private normalizarUnidadTiempo(unidad: string, cantidad: number): string {
    const valor = unidad.toLowerCase();

    if (valor.startsWith('min')) {
      return cantidad === 1 ? 'minuto' : 'minutos';
    }

    if (valor.startsWith('h')) {
      return cantidad === 1 ? 'hora' : 'horas';
    }

    return cantidad === 1 ? 'día' : 'días';
  }

  guardar() {
    if (this.isFormInvalid() || this.guardando()) return;

    this.guardando.set(true);
    const { _id, fechaHora_Crea, fechaHora_Modifica, usuarioModifica_id, ...payload } =
      this.examenModel();

    if (_id) {
      this.examenesService.update(_id, payload).subscribe({
        next: (examen) => {
          this.guardando.set(false);
          this.dialogRef.close(examen);
        },
        error: () => {
          this.guardando.set(false);
        },
      });
      return;
    }

    this.examenesService.create(payload).subscribe({
      next: (examen) => {
        this.guardando.set(false);
        this.dialogRef.close(examen);
      },
      error: () => {
        this.guardando.set(false);
      },
    });
  }

  cancelar() {
    this.dialogRef.close();
  }
}
