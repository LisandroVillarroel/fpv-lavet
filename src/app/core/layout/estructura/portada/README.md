# Dashboard de Portada - Sistema de Gestión de Ventas

Este dashboard moderno está construido con Angular 18+ y Angular Material, siguiendo las mejores prácticas de desarrollo.

## 🚀 Características Principales

### **Diseño Moderno y Responsive**
- **Diseño Material Design 3** con Angular Material
- **Gradientes y sombras** para una apariencia moderna
- **Totalmente responsive** - se adapta a móviles, tablets y desktop
- **Animaciones fluidas** con CSS transitions y animations
- **Skeleton loaders** durante la carga de datos

### **Funcionalidades del Dashboard**

#### 1. **Header de Bienvenida Personalizado**
- Saludo dinámico basado en la hora del día
- Información del usuario logueado
- Período de consulta activo

#### 2. **Filtros Avanzados por Fecha**
- **Selector de fecha inicio/fin** con Material Datepicker
- **Actualización automática** al cambiar filtros
- **Botón de recarga** manual
- Integrado con el sistema de nota-venta

#### 3. **Métricas Principales (KPIs)**
- **Ventas Totales** del período
- **Ventas del día** actual
- **Ventas del mes** en curso
- **Promedio por venta**
- **Indicadores de tendencia** (positiva/negativa)
- **Colores temáticos** para cada métrica

#### 4. **Sección de Gráficos**
- **Área preparada** para integrar Chart.js o ng2-charts
- **Tendencias de ventas** por período
- **Diseño responsive** para el contenedor de gráficos

#### 5. **Lista de Ventas Recientes**
- **Últimas transacciones** del sistema
- **Estados visuales** con chips de colores
- **Información completa**: cliente, monto, fecha, estado
- **Avatar generado** con iniciales del cliente

## 🛠️ Tecnologías Utilizadas

### **Angular 18+ Features**
- ✅ **Standalone Components**
- ✅ **Signals** para estado reactivo
- ✅ **Computed values** para valores derivados
- ✅ **Control flow** con @if/@for/@empty
- ✅ **OnPush Change Detection** para performance

### **Angular Material Components**
- `MatCardModule` - Tarjetas principales
- `MatButtonModule` - Botones de acción
- `MatIconModule` - Iconografía
- `MatDatepickerModule` - Selectores de fecha
- `MatFormFieldModule` - Campos de formulario
- `MatInputModule` - Inputs de texto
- `MatTableModule` - Tablas de datos
- `MatChipsModule` - Chips de estado
- `MatProgressBarModule` - Barras de progreso
- `MatBadgeModule` - Badges informativos
- `MatTooltipModule` - Tooltips
- `MatDividerModule` - Separadores

## 📊 Estructura de Datos

### **Interfaces Principales**

```typescript
interface DashboardStats {
  totalVentas: number;
  ventasHoy: number;
  ventasMes: number;
  promedioVenta: number;
}

interface VentaReciente {
  id: number;
  cliente: string;
  monto: number;
  fecha: Date;
  estado: string;
}
```

### **Signals Implementados**

```typescript
readonly usuario = signal(usuarioLogueado);
readonly cargandoDatos = signal<boolean>(false);
readonly fechaInicio = signal<Date>(inicioMes);
readonly fechaFin = signal<Date>(fechaActual);
readonly estadisticas = signal<DashboardStats>(datosIniciales);
readonly ventasRecientes = signal<VentaReciente[]>([]);
```

### **Computed Values**

```typescript
readonly fechaFormateada = computed(() => rangoFechas);
readonly nombreUsuario = computed(() => nombreCompleto);
readonly saludoHora = computed(() => saludoDinamico);
```

## 🎨 Sistema de Estilos

### **Paleta de Colores**
- **Primary**: Gradiente azul-púrpura (#667eea → #764ba2)
- **Success**: Gradiente verde (#11998e → #38ef7d)
- **Warning**: Gradiente rosa (#f093fb → #f5576c)
- **Info**: Gradiente azul claro (#4facfe → #00f2fe)

### **Componentes de Diseño**
- **Cards con gradientes** y sombras suaves
- **Skeleton loaders** con animación shimmer
- **Hover effects** con transformaciones suaves
- **Grid responsive** adaptativo
- **Typography** jerárquica y legible

## 📱 Responsive Design

### **Breakpoints**
- **Desktop**: > 768px - Layout de 2 columnas
- **Tablet**: 768px - Layout adaptativo
- **Mobile**: < 480px - Layout de 1 columna

### **Adaptaciones Móviles**
- Stack vertical de elementos
- Botones de ancho completo
- Tipografía escalada
- Espaciado reducido
- Touch-friendly interactions

## 🔄 Integración con Servicios

### **Servicios Necesarios**
```typescript
// Descomentar cuando estén disponibles
// import { NotaVentaService } from '@features/nota-venta/nota-venta-Service';
// import { DashboardService } from '@shared/servicios/dashboard.service';
```

### **Métodos de Carga de Datos**
- `cargarEstadisticas()` - KPIs principales
- `cargarVentasRecientes()` - Lista de transacciones
- `cargarDatosGraficos()` - Datos para charts

### **Filtrado por Fechas**
El dashboard está preparado para filtrar nota-venta por:
- **Fecha de inicio** (fechaInicio signal)
- **Fecha de fin** (fechaFin signal)
- **Recarga automática** al cambiar filtros

## 🚀 Próximas Mejoras

### **Gráficos Avanzados**
1. **Instalar Chart.js**:
```bash
npm install chart.js ng2-charts
```

2. **Implementar componentes de gráficos**:
- Gráfico de líneas para tendencias
- Gráfico circular para categorías
- Gráfico de barras para comparaciones

### **Funcionalidades Adicionales**
- **Exportación de datos** (PDF, Excel)
- **Filtros avanzados** (por cliente, estado, etc.)
- **Notificaciones en tiempo real**
- **Métricas comparativas** (vs período anterior)
- **Drill-down** en métricas para más detalle

### **Performance**
- **Virtual scrolling** para listas largas
- **Lazy loading** de componentes
- **Caching** de datos del dashboard
- **Debouncing** en filtros

## 💻 Uso del Componente

### **Navegación**
El dashboard se carga automáticamente en la ruta de portada del sistema.

### **Actualización de Datos**
- **Automática**: al cambiar filtros de fecha
- **Manual**: botón "Actualizar" en la sección de filtros
- **Al iniciar**: carga inicial con datos del mes actual

### **Estados de Carga**
- **Skeleton loaders** durante la carga
- **Progreso global** en la barra superior
- **Estados vacíos** cuando no hay datos

El dashboard está listo para producción y puede integrarse fácilmente con los servicios backend existentes del sistema de nota-venta.
