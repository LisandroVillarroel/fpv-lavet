import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormField, form, required, validate } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { finalize } from 'rxjs';

import { AuthTokenService } from '@core/services/auth-token.service';
import { UserService } from '@core/services/user.service';

type CambioContrasenaFormModel = {
  contrasenaActual: string;
  nuevaContrasena: string;
  confirmarContrasena: string;
};

@Component({
  selector: 'app-cambio-contrasena',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FormField,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './cambio-contrasena.html',
  styleUrl: './cambio-contrasena.scss',
})
export class CambioContrasena {
  readonly #userService = inject(UserService);
  readonly #authToken = inject(AuthTokenService);

  readonly session = this.#authToken.session;
  readonly isSaving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly formModel = signal<CambioContrasenaFormModel>({
    contrasenaActual: '',
    nuevaContrasena: '',
    confirmarContrasena: '',
  });

  readonly passwordForm = form(this.formModel, (schema) => {
    required(schema.contrasenaActual, { message: 'La contraseña actual es obligatoria' });
    required(schema.nuevaContrasena, { message: 'La nueva contraseña es obligatoria' });
    validate(schema.nuevaContrasena, (field) => {
      const value = field.value()?.trim() ?? '';
      if (!value) {
        return [];
      }

      return value.length >= 6
        ? []
        : [{ kind: 'minlength', message: 'La nueva contraseña debe tener al menos 6 caracteres' }];
    });
    required(schema.confirmarContrasena, { message: 'La confirmación es obligatoria' });
    validate(schema.confirmarContrasena, (field) => {
      const confirmationValue = field.value()?.trim() ?? '';
      const nuevaContrasena = this.passwordForm.nuevaContrasena().value()?.trim() ?? '';

      if (!confirmationValue || !nuevaContrasena) {
        return [];
      }

      return confirmationValue === nuevaContrasena
        ? []
        : [{ kind: 'mismatch', message: 'Las contraseñas no coinciden' }];
    });
  });

  readonly isFormInvalid = computed(() => !this.passwordForm().valid());

  readonly nombreUsuario = computed(() => {
    const user = this.session()?.user;
    return [user?.nombres, user?.apellidoPaterno].filter(Boolean).join(' ').trim() || user?.usuario;
  });

  submit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.passwordForm.contrasenaActual().markAsTouched();
    this.passwordForm.nuevaContrasena().markAsTouched();
    this.passwordForm.confirmarContrasena().markAsTouched();

    if (!this.passwordForm().valid()) {
      return;
    }

    const contrasenaActual = this.passwordForm.contrasenaActual().value() ?? '';
    const nuevaContrasena = this.passwordForm.nuevaContrasena().value() ?? '';
    this.isSaving.set(true);
    this.#userService
      .changePassword(contrasenaActual, nuevaContrasena)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (response) => {
          if (response.error) {
            this.errorMessage.set(response.mensaje || 'No fue posible actualizar la contraseña');
            return;
          }

          this.successMessage.set(response.mensaje || 'Contraseña actualizada correctamente');
          this.formModel.set({
            contrasenaActual: '',
            nuevaContrasena: '',
            confirmarContrasena: '',
          });
        },
        error: (error) => {
          this.errorMessage.set(
            error?.error?.mensaje || 'Ocurrió un error al intentar actualizar la contraseña',
          );
        },
      });
  }
}
