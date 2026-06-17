import { Component, Inject, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import TituloComponentePopup from '@app/shared/ui/tituloComponentePopup';
import { ICliente } from '@features/laboratorio/administracion/clientes/clientesInterface';
import { ClientesService } from '@features/laboratorio/administracion/clientes/clientes.service';

@Component({
  selector: 'app-clientes-view',
  standalone: true,
  templateUrl: './clientes-view.html',
  styleUrls: ['./clientes-view.scss'],
  imports: [
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TituloComponentePopup,
  ],
})
export class ClientesView implements OnInit {
  readonly cliente = signal<ICliente | null>(null);
  readonly isLoading = signal(false);
  private readonly clientesService = inject(ClientesService);
  readonly nombreCompleto = computed(() => {
    const currentClient = this.cliente();
    return [currentClient?.nombres, currentClient?.apellidoPaterno, currentClient?.apellidoMaterno]
      .filter((value) => !!value)
      .join(' ');
  });

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { cliente?: ICliente; clienteId?: string },
  ) {
    this.cliente.set(this.data.cliente ?? null);
  }

  ngOnInit(): void {
    if (!this.data.clienteId) {
      return;
    }

    this.isLoading.set(true);
    this.clientesService.obtenerClientePorId(this.data.clienteId).subscribe({
      next: (cliente) => {
        if (cliente) {
          this.cliente.set(cliente);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  displayValue(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return 'No informado';
    }

    return String(value);
  }
}
