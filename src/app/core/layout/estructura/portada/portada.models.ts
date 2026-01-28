export interface DashboardDateRange {
  inicio: string;
  fin: string;
}

export interface DashboardStats {
  proyectosActivos: number;
  tareasPendientes: number;
  hitosCerrados: number;
  avancePromedio: number;
  presupuestoComprometido?: number;
  desviacionCronograma?: number;
  entregablesSemana?: number;
  riesgosAltos?: number;
}

export interface DashboardChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string[];
  borderColor?: string;
}

export interface DashboardChartData {
  labels: string[];
  datasets: DashboardChartDataset[];
}

export interface DashboardResumen {
  usuarioId: number;
  usuarioNombre: string;
  saludo: string;
  periodo: DashboardDateRange;
}

export interface DashboardResponse {
  resumen: DashboardResumen;
  estadisticas: DashboardStats;
  graficoAvance: DashboardChartData;
  graficoEstadoActividades: DashboardChartData;
}

export interface DashboardRequest {
  usuario?: string;
  usuarioId?: number;
  fechaInicio: string;
  fechaFin: string;
}
