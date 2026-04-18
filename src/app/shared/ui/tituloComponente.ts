import { Component, input } from '@angular/core';

@Component({
  selector: 'app-TituloComponente',
  standalone: true,
  imports: [],
  template: ` <h6 class="titulo-componente">{{ titulo() }}</h6> `,
  styles: `
    .titulo-componente {
      color: var(--mat-sys-on-surface);
      margin: 0;
      text-align: center;
      font-size: 1.5rem;
      line-height: 1.2;
    }
  `,
})
export class TituloComponente {
  titulo = input<string>();
}
