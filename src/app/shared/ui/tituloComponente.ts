import { Component, input } from '@angular/core';

@Component({
  selector: 'app-TituloComponente',
  standalone: true,
  imports: [],
  template: ` <h6 class="text-2xl text-center">{{ titulo() }}</h6> `,
})
export class TituloComponente {
  titulo = input<string>();
}
