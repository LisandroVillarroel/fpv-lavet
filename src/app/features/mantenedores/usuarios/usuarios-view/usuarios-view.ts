import { Component, Inject, computed, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

import TituloComponentePopup from '@app/shared/ui/tituloComponentePopup';
import { IUsuario } from '@features/mantenedores/usuarios/usuariosInterface';

@Component({
  selector: 'app-usuarios-view',
  standalone: true,
  templateUrl: './usuarios-view.html',
  styleUrls: ['./usuarios-view.scss'],
  imports: [MatDialogModule, MatCardModule, MatButtonModule, TituloComponentePopup],
})
export class UsuariosView {
  usuario = signal<IUsuario | null>(null);
  readonly nombreCompleto = computed(() => {
    const currentUser = this.usuario();
    return [currentUser?.nombres, currentUser?.apellidoPaterno, currentUser?.apellidoMaterno]
      .filter((value) => !!value)
      .join(' ');
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.usuario.set(this.data.usuario);
  }

  displayValue(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return 'No informado';
    }

    return String(value);
  }
}
