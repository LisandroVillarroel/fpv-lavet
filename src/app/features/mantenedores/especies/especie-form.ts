import { Component, inject, signal, computed, input } from '@angular/core';
import { form, required } from '@angular/forms/signals';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { IEspecie } from './especie.interface';
import { EspeciesService } from './especies.service';
import { StorageService } from '@core/guards/storage.service';
import { loginInterface } from '@core/auth/loginInterface';

@Component({
  selector: 'app-especie-form',
  standalone: true,
  templateUrl: './especie-form.html',
  styleUrls: ['./especie-form.scss'],
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule],
})
export class EspecieForm {
  data = input<Partial<IEspecie>>();
  dialogRef = inject(MatDialogRef<EspecieForm>);
  especiesService = inject(EspeciesService);
  storage = inject(StorageService);

  especieModel = signal<IEspecie>({
    _id: this.data()?._id,
    nombre: this.data()?.nombre ?? '',
    empresa_Id: this.data()?.empresa_Id ?? this.getEmpresaId(),
    estado: this.data()?.estado ?? 'Activo',
    usuarioCrea_id: this.data()?.usuarioCrea_id ?? this.getUsuarioId(),
    // fechaHora_Crea se debe setear en backend
  });

  // Reactivar el modelo si cambian los datos de entrada (edición)
  ngOnChanges() {
    this.especieModel.set({
      _id: this.data()?._id,
      nombre: this.data()?.nombre ?? '',
      empresa_Id: this.data()?.empresa_Id ?? this.getEmpresaId(),
      estado: this.data()?.estado ?? 'Activo',
      usuarioCrea_id: this.data()?.usuarioCrea_id ?? this.getUsuarioId(),
    });
  }

  getEmpresaId(): string {
    const sesion = this.storage.get<loginInterface>('sesion-lavet');
    return sesion?.user?.empresa?.empresaId || '';
  }

  getUsuarioId(): string {
    const sesion = this.storage.get<loginInterface>('sesion-lavet');
    return sesion?.user?._id || '';
  }

  especieForm = form(this.especieModel, (schema) => {
    required(schema.nombre, { message: 'Nombre es requerido' });
  });

  // Sincronizar ngModel con el signal para validación reactiva
  onNombreChange(nombre: string) {
    this.especieModel.update((prev) => ({ ...prev, nombre }));
  }

  readonly isFormInvalid = computed(() => !this.especieForm().valid());

  guardando = signal(false);

  guardar() {
    if (this.isFormInvalid() || this.guardando()) return;
    this.guardando.set(true);
    const { fechaHora_Crea, ...toSend } = this.especieModel();
    if (toSend._id) {
      // Modificar
      this.especiesService.update(toSend._id, toSend).subscribe({
        next: (data) => {
          this.guardando.set(false);
          this.dialogRef.close(data);
        },
        error: () => {
          this.guardando.set(false);
        },
      });
    } else {
      // Alta
      this.especiesService.create(toSend).subscribe({
        next: (data) => {
          this.guardando.set(false);
          this.dialogRef.close(data);
        },
        error: () => {
          this.guardando.set(false);
        },
      });
    }
  }

  cancelar() {
    this.dialogRef.close();
  }
}
