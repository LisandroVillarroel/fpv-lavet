export interface ReportQueryParams {
  fechaInicio?: string;
  fechaFin?: string;
  usuario?: string;
  usuarioId?: number;
}

export interface RiesgoAbierto {
  id: string;
  titulo: string;
  impacto: 'Alto' | 'Medio' | 'Bajo';
  probabilidad: 'Alta' | 'Media' | 'Baja';
  responsable: string;
  mitigacion: string;
  estado: 'En seguimiento' | 'Pendiente' | 'Mitigado';
  proximoHito: string | null;
  monto: number;
  diasHastaEntrega: number | null;
}

export interface RiesgosResponse {
  rango: { inicio: string; fin: string };
  total: number;
  items: RiesgoAbierto[];
}

export type TendenciaPresupuesto = 'up' | 'down' | 'flat';

export interface PresupuestoDetalle {
  id: string;
  proyecto: string;
  categoria: string;
  presupuesto: number;
  ejecutado: number;
  variacion: number;
  tendencia: TendenciaPresupuesto;
  fechaEntrega: string | null;
}

export interface PresupuestoResponse {
  rango: { inicio: string; fin: string };
  total: number;
  totales: {
    presupuesto: number;
    ejecutado: number;
    variacion: number;
  };
  items: PresupuestoDetalle[];
}

