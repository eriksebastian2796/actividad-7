import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '../.env') });

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
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

// Archivos estáticos
app.use('/admin', express.static(join(__dirname, 'public')));

// Enrutamiento
app.use('/admin', adminRoutes);
app.use('/users', usersRouter);

// Manejo de 404
app.use((req, res, next) => {
  next(createError(404));
});

// Manejador central de errores
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

export default app;