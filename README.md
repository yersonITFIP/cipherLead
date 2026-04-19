# CipherLeaf

Tu espacio personal de escritura encriptada y organización de notas.

## Descripcion

CipherLeaf es una aplicacion web segura para escribir diarios, organizar notas por materias y gestionar contrasenas de forma cifrada. Diseñado con enfoque en privacidad y seguridad del usuario.

## Caracteristicas

- **Diario encriptado**: Escribe tus pensamientos de forma segura
- **Organizacion por materias**: Agrupa tus notas por temas o categorias
- **Gestor de contrasenas**: Almacena credenciales cifradas de forma segura
- **Autenticacion de dos factores (2FA)**: Protege tu cuenta con TOTP
- **Temas claro/oscuro**: Interfaz adaptativa segun tu preferencia

## Tecnologias

### Frontend
- React 18
- Vite
- Lucide React (iconos)
- SweetAlert2 (alertas)

### Backend
- Node.js
- Express

## Requisitos

- Node.js 18+
- npm o yarn

## Instalacion

1. Clonar el repositorio:
```bash
git clone <repo-url>
cd cipherleaf
```

2. Instalar dependencias del frontend:
```bash
cd frontend
npm install
```

3. Instalar dependencias del backend:
```bash
cd backend
npm install
```

4. Crear archivo de configuracion:
```bash
cp frontend/.env.example frontend/.env
# Editar frontend/.env con la URL del backend
```

5. Iniciar el servidor de desarrollo:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Configuracion

### Variables de entorno (frontend/.env)

| Variable | Descripcion | Valor por defecto |
|----------|-------------|-------------------|
| `VITE_API_URL` | URL del servidor backend | `http://localhost:3001` |
| `VITE_APP_NAME` | Nombre de la aplicacion | `CipherLeaf` |
| `VITE_APP_VERSION` | Version de la aplicacion | `1.0.0` |

## Estructura del proyecto

```
cipherleaf/
├── frontend/           # Aplicacion React (Vite)
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── config/        # Configuracion de la app
│   │   ├── contexts/       # Contextos de React
│   │   ├── hooks/          # Hooks personalizados
│   │   ├── utils/          # Utilidades y APIs
│   │   └── views/          # Vistas de la aplicacion
│   └── public/             # Archivos estaticos
├── backend/            # Servidor Node.js/Express
└── README.md           # Este archivo
```

## Scripts disponibles

### Frontend
```bash
npm run dev      # Iniciar servidor de desarrollo
npm run build    # Crear build de produccion
npm run preview  # Previsualizar build de produccion
```

### Backend
```bash
npm run dev      # Iniciar servidor de desarrollo
npm run start    # Iniciar servidor de produccion
```

## Licencia

MIT License
# cipherLead
