import { Component, input } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDialogClose, MatDialogModule } from '@angular/material/dialog';
import { MatIcon, MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-TituloComponentePopup',
  standalone: true,
  imports: [MatIconModule,MatDialogModule,MatDialogClose,MatIcon,MatIconButton],
  template: `  <div class="barra-titulo titulomodal d-flex" style="width: 100%; padding: 10px 0px 10px 10px !important;">
    <h2 style="margin: 0px 0 0px;">&nbsp; {{ titulo() }} </h2>
    <button mat-icon-button mat-dialog-close [disabled]="false"
      style="align-content: center; padding: 0px 0px 0px; height: 30px; align-self: flex-start;">
      <mat-icon>close</mat-icon>
    </button>
  </div>`,
   styles: `
    .barra-titulo{
      align-items: center;
      justify-content: space-between;
      background-color: var(--mat-sys-secondary-fixed-dim);
  }
  h2{
font-size: 14px;
  }
    `,
})
export default class TituloComponentePopup {
  titulo = input<string>();
}
