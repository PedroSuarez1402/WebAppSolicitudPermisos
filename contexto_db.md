**CONTEXTO MAESTRO DE BASE DE DATOS Y LÓGICA DE NEGOCIO (RBAC)**

Por favor, lee, analiza y guarda en tu memoria la siguiente estructura de base de datos (Google Sheets). Esta es la única fuente de la verdad para todas las operaciones, CRUD y relaciones que programaremos de ahora en adelante. Hemos migrado de un sistema de tablas separadas a un sistema unificado con Control de Acceso Basado en Roles (RBAC).

### 1. ARQUITECTURA GLOBAL Y REGLAS
- **Universal ID:** Todos los usuarios del sistema (sin importar su jerarquía) se identifican con la nomenclatura `USR-XXX`. Ya no existen los prefijos `EMP-` ni `JEF-`.
- **Roles Numéricos (`Rol_ID`):**
  - `1` = Empleado (Solo registra asistencia y solicita permisos).
  - `2` = Jefe (Registra asistencia, solicita permisos y aprueba permisos de su equipo).
  - `3` = Talento Humano / Administrador (Tiene acceso total al CRUD y configuración).
- **Soft-Delete:** Ningún registro se elimina físicamente. Se usa la columna `Estado` ("Activo" / "Inactivo").

---

### 2. ESTRUCTURA DE TABLAS (Google Sheets)

A continuación, el mapeo exacto de índices (base 0 para lectura de arrays en JavaScript):

**A. Tabla: `Base_Usuarios` (Centro del Sistema)**
*Contiene a todo el personal unificado.*
- [0] `ID_Usuario`: Identificador único (Ej. USR-001).
- [1] `Correo`: Llave primaria de acceso / Login.
- [2] `Nombre Completo`.
- [3] `Identificación`: Cédula.
- [4] `Cargo`.
- [5] `Rol_ID`: 1(Empleado), 2(Jefe), o 3(TH).
- [6] `ID_Jefe_Asignado`: Referencia recursiva. Contiene el `USR-XXX` del jefe directo de esta persona.
- [7] `Estado`: Activo / Inactivo.

**B. Tabla: `Registro_Permisos`**
*Historial de solicitudes de permisos.*
- [0] `ID_Solicitud`: (Ej. PER-001).
- [1] `Marca Temporal`: Fecha y hora de la solicitud.
- [2] `ID_Solicitante`: FK a Base_Usuarios [0] (USR-XXX).
- [3] `Nombre_Solicitante`.
- [4] `Correo_Solicitante`.
- [5] `Cargo`.
- [6] `Fecha_Inicio` (del permiso).
- [7] `Fecha_Fin`.
- [8] `Hora_Inicio`.
- [9] `Hora_Fin`.
- [10] `Horas_Estimadas`.
- [11] `Motivo_Texto`.
- [12] `Observaciones`.
- [13] `URL_Adjunto`.
- [14] `ID_Aprobador`: FK a Base_Usuarios [0] (USR-XXX del Jefe que debe aprobar).
- [15] `Nombre_Jefe`.
- [16] `Correo_Jefe`.
- [17] `Estado_Jefe`: PENDIENTE / APROBADO / RECHAZADO.
- [18] `Estado_TH`: PENDIENTE / APROBADO / RECHAZADO.

**C. Tabla: `Registro_Asistencia`**
*Tracking de tiempos de entrada y salida.*
- [0] `ID_Registro`: (Ej. ASIS-001).
- [1] `Fecha`: DD/MM/YYYY.
- [2] `Hora_Exacta`: Generada por el servidor (`new Date()`), no por el cliente.
- [3] `ID_Usuario`: FK a Base_Usuarios [0] (USR-XXX).
- [4] `Nombre_Usuario`.
- [5] `Tipo_Marcación`: Ej. Ingreso, Salida Almuerzo, Reingreso, Salida Final.
- [6] `Categoría`: Evaluada contra Config_Horarios (Ej. A tiempo, Retraso, Fuera de Horario).

**D. Tabla: `Config_Horarios`**
*Reglas de negocio para evaluar la asistencia.*
- [0] `ID_Regla`.
- [1] `Etapa`: (Ingreso, Salida Almuerzo, Reingreso, Salida Final).
- [2] `Hora_Inicio`: Límite inferior del rango permitido.
- [3] `Hora_Fin`: Límite superior del rango permitido.
- [4] `Hora_Ideal`: Hora de corte para calcular si es "A tiempo" o "Retraso".
- [5] `Descripción`.

**E. Tabla: `Motivos_Solicitud`**
*Catálogo para el desplegable del formulario de permisos.*
- [0] `ID_Motivo`.
- [1] `Descripción`.
- [2] `Estado`: Activo / Inactivo.

---

