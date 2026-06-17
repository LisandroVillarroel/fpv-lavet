import { Component, inject, signal, computed, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { loginInterface } from '@core/auth/loginInterface';
import { StorageService } from '@core/guards/storage.service';
import { ICategoria } from './categoria.interface';
import { CategoriasService } from './categorias.service';

@Component({
  selector: 'app-categoria-form',
  standalone: true,
  templateUrl: './categoria-form.html',
  styleUrls: ['./categoria-form.scss'],
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule],
})
export class CategoriaForm {
  data = input<Partial<ICategoria>>();
  dialogRef = inject(MatDialogRef<CategoriaForm>);
  categoriasService = inject(CategoriasService);
  storage = inject(StorageService);

  categoriaModel = signal<ICategoria>({
    _id: this.data()?._id,
    nombre: this.data()?.nombre ?? '',
    sigla: this.data()?.sigla ?? '',
    empresa_Id: this.data()?.empresa_Id ?? this.getEmpresaId(),
    estado: this.data()?.estado ?? 'Activo',
    usuarioCrea_id: this.data()?.usuarioCrea_id ?? this.getUsuarioId(),
  });

  ngOnChanges() {
    this.categoriaModel.set({
      _id: this.data()?._id,
      nombre: this.data()?.nombre ?? '',
      sigla: this.data()?.sigla ?? '',
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

  categoriaForm = form(this.categoriaModel, (schema) => {
    required(schema.nombre, { message: 'Nombre es requerido' });
    required(schema.sigla, { message: 'Sigla es requerida' });
  });

  onNombreChange(nombre: string) {
    this.categoriaModel.update((prev) => ({ ...prev, nombre }));
  }

  onSiglaChange(sigla: string) {
    this.categoriaModel.update((prev) => ({ ...prev, sigla }));
  }

  readonly isFormInvalid = computed(() => !this.categoriaForm().valid());

  guardando = signal(false);

  guardar() {
    if (this.isFormInvalid() || this.guardando()) return;

    this.guardando.set(true);
    const { fechaHora_Crea, fechaHora_Modifica, ...toSend } = this.categoriaModel();

    if (toSend._id) {
      this.categoriasService.update(toSend._id, toSend).subscribe({
        next: (data) => {
          this.guardando.set(false);
          this.dialogRef.close(data);
        },
        error: () => {
          this.guardando.set(false);
        },
      });
      return;
    }

    this.categoriasService.create(toSend).subscribe({
      next: (data) => {
        this.guardando.set(false);
        this.dialogRef.close(data);
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
