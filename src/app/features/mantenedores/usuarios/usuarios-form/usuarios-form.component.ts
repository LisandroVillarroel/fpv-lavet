import { Component, inject, signal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { A11yModule } from '@angular/cdk/a11y';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

import { FormsModule, NgForm } from '@angular/forms';

import { IUsuario } from '@usuarios/usuariosInterface';
import { UsuarioService } from '@usuarios/usuarios.service';
import TituloComponentePopup from '@app/shared/ui/tituloComponentePopup';

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
    TituloComponentePopup,
  ],
})
export class UsuariosFormComponent {
  private readonly usuarioService = inject(UsuarioService);
  private readonly dialogRef = inject(MatDialogRef<UsuariosFormComponent>);
  readonly data = inject(MAT_DIALOG_DATA) as any;

  modo: 'agregar' | 'editar';
  isLoading = signal(false);
  error = signal<string | null>(null);

  usuario: IUsuario = {
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
    tipoUsuario: 'Veterinaria', // O un valor por defecto válido
    estadoUsuario: 'Activo',
  };

  constructor() {
    this.modo = this.data.modo;

    if (this.modo === 'editar' && this.data.usuario) {
      this.usuario = { ...this.data.usuario };
    }
  }

  guardar(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.usuarioService.agregarModificarUsuario(this.usuario).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.dialogRef.close(true);
      },
      error: (_err: unknown) => {
        this.isLoading.set(false);
        this.error.set(`Error al ${this.modo === 'agregar' ? 'agregar' : 'modificar'} usuario`);
      },
    });
  }

  cancelar() {
    this.dialogRef.close();
  }
}
