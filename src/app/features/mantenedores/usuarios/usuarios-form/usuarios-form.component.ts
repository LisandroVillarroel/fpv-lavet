import { Component, Inject, signal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { form, required, email, minLength, FormField } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { UsuarioService } from '../usuarios.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IUsuario } from '../usuariosInterface';

@Component({
  selector: 'app-usuarios-form',
  standalone: true,
  templateUrl: './usuarios-form.component.html',
  styleUrls: ['./usuarios-form.component.scss'],
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    ReactiveFormsModule,
    FormsModule,
    FormField,
  ],
})
export class UsuariosFormComponent {
  modo: 'agregar' | 'editar';
  isLoading = signal(false);
  error = signal<string | null>(null);

  private userModel = signal<IUsuario>({
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
  });

  usuarioForm = form(this.userModel, (path) => {
    required(path.usuario);
    required(path.contrasena!);
    minLength(path.contrasena!, 6);
    required(path.rutUsuario);
    required(path.nombres);
    required(path.apellidoPaterno);
    required(path.apellidoMaterno);
    required(path.email);
    email(path.email);
  });

  constructor(
    private usuarioService: UsuarioService,
    private dialogRef: MatDialogRef<UsuariosFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.modo = data.modo;

    if (this.modo === 'editar' && data.usuario) {
      this.userModel.set(data.usuario);
    }
  }

  guardar() {
    if (this.usuarioForm().invalid()) {
      return;
    }
    this.isLoading.set(true);
    this.error.set(null);
    const usuario = this.userModel();
    this.usuarioService.agregarModificarUsuario(usuario).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(`Error al ${this.modo === 'agregar' ? 'agregar' : 'modificar'} usuario`);
      },
    });
  }

  cancelar() {
    this.dialogRef.close();
  }
}
