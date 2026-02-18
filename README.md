# Corojo Kings - Liga de Fútbol

Una aplicación web para gestionar una liga de fútbol entre amigos, con estadísticas de jugadores, registro de partidos y visualización de datos.

## Tecnologías utilizadas

- **React** con TypeScript
- **Vite** para el build
- **Tailwind CSS** para estilos
- **Shadcn/ui** para componentes UI
- **Firebase Firestore** para base de datos compartida
- **Recharts** para gráficos
- **Date-fns** para manejo de fechas

## Configuración de Firebase

Para usar la base de datos compartida, necesitas configurar un proyecto de Firebase:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Habilita Firestore Database
4. Ve a Configuración del proyecto > Configuración general > Tus apps
5. Crea una nueva app web y copia la configuración

6. Actualiza `src/firebase.ts` con tu configuración:

```typescript
const firebaseConfig = {
  apiKey: "tu-api-key",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-project-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu-app-id"
};
```

7. Configura las reglas de Firestore para permitir acceso (solo para desarrollo):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Instalación y desarrollo local

```bash
# Clona el repositorio
git clone <tu-repo-url>
cd corojo-kings

# Instala dependencias
npm install

# Inicia el servidor de desarrollo
npm run dev
```

## Build para producción

```bash
npm run build
```

## Despliegue

### Opción 1: Vercel (Recomendado)

1. Conecta tu repositorio de GitHub a Vercel
2. Configura las variables de entorno de Firebase en Vercel
3. Despliega automáticamente

### Opción 2: Netlify

1. Conecta tu repositorio a Netlify
2. Configura las variables de entorno
3. Despliega

### Opción 3: Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## Características

- ✅ Registro de partidos con estadísticas detalladas
- ✅ Gestión de jugadores
- ✅ Estadísticas y rankings
- ✅ Visualización de datos con gráficos
- ✅ Modo administrador para gestión completa
- ✅ Base de datos compartida con Firebase
- ✅ Interfaz responsive

## Estructura del proyecto

```
src/
├── components/     # Componentes reutilizables
├── context/        # Context de React (LeagueContext)
├── data/          # Datos mock y frases
├── hooks/         # Hooks personalizados
├── lib/           # Utilidades
├── pages/         # Páginas de la aplicación
└── types.ts       # Definiciones de tipos
```
