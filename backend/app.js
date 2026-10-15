import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { resolve } from 'path';
import * as Sentry from '@sentry/node';

// Cargar variables de entorno desde la raíz
dotenv.config({ path: resolve(process.cwd(), '../.env') });

// 1. Inicialización de Sentry (si existe la variable SENTRY_DSN)
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'production',
    tracesSampleRate: 1.0,
  });
}

// Middlewares
import createError from 'http-errors';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import session from 'express-session';

// Rutas
import adminRoutes from './routes/adminRoutes.js';
import usersRouter from './routes/users.js';

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

// Motor de plantillas (EJS)
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares generales
app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configuración de sesión
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret-vigilantes-default',
  resave: false,
  saveUninitialized: false,
}));

// Archivos estáticos
app.use('/admin', express.static(join(__dirname, 'public')));

// 2. Endpoint para provocar el error en vivo (Requisito de la Actividad 7)
app.get('/trigger-error', (req, res) => {
  throw new Error('Error forzado para prueba de Sentry en Producción (Actividad 7)');
});

// Enrutamiento normal
app.use('/admin', adminRoutes);
app.use('/users', usersRouter);

// Ruta base para verificar que el backend está vivo
app.get('/', (req, res) => {
  res.json({ status: 'Backend online', service: 'Los Vigilantes API' });
});

// Manejo de rutas inexistentes (404)
app.use((req, res, next) => {
  next(createError(404));
});

// 3. Manejador central de errores conectado a Sentry
app.use((err, req, res, next) => {
  // Envía el reporte automáticamente al dashboard de Sentry
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

export default app;