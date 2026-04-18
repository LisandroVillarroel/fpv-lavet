import { Component, input } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDialogClose, MatDialogModule } from '@angular/material/dialog';
import { MatIcon, MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-TituloComponentePopup',
  standalone: true,
  imports: [MatIconModule, MatDialogModule, MatDialogClose, MatIcon, MatIconButton],
  template: `
    <div class="barra-titulo titulomodal">
      <h2>&nbsp; {{ titulo() }}</h2>
      <button mat-icon-button mat-dialog-close [disabled]="false" class="cerrar-btn">
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  styles: `
    .barra-titulo {
      display: flex;
      width: 100%;
      padding: 10px 0 10px 10px !important;
      align-items: center;
      justify-content: space-between;
      background-color: var(--mat-sys-secondary-fixed-dim);
      color: var(--mat-sys-on-secondary-fixed);
    }

    h2 {
      margin: 0;
      font-size: 14px;
    }

    .cerrar-btn {
      align-content: center;
      padding: 0;
      height: 30px;
      align-self: flex-start;
      color: inherit;
    }
  `,
})
export default class TituloComponentePopup {
  titulo = input<string>();
}
