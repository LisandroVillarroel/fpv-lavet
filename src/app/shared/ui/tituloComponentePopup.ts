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
      <h2 mat-dialog-title class="dialog-title">
        {{ titulo() }}
      </h2>
      <button mat-icon-button mat-dialog-close [disabled]="false" class="cerrar-btn">
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  styles: `
    :host {
      display: block;
      background-color: var(--mat-sys-secondary-fixed-dim);
      color: var(--mat-sys-on-secondary-fixed);
    }

    .barra-titulo {
      position: relative;
      display: flex;
      width: 100%;
      /* padding: 12px 44px !important;*/
      align-items: center;
      justify-content: center;
      background-color: inherit;
      color: inherit;
    }

    .dialog-title {
      margin: 0;
      font-size: 14px;
      background: transparent !important;
      color: inherit;
      height: auto;
      padding: 0;
      width: 100%;
      text-align: center;
    }

    .cerrar-btn {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      align-content: center;
      padding: 0;
      height: 30px;
      width: 30px;
      align-self: center;
      color: inherit;
      background-color: var(--mat-sys-secondary-fixed-dim) !important;
      border-radius: 50%;
      box-shadow: none;
      transition:
        background-color 160ms ease,
        color 160ms ease,
        box-shadow 160ms ease;
    }

    .cerrar-btn .mat-mdc-button-persistent-ripple,
    .cerrar-btn .mat-ripple-element,
    .cerrar-btn .mat-mdc-button-touch-target {
      background: transparent !important;
      opacity: 0 !important;
    }

    .cerrar-btn:hover,
    .cerrar-btn:focus-visible {
      background: var(--mat-sys-secondary-container);
      color: var(--mat-sys-on-secondary-container);
      outline: none;
    }

    .cerrar-btn:focus-visible {
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--mat-sys-primary) 35%, transparent);
    }
  `,
})
export default class TituloComponentePopup {
  titulo = input<string>();
}
