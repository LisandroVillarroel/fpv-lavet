import { Component, input } from '@angular/core';

@Component({
  selector: 'app-TituloComponente',
  standalone: true,
  imports: [],
  template: ` <div class="titulo-componente">{{ titulo() }}</div> `,
  styles: `
    .titulo-componente {
      color: var(--mat-sys-primary);
      margin: 0;
      text-align: center;
      font-size: 1.2rem;
      line-height: 1.2;
      font-weight: 500;
    }
  `,
})
export class TituloComponente {
  titulo = input<string>();
}
