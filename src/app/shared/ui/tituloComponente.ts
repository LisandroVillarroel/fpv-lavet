import { Component, input } from '@angular/core';

@Component({
  selector: 'app-TituloComponente',
  standalone: true,
  imports: [],
  template: ` <h6 class="titulo-componente text-2xl text-center">{{ titulo() }}</h6> `,
  styles: `
    .titulo-componente {
      color: var(--mat-sys-on-surface);
    }
  `,
})
export class TituloComponente {
  titulo = input<string>();
}
