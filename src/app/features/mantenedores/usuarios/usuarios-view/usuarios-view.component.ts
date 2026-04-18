import { Component, Inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

import { NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { IUsuario } from '@usuarios/usuariosInterface';

@Component({
  selector: 'app-usuarios-view',
  standalone: true,
  templateUrl: './usuarios-view.component.html',
  styleUrls: ['./usuarios-view.component.scss'],
  imports: [MatDialogModule, MatCardModule],
})
export class UsuariosViewComponent {
  usuario = signal<IUsuario | null>(null);
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.usuario.set(this.data.usuario);
  }
}
