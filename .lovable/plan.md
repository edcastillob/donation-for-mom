
# Sistema de Gestión de Cuenta Solidaria - Juana Blazco

## Descripción General
Aplicación web para gestionar de forma transparente los ingresos (donaciones) y egresos (gastos médicos y de mantenimiento) de la cuenta solidaria destinada a Juana Blazco. La aplicación mantendrá un historial completo de todas las transacciones y permitirá consulta pública con administración restringida.

---

## Pantallas y Funcionalidades

### 1. Dashboard Público (Página Principal)
- **Tarjetas de resumen**: Saldo actual en Bs, estimación en USD (usando API dolarapi.com), total de ingresos y total de egresos
- **Gráfico de distribución por categoría**: Visualización de cómo se han distribuido los gastos (medicinas, comida, transporte, etc.)
- **Lista de transacciones recientes**: Últimas 15-20 transacciones con fecha, tipo, descripción y monto
- **Tasa de cambio actual**: Indicador visual del tipo de cambio USD usado para la estimación
- **Acceso a ver detalle de cada transacción** (incluyendo recibo si existe)

### 2. Historial Completo de Transacciones
- Tabla con todas las transacciones históricas
- Filtros por: tipo (ingreso/egreso), categoría, rango de fechas, persona asociada
- Búsqueda por descripción
- Visualización de recibos/facturas adjuntos
- Exportación de datos (opcional)

### 3. Detalle de Transacción
- Información completa de la transacción
- Imagen del recibo/factura (si existe)
- Información de la persona asociada

### 4. Página de Login (Administrador)
- Formulario simple de usuario y contraseña
- Acceso restringido al panel de administración

### 5. Panel de Administración
- **Crear nuevo ingreso**: Formulario con fecha, descripción, monto en Bs, persona donante, opción de subir recibo
- **Crear nuevo egreso**: Formulario con fecha, categoría (medicinas, comida, mantenimiento, gastos médicos, transporte, gastos varios), descripción, monto, persona asociada, recibo
- **Gestión de personas**: Lista de personas registradas, crear nuevas personas al momento de registrar transacciones
- **Editar/eliminar transacciones existentes**

---

## Diseño Visual
- **Estilo limpio y minimalista** con enfoque en los datos
- Colores neutros con acentos sutiles para diferenciar ingresos (verde) y egresos (rojo)
- Tipografía clara y legible
- Diseño responsive optimizado para móvil, tablet y escritorio
- Énfasis en la transparencia financiera

---

## Funcionalidades Técnicas

### Backend y Base de Datos (Lovable Cloud)
- Tabla `persons` para almacenar donantes y beneficiarios
- Tabla `transactions` para todos los movimientos financieros
- Almacenamiento de imágenes de recibos en Lovable Cloud Storage
- Autenticación simple para el administrador

### Integración Externa
- Conexión a API de dolarapi.com para obtener tasa de cambio oficial
- Actualización automática de la tasa cada vez que se carga el dashboard

### Reglas de Negocio
- Todas las transacciones se guardan exclusivamente en Bs
- El USD solo se calcula en tiempo real para visualización (no se almacena)
- Historial completo sin períodos ni cierres
