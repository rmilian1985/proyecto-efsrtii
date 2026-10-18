# Distribuciones y Servicios del Norte S.A.C.
## Sistema Web ERP y Gestión Transaccional de Pedidos e Inventario
### Proyecto EFSRT II — Cibertec (Ciclo III) • Grupo N° 4

---

## 🚀 Inicio Rápido en Entorno Local

El proyecto está organizado en 3 carpetas principales:
* `database/`: Scripts SQL para Microsoft SQL Server (Tablas 3FN, Stored Procedures, Triggers e Inserción de Datos Realistas).
* `backend/`: API REST por capas en Node.js + Express con soporte nativo de SQL Server (`mssql`).
* `frontend/`: Aplicación web moderna en React + Vite con exportadores oficiales a Excel y PDF.
* `docs/`: Manual técnico detallado, arquitectura y preguntas de sustentación ante el jurado.

---

### 1. Base de Datos (SQL Server)
1. Abre **SQL Server Management Studio (SSMS)**.
2. Abre y ejecuta el archivo [`database/01_schema_and_improvements.sql`](file:///e:/Cursos/Cibertec/Ciclo%203/EFSRTII/Proyecto/database/01_schema_and_improvements.sql).
3. Abre y ejecuta el archivo [`database/02_seed_data.sql`](file:///e:/Cursos/Cibertec/Ciclo%203/EFSRTII/Proyecto/database/02_seed_data.sql) para cargar productos peruanos, clientes de Piura y pedidos históricos.

### 2. Iniciar el Backend (API REST)
```bash
cd backend
npm install
npm start
```
* Servidor ejecutándose en: `http://localhost:4000`
* Healthcheck: `http://localhost:4000/api/health`

### 3. Iniciar el Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
* Aplicación web disponible en: `http://localhost:5173` o `http://localhost:5174`

---

## 📦 Estructura del Proyecto por Capas

```
Proyecto/
├── database/
│   ├── 01_schema_and_improvements.sql  # Tablas 3FN, Índices, SPs, Triggers
│   └── 02_seed_data.sql                # Semilla de datos reales de Piura
├── backend/
│   ├── src/
│   │   ├── config/                     # Conexión y Pool a SQL Server
│   │   ├── repositories/               # Capa de Acceso a Datos (DAL)
│   │   ├── services/                   # Capa de Lógica de Negocio (BLL)
│   │   ├── controllers/                # Capa de Controladores HTTP
│   │   ├── routes/                     # Enrutadores REST
│   │   └── server.js                   # Servidor Express principal
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/                 # Vistas: Dashboard, SP, Reportes, etc.
│   │   ├── services/                   # Cliente API fetch
│   │   ├── utils/                      # Exportadores a Excel (.xlsx) y PDF (.pdf)
│   │   ├── App.jsx
│   │   └── index.css                   # Sistema de diseño moderno
│   └── package.json
└── docs/
    └── MANUAL_TECNICO_Y_ARQUITECTURA.md # Manual técnico para la sustentación
```
