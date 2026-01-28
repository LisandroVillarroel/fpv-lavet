import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  animate,
  keyframes,
  query,
  stagger,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Progreso } from '@core/guards/progreso';
import { StorageService } from '@core/guards/storage.service';
import { loginInterface } from '@features/auth/interface/loginInterface';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import {
  DashboardChartData,
  DashboardDateRange,
  DashboardRequest,
  DashboardResponse,
  DashboardStats,
} from './portada.models';
import { PortadaDashboardService } from './portada.service';
import { MatDialog } from '@angular/material/dialog';
import { AgregaNotaVentaComponente } from '@features/nota-venta/agrega-nota-venta/agrega-nota-ventaComponente';

type TiempoFiltro = 'hoy' | 'semana' | 'mes' | 'personalizado';

@Component({
  selector: 'app-portada',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressBarModule,
    MatBadgeModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatDividerModule,
    MatListModule,
    MatToolbarModule,
  ],
  templateUrl: './portada.html',
  styleUrls: ['./portada.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate(
          '600ms cubic-bezier(0.35, 0, 0.25, 1)',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('slideInRight', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(50px)' }),
        animate(
          '500ms 200ms cubic-bezier(0.35, 0, 0.25, 1)',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ]),
    ]),
    trigger('slideInLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-50px)' }),
        animate(
          '500ms 200ms cubic-bezier(0.35, 0, 0.25, 1)',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ]),
    ]),
    trigger('staggerIn', [
      transition(':enter', [
        query(
          '.metric-card',
          [
            style({ opacity: 0, transform: 'translateY(50px)' }),
            stagger(
              '100ms',
              animate(
                '600ms cubic-bezier(0.35, 0, 0.25, 1)',
                style({ opacity: 1, transform: 'translateY(0)' })
              )
            ),
          ],
          { optional: true }
        ),
      ]),
    ]),
    trigger('cardHover', [
      state('default', style({ transform: 'scale(1)' })),
      state('hover', style({ transform: 'scale(1.02)' })),
      transition('default <=> hover', animate('200ms ease-in-out')),
    ]),
    trigger('pulseAnimation', [
      transition(':enter', [
        animate(
          '1.5s ease-in-out',
          keyframes([
            style({ opacity: 0.3, offset: 0 }),
            style({ opacity: 0.8, offset: 0.5 }),
            style({ opacity: 0.3, offset: 1 }),
          ])
        ),
      ]),
    ]),
    trigger('listItemSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-100%)' }),
        animate(
          '400ms cubic-bezier(0.25, 0.8, 0.25, 1)',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ]),
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('300ms ease-out', style({ opacity: 0 }))]),
    ]),
  ],
})
export default class Portada implements OnInit, AfterViewInit {
  readonly progreso = inject(Progreso);
  readonly storage = inject(StorageService);
  private readonly dashboardService = inject(PortadaDashboardService);
  private readonly router = inject(Router);
  readonly dialog = inject(MatDialog);

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChartCanvas') pieChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChartCanvas')
  statusChartCanvas!: ElementRef<HTMLCanvasElement>;

  readonly usuario = signal(this.storage.get<loginInterface>('sesion'));
  readonly cargandoDatos = signal(true);
  readonly fechaInicio = signal(
    this.normalizarFecha(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    ) ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  readonly fechaFin = signal(this.normalizarFecha(new Date()) ?? new Date());
  readonly filtroSeleccionado = signal<TiempoFiltro>('mes');
  public fechaInicioLocal: Date = new Date();
  public fechaFinLocal: Date = new Date();
  estadoLeyendaItems: Array<{
    etiqueta: string;
    color: string;
    valor: number;
    porcentaje?: number;
    precioSinIva: number;
  }> = [];
  readonly estadisticas = signal<DashboardStats>({
    proyectosActivos: 0,
    tareasPendientes: 0,
    hitosCerrados: 0,
    avancePromedio: 0,
    presupuestoComprometido: 0,
    desviacionCronograma: 0,
    entregablesSemana: 0,
    riesgosAltos: 0,
  });
  readonly chartData = signal<DashboardChartData>({ labels: [], datasets: [] });
  readonly chartDataPie = signal<DashboardChartData>({
    labels: [],
    datasets: [],
  });

  readonly debeOcultarPortafolio = computed(() => {
    const menuUsuario = this.usuario()?.menuUsuario as unknown;
    if (Array.isArray(menuUsuario)) {
      const contiene = menuUsuario.some((valor) => Number(valor) === 100);
      return !contiene;
    }

    if (menuUsuario !== undefined && menuUsuario !== null) {
      return Number(menuUsuario) !== 100;
    }

    return true;
  });

  readonly textoPortafolioComprometido = computed(() => {
    if (this.debeOcultarPortafolio()) {
      return '$***';
    }
    return this.formatearMoneda(this.estadisticas().presupuestoComprometido);
  });

  readonly textoDesviacionCronograma = computed(() => {
    const stats = this.estadisticas();
    if (this.debeOcultarPortafolio()) {
      return '$***';
    }

    if (stats.desviacionCronograma === undefined) {
      return '—';
    }

    return this.formatearPorcentaje(stats.desviacionCronograma, {
      conSigno: true,
    });
  });

  readonly puedeCrearNuevoProyecto = computed(
    () => !this.debeOcultarPortafolio()
  );

  readonly fechaFormateada = computed(() => {
    const inicio = this.fechaInicio();
    const fin = this.fechaFin();
    return `${inicio.toLocaleDateString()} - ${fin.toLocaleDateString()}`;
  });

  readonly nombreUsuario = computed(() => {
    return this.usuario()?.usuarioLogin?.nombres || 'Usuario';
  });

  readonly saludoHora = computed(() => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 18) return 'Buenas tardes';
    return 'Buenas noches';
  });

  readonly indicadoresBreves = computed(() => {
    const stats = this.estadisticas();
    return [
      {
        etiqueta: 'Portafolio comprometido',
        valor: this.textoPortafolioComprometido(),
        icono: 'account_balance',
      },
      {
        etiqueta: 'Desviación cronograma',
        valor: this.textoDesviacionCronograma(),
        icono: 'schedule',
      },
      {
        etiqueta: 'Entregables semana',
        valor: stats.entregablesSemana ?? '—',
        icono: 'assignment_turned_in',
      },
      {
        etiqueta: 'Riesgos altos',
        valor: stats.riesgosAltos ?? '—',
        icono: 'warning_amber',
      },
    ];
  });

  readonly puedeVerReportesClave = computed(() =>
    this.puedeCrearNuevoProyecto()
  );

  ngOnInit(): void {
    this.sincronizarFechasLocales();
    this.cargarDashboard();
  }

  ngAfterViewInit(): void {
    // Los gráficos se dibujan tras completar la carga inicial de datos
  }

  async cargarDashboard(): Promise<void> {
    this.cargandoDatos.set(true);
    this.progreso.ejecutar();

    try {
      const payload: DashboardRequest = {
        fechaInicio: this.formatearFechaParam(this.fechaInicio()),
        fechaFin: this.formatearFechaParam(this.fechaFin()),
      };

      const usuarioSesion = this.usuario()?.usuarioLogin;
      if (usuarioSesion?.usuario) {
        payload.usuario = usuarioSesion.usuario;
      }

      const respuesta: DashboardResponse = await firstValueFrom(
        this.dashboardService.obtenerDashboard(payload)
      );

      if (respuesta.estadisticas) {
        this.estadisticas.set(respuesta.estadisticas);
      }

      if (respuesta.graficoAvance) {
        this.chartData.set(respuesta.graficoAvance);
      }

      if (respuesta.graficoEstadoActividades) {
        this.chartDataPie.set(respuesta.graficoEstadoActividades);
        this.actualizarEstadoLeyenda();
      } else {
        this.chartDataPie.set({ labels: [], datasets: [] });
        this.estadoLeyendaItems = [];
      }

      if (respuesta.resumen?.periodo) {
        this.actualizarPeriodoDesdeBackend(respuesta.resumen.periodo);
      }
    } catch (error) {
      console.error('Error cargando dashboard:', error);
      this.estadisticas.set({
        proyectosActivos: 0,
        tareasPendientes: 0,
        hitosCerrados: 0,
        avancePromedio: 0,
        presupuestoComprometido: 0,
        desviacionCronograma: 0,
        entregablesSemana: 0,
        riesgosAltos: 0,
      });
      this.chartData.set({ labels: [], datasets: [] });
      this.chartDataPie.set({ labels: [], datasets: [] });
      this.estadoLeyendaItems = [];
    } finally {
      this.cargandoDatos.set(false);
      this.progreso.parar();
      setTimeout(() => {
        this.renderizarGraficoBarras();
        this.renderizarGraficoPie();
        this.renderizarGraficoEstados();
      }, 140);
    }
  }

  onFechaChange(): void {
    this.filtroSeleccionado.set('personalizado');
    this.cargarDashboard();
  }

  public actualizarFechaInicio(fecha: Date | null): void {
    const normalizada = this.normalizarFecha(fecha);
    if (!normalizada) {
      return;
    }
    this.fechaInicioLocal = normalizada;
    this.fechaInicio.set(normalizada);
    this.sincronizarFechasLocales();
    this.onFechaChange();
  }

  public actualizarFechaFin(fecha: Date | null): void {
    const normalizada = this.normalizarFecha(fecha);
    if (!normalizada) {
      return;
    }
    this.fechaFinLocal = normalizada;
    this.fechaFin.set(normalizada);
    this.sincronizarFechasLocales();
    this.onFechaChange();
  }

  private normalizarFecha(
    fecha: Date | string | null | undefined
  ): Date | null {
    if (!fecha) {
      return null;
    }

    const origen = fecha instanceof Date ? fecha : new Date(fecha);
    if (Number.isNaN(origen.getTime())) {
      return null;
    }

    const year = origen.getUTCFullYear();
    const month = origen.getUTCMonth();
    const day = origen.getUTCDate();
    return new Date(year, month, day, 12, 0, 0, 0);
  }

  private sincronizarFechasLocales(): void {
    const inicio =
      this.normalizarFecha(this.fechaInicio()) ?? this.fechaInicio();
    const fin = this.normalizarFecha(this.fechaFin()) ?? this.fechaFin();
    this.fechaInicioLocal = new Date(inicio.getTime());
    this.fechaFinLocal = new Date(fin.getTime());
  }

  private actualizarEstadoLeyenda(): void {
    const data = this.chartDataPie();
    if (!data.labels.length || !data.datasets.length) {
      this.estadoLeyendaItems = [];
      return;
    }

    const dataset = data.datasets[0];
    if (!dataset) {
      this.estadoLeyendaItems = [];
      return;
    }

    const coloresDefault = [
      '#1976d2',
      '#64b5f6',
      '#2e7d32',
      '#fb8c00',
      '#c62828',
      '#6d4c41',
      '#00838f',
      '#7b1fa2',
    ];

    const total = dataset.data.reduce((acc, val) => acc + val, 0) || 1;
    // @ts-ignore: Se agrega la propiedad totalPrecioSinIva al dataset desde el backend
    this.estadoLeyendaItems = data.labels.map((label, index) => ({
      etiqueta: this.extraerSiglaEstado(label),
      color:
        dataset.backgroundColor?.[index] ??
        coloresDefault[index % coloresDefault.length],
      valor: dataset.data[index] ?? 0,
      porcentaje: Math.round(((dataset.data[index] ?? 0) / total) * 100),
      precioSinIva: (dataset as any).totalPrecioSinIva?.[index] ?? 0,
    }));

  }



  seleccionarFiltro(filtro: TiempoFiltro): void {
    this.filtroSeleccionado.set(filtro);
    switch (filtro) {
      case 'hoy':
        this.filtrarHoy();
        break;
      case 'semana':
        this.filtrarSemana();
        break;
      case 'mes':
        this.filtrarMes();
        break;
      default:
        this.cargarDashboard();
        break;
    }
  }

  filtrarHoy(): void {
    const hoy = new Date();
    const inicio =
      this.normalizarFecha(hoy) ??
      new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 12, 0, 0, 0);
    const fin = new Date(inicio.getTime());
    this.fechaInicio.set(inicio);
    this.fechaFin.set(fin);
    this.sincronizarFechasLocales();
    this.cargarDashboard();
  }

  filtrarSemana(): void {
    const hoy = new Date();
    const primerDia =
      this.normalizarFecha(
        new Date(
          hoy.getFullYear(),
          hoy.getMonth(),
          hoy.getDate() - ((hoy.getDay() + 6) % 7)
        )
      ) ??
      new Date(
        hoy.getFullYear(),
        hoy.getMonth(),
        hoy.getDate() - ((hoy.getDay() + 6) % 7),
        12,
        0,
        0,
        0
      );
    const ultimoDia =
      this.normalizarFecha(
        new Date(
          primerDia.getFullYear(),
          primerDia.getMonth(),
          primerDia.getDate() + 6
        )
      ) ??
      new Date(
        primerDia.getFullYear(),
        primerDia.getMonth(),
        primerDia.getDate() + 6,
        12,
        0,
        0,
        0
      );
    this.fechaInicio.set(primerDia);
    this.fechaFin.set(ultimoDia);
    this.sincronizarFechasLocales();
    this.cargarDashboard();
  }

  filtrarMes(): void {
    const hoy = new Date();
    const primerDia =
      this.normalizarFecha(new Date(hoy.getFullYear(), hoy.getMonth(), 1)) ??
      new Date(hoy.getFullYear(), hoy.getMonth(), 1, 12, 0, 0, 0);
    const ultimoDia =
      this.normalizarFecha(
        new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
      ) ?? new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 12, 0, 0, 0);
    this.fechaInicio.set(primerDia);
    this.fechaFin.set(ultimoDia);
    this.sincronizarFechasLocales();
    this.cargarDashboard();
  }

  formatearNumero(valor: number): string {
    return new Intl.NumberFormat('es-CL').format(valor);
  }

  formatearMoneda(valor?: number | null): string {
    if (valor === undefined || valor === null) {
      return '—';
    }

    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(valor);
  }

  formatearPorcentaje(
    valor: number,
    opciones: { conSigno?: boolean } = {}
  ): string {
    const formatter = new Intl.NumberFormat('es-CL', {
      style: 'percent',
      maximumFractionDigits: 0,
    });
    const texto = formatter.format(valor / 100);
    if (!opciones.conSigno) {
      return texto;
    }
    return valor > 0 ? `+${texto}` : texto;
  }

  clamp(valor: number, minimo: number, maximo: number): number {
    return Math.min(Math.max(valor, minimo), maximo);
  }

  calcularPorcentajeHitosCerrados(): number {
    const stats = this.estadisticas();
    const total = stats.hitosCerrados + stats.tareasPendientes;
    if (total <= 0) {
      return 0;
    }
    return (stats.hitosCerrados / total) * 100;
  }

  crearProyecto() {
    const enterAnimationDuration = '250ms';
    const exitAnimationDuration = '250ms';
    const dialogConfig = {
      maxWidth: '98vw',
      maxHeight: '98vh',
      height: '95%',
      width: '80%',
      position: { top: '2%' },
      enterAnimationDuration,
      exitAnimationDuration,
      panelClass: 'full-screen-modal',

      data: {},
    };
    this.dialog
      .open(AgregaNotaVentaComponente, dialogConfig)
      .afterClosed()
      .subscribe((data) => {
        console.log('Dialog output3333:', data);
      });
  }

  registrarAvance(): void {
    console.log('Registrar avance de actividad');
  }

  programarReunion(): void {
    console.log('Programar reunión de seguimiento');
  }

  gestionarRiesgos(): void {
    console.log('Gestionar matriz de riesgos');
  }

  verTableroTrabajo(): void {
    console.log('Abrir tablero de trabajo');
  }

  verDetallePortafolio(): void {
    console.log('Ver portafolio completo de proyectos');
  }

  exportarReportes(): void {
    this.router.navigate(['/portada', 'reportes']);
  }

  abrirReporteRiesgos(): void {
    this.router.navigate(['/portada', 'reportes', 'riesgos']);
  }

  abrirReportePresupuesto(): void {
    this.router.navigate(['/portada', 'reportes', 'presupuesto']);
  }

  private formatearFechaParam(fecha: Date): string {
    const local = this.normalizarFecha(fecha) ?? fecha;
    const year = local.getFullYear();
    const month = String(local.getMonth() + 1).padStart(2, '0');
    const day = String(local.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private actualizarPeriodoDesdeBackend(periodo: DashboardDateRange): void {
    const inicio = this.parseFechaApi(periodo.inicio);
    const fin = this.parseFechaApi(periodo.fin);

    if (inicio) {
      this.fechaInicio.set(inicio);
    }

    if (fin) {
      this.fechaFin.set(fin);
    }

    this.sincronizarFechasLocales();
  }

  private parseFechaApi(valor: string | undefined): Date | null {
    if (!valor) {
      return null;
    }

    const match = /^\d{4}-\d{2}-\d{2}$/.exec(valor);
    if (match) {
      const [year, month, day] = valor.split('-').map(Number);
      const resultado = new Date(year, (month ?? 1) - 1, day ?? 1, 12, 0, 0, 0);
      if (!Number.isNaN(resultado.getTime())) {
        return resultado;
      }
    }

    const parsed = new Date(valor);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return new Date(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth(),
      parsed.getUTCDate(),
      12,
      0,
      0,
      0
    );
  }

  private renderizarGraficoBarras(): void {
    if (!this.chartCanvas) return;

    const data = this.chartData();
    if (!data.labels.length || !data.datasets.length) return;

    const dataset = data.datasets[0];
    if (!dataset) return;
    const canvas = this.chartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const puntos: Array<{ etiqueta: string; valor: number }> = data.labels.map(
      (label, index) => ({
        etiqueta: label,
        valor: dataset.data[index] ?? 0,
      })
    );

    if (!puntos.length) {
      ctx.clearRect(0, 0, rect.width, rect.height);
      return;
    }

    const padding = 60;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = rect.height - padding * 2;
    const barWidth = (chartWidth / puntos.length) * 0.55;
    const maxValor = Math.max(...puntos.map((punto) => punto.valor), 100);

    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.font = '12px "Roboto", sans-serif';
    ctx.fillStyle = '#5f6368';

    puntos.forEach((punto, index) => {
      const x =
        padding +
        (chartWidth / puntos.length) * index +
        (chartWidth / puntos.length - barWidth) / 2;
      const barHeight = (punto.valor / maxValor) * chartHeight;
      const y = rect.height - padding - barHeight;

      const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
      gradient.addColorStop(0, dataset.borderColor ?? '#1e88e5');
      gradient.addColorStop(1, '#64b5f6');

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);

      ctx.fillStyle = '#5f6368';
      ctx.textAlign = 'center';
      ctx.fillText(punto.etiqueta, x + barWidth / 2, rect.height - 18);

      ctx.fillStyle = '#1a237e';
      ctx.font = 'bold 11px "Roboto", sans-serif';
      ctx.fillText(`${punto.valor}%`, x + barWidth / 2, y - 6);
    });

    ctx.save();
    ctx.translate(18, rect.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#424242';
    ctx.font = '12px "Roboto", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Avance mensual (%)', 0, 0);
    ctx.restore();
  }

  private renderizarGraficoPie(): void {
    if (!this.pieChartCanvas) return;

    const data = this.chartDataPie();
    if (!data.labels.length || !data.datasets.length) return;

    const dataset = data.datasets[0];
    const coloresDefault = [
      '#1976d2',
      '#64b5f6',
      '#2e7d32',
      '#fb8c00',
      '#c62828',
    ];
    const canvas = this.pieChartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const segmentos: Array<{
      etiqueta: string;
      valor: number;
      color: string;
    }> = data.labels.map((label, index) => ({
      etiqueta: this.extraerSiglaEstado(label),
      valor: dataset.data[index] ?? 0,
      color:
        dataset.backgroundColor?.[index] ??
        coloresDefault[index % coloresDefault.length],
    }));

    if (!segmentos.length) {
      ctx.clearRect(0, 0, rect.width, rect.height);
      return;
    }

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    let radius = Math.min(rect.width, rect.height) / 2 - 30;
    if (radius < 1) radius = 1;
    const total = segmentos.reduce((sum, item) => sum + item.valor, 0);

    ctx.clearRect(0, 0, rect.width, rect.height);

    let currentAngle = -Math.PI / 2;
    segmentos.forEach((segmento) => {
      const sliceAngle = total > 0 ? (segmento.valor / total) * 2 * Math.PI : 0;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(
        centerX,
        centerY,
        radius,
        currentAngle,
        currentAngle + sliceAngle
      );
      ctx.closePath();
      ctx.fillStyle = segmento.color;
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * radius * 0.65;
      const labelY = centerY + Math.sin(labelAngle) * radius * 0.65;

      // Mejorar contraste del texto según el color de fondo
      function getContrastYIQ(hexcolor: string) {
        hexcolor = hexcolor.replace('#', '');
        const r = parseInt(hexcolor.substr(0, 2), 16);
        const g = parseInt(hexcolor.substr(2, 2), 16);
        const b = parseInt(hexcolor.substr(4, 2), 16);
        const yiq = (r * 299 + g * 587 + b * 114) / 1000;
        return yiq >= 128 ? '#222222' : '#ffffff';
      }
      ctx.fillStyle = getContrastYIQ(segmento.color);
      ctx.font = 'bold 11px "Roboto", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const porcentaje =
        total > 0 ? Math.round((segmento.valor / total) * 100) : 0;
      ctx.fillText(`${porcentaje}%`, labelX, labelY);

      currentAngle += sliceAngle;
    });

    const legendStartX = 16;
    const legendStartY = 12;
    const legendItemHeight = 20;

    segmentos.forEach((segmento, index) => {
      // Eliminado: no mostrar nombres ni colores sobre el gráfico
    });
  }

  private renderizarGraficoEstados(): void {
    if (!this.statusChartCanvas) return;

    const data = this.chartDataPie();
    if (!data.labels.length || !data.datasets.length) return;

    const dataset = data.datasets[0];
    if (!dataset) return;

    const canvas = this.statusChartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const filas = data.labels.map((label, index) => ({
      etiqueta: this.extraerSiglaEstado(label),
      valor: dataset.data[index] ?? 0,
      color:
        dataset.backgroundColor?.[index] ??
        ['#1976d2', '#64b5f6', '#2e7d32', '#fb8c00', '#c62828'][index % 5],
    }));

    if (!filas.length) {
      ctx.clearRect(0, 0, rect.width, rect.height);
      return;
    }

    const paddingY = 24;
    const paddingX = 24;
    const areaWidth = rect.width - paddingX * 2;
    const areaHeight = rect.height - paddingY * 2;
    const gap = 18;
    const totalGap = gap * Math.max(filas.length - 1, 0);
    const barHeight = Math.max(
      12,
      (areaHeight - totalGap) / Math.max(filas.length, 1)
    );
    const maxValor = Math.max(...filas.map((item) => item.valor), 1);

    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.font = '12px "Roboto", sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#5f6368';

    filas.forEach((fila, index) => {
      const y = paddingY + index * (barHeight + gap) + barHeight / 2;
      const longitud = Math.max(
        (fila.valor / maxValor) * areaWidth,
        fila.valor > 0 ? 6 : 2
      );

      const barX = paddingX;
      const barY = y - barHeight / 2;

      const ctxAny = ctx as CanvasRenderingContext2D & {
        roundRect?: (
          x: number,
          y: number,
          width: number,
          height: number,
          radii?: number | DOMPointInit | DOMPointInit[]
        ) => void;
      };

      ctx.fillStyle = fila.color;
      ctx.beginPath();
      if (ctxAny.roundRect) {
        ctxAny.roundRect(barX, barY, longitud, barHeight, 6);
        ctx.fill();
      } else {
        ctx.fillRect(barX, barY, longitud, barHeight);
      }

      // Mostrar solo la cantidad, centrada dentro de la barra, con contraste
      function getContrastYIQ(hexcolor: string): string {
        hexcolor = hexcolor.replace('#', '');
        const r = parseInt(hexcolor.substring(0, 2), 16);
        const g = parseInt(hexcolor.substring(2, 4), 16);
        const b = parseInt(hexcolor.substring(4, 6), 16);
        const yiq = (r * 299 + g * 587 + b * 114) / 1000;
        return yiq >= 128 ? '#222222' : '#ffffff';
      }
      ctx.fillStyle = getContrastYIQ(fila.color);
      ctx.font = 'bold 13px "Roboto", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${fila.valor}`, barX + longitud / 2, y);
    });
  }

  private extraerSiglaEstado(label: string | undefined): string {
    if (!label) {
      return '—';
    }

    const trimmed = label.trim();
    const separatorIndex = trimmed.indexOf('-');
    if (separatorIndex === -1) {
      return trimmed || '—';
    }

    const sigla = trimmed.slice(separatorIndex + 1).trim();
    if (sigla.length > 0) {
      return sigla;
    }

    const fallback = trimmed.slice(0, separatorIndex).trim();
    return fallback || trimmed;
  }
}
