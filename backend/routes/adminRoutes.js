import express from 'express';
import { 
    getPaginaLogin,
    getPaginaDashboard, 
    postPaginaLogin, 
    getPaginaCrearProducto, 
    postCrearProducto, 
    postCambiarEstadoProducto, 
    getPaginaModificarProducto, 
    postModificarProducto, 
    getProductosApi, 
    getSessionInfo, 
    postComprarProducto, 
    postDevolverProducto, 
    postEliminarProducto,
    getImagenProducto
} from '../controllers/ControllerAdmin.js';
import esAdmin from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/login', getPaginaLogin);
router.get('/dashboard', esAdmin, getPaginaDashboard);
router.get('/productos/crear', esAdmin, getPaginaCrearProducto);
router.get('/productos/modificar/:id', esAdmin, getPaginaModificarProducto);
router.get('/api/productos', getProductosApi);
router.get('/api/session', getSessionInfo);

router.get('/producto/imagen/:id', getImagenProducto);

router.post('/login', postPaginaLogin);
router.post('/productos/crear', esAdmin, upload.single('imagen'), postCrearProducto);
router.post('/productos/activar-desactivar/:id', esAdmin, postCambiarEstadoProducto);
router.post('/productos/modificar/:id', esAdmin, upload.single('imagen'), postModificarProducto);
router.post('/api/productos/comprar/:id', postComprarProducto);
router.post('/productos/eliminar/:id', postEliminarProducto);
router.post('/api/productos/devolver/:id', postDevolverProducto);

export default router;