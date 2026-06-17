import {
  Component,
  Inject,
  OnInit,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTree, MatTreeModule } from '@angular/material/tree';

import TituloComponentePopup from '@app/shared/ui/tituloComponentePopup';
import { Empresa } from '@features/administracion/empresas/empresasInterface';
import { EmpresasService } from '@features/administracion/empresas/empresas.service';
import { MenuItem } from '@shared/interfaces/usuario.interface';

@Component({
  selector: 'app-empresas-view',
  standalone: true,
  templateUrl: './empresas-view.html',
  styleUrls: ['./empresas-view.scss'],
  imports: [
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTreeModule,
    TituloComponentePopup,
  ],
})
export class EmpresasView implements OnInit {
  readonly empresa = signal<Empresa | null>(null);
  readonly isLoading = signal(false);
  private readonly empresasService = inject(EmpresasService);
  readonly titulo = computed(
    () => this.empresa()?.nombreFantasia || this.empresa()?.razonSocial || 'Empresa',
  );
  readonly childrenAccessor = (node: MenuItem) => node.children ?? [];
  @ViewChild('tree') tree: MatTree<MenuItem> | undefined;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { empresa?: Empresa; empresaId?: string },
  ) {
    this.empresa.set(this.data.empresa ?? null);

    effect(() => {
      this.empresa();
      queueMicrotask(() => this.tree?.expandAll());
    });
  }

  ngOnInit(): void {
    if (!this.data.empresaId) {
      return;
    }

    this.isLoading.set(true);
    this.empresasService.obtenerEmpresaPorId(this.data.empresaId).subscribe({
      next: (empresa) => {
        if (empresa) {
          this.empresa.set(empresa);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  hasChild = (_: number, node: MenuItem) => !!node.children?.length;

  displayValue(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return 'No informado';
    }

    return String(value);
  }
}
