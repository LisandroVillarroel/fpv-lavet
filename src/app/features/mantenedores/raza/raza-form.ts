import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { toSignal } from '@angular/core/rxjs-interop';
import { StorageService } from '@core/guards/storage.service';
import { loginInterface } from '@core/auth/loginInterface';
import { EspeciesService } from '@features/mantenedores/especies/especies.service';
import { IEspecie } from '@features/mantenedores/especies/especie.interface';
import { IRaza } from './raza.interface';
import { RazasService } from './razas.service';

@Component({
  selector: 'app-raza-form',
  standalone: true,
  templateUrl: './raza-form.html',
  styleUrls: ['./raza-form.scss'],
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
export class RazaForm {
  readonly data = input<Partial<IRaza>>();
  private readonly dialogRef = inject(MatDialogRef<RazaForm>);
  private readonly razasService = inject(RazasService);
  private readonly especiesService = inject(EspeciesService);
  private readonly storage = inject(StorageService);

  readonly empresaId = this.obtenerEmpresaId();
  readonly especies = toSignal(this.especiesService.getAll(this.empresaId), {
    initialValue: [] as IEspecie[],
  });

  readonly razaModel = signal<IRaza>({
    _id: this.data()?._id,
    nombre: this.data()?.nombre ?? '',
    empresa_Id: this.data()?.empresa_Id ?? this.empresaId,
    especieNombre: this.data()?.especieNombre ?? '',
    estado: this.data()?.estado ?? 'Activo',
  });

  constructor() {
    effect(
      () => {
        const data = this.data();
        this.razaModel.set({
          _id: data?._id,
          nombre: data?.nombre ?? '',
          empresa_Id: data?.empresa_Id ?? this.empresaId,
          especieNombre: data?.especieNombre ?? '',
          estado: data?.estado ?? 'Activo',
        });
      },
      { allowSignalWrites: true },
    );
  }

  readonly razaForm = form(this.razaModel, (schema) => {
    required(schema.nombre, { message: 'Nombre es requerido' });
    required(schema.especieNombre, { message: 'Especie es requerida' });
  });

  readonly isFormInvalid = computed(() => !this.razaForm().valid());
  readonly guardando = signal(false);

  obtenerEmpresaId(): string {
    const sesion = this.storage.get<loginInterface>('sesion-lavet');
    return sesion?.user?.empresa?.empresaId || '';
  }

  onNombreChange(nombre: string) {
    this.razaModel.update((prev) => ({ ...prev, nombre }));
  }

  onEspecieChange(especieNombre: string) {
    this.razaModel.update((prev) => ({ ...prev, especieNombre }));
  }

  guardar() {
    if (this.isFormInvalid() || this.guardando()) return;

    this.guardando.set(true);
    const {
      _id,
      usuarioCrea_id,
      fechaHora_Crea,
      usuarioModifica_id,
      fechaHora_Modifica,
      ...payload
    } = this.razaModel();

    if (_id) {
      this.razasService.actualizar(_id, payload).subscribe({
        next: (raza) => {
          this.guardando.set(false);
          this.dialogRef.close(raza);
        },
        error: () => {
          this.guardando.set(false);
        },
      });
      return;
    }

    this.razasService.crear(payload).subscribe({
      next: (raza) => {
        this.guardando.set(false);
        this.dialogRef.close(raza);
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
