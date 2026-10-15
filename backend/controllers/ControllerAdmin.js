//modelos 
import Usuario from "../models/user.js";
import Producto from "../models/producto.js";

//modulos
import bcrypt from "bcryptjs";

//METODOS GET

export const getPaginaLogin = async (req, res) => {
    let emailTester = "Bruno Díaz";
    let passwordTester = "BatmanLoMejor";

    try {
        const usuarioTester = await Usuario.findOne({
            where: { email: 'Tester@Test.com' } 
        });

        if (usuarioTester) {
            emailTester = usuarioTester.email;
            passwordTester = "test123"; 
        }

    } catch (error) {
        console.error("Error al buscar usuario tester:", error);
    }
    res.render('login', { 
        title: 'Iniciar sesión - Admin',
        emailTester: emailTester,
        passwordTester: passwordTester
    }); 
};

export const getPaginaDashboard = async (req, res) => {
    try {
        const productos = await Producto.findAll({});
        res.render('dashboard', { title: 'Dashboard - Admin', productos });
    } catch (error) {
        console.error('Error al cargar los productos', error);
        res.render('dashboard', {
            title: 'Dashboard- Admin',
            error: 'Error al cargar los productos.',
            productos: []
        });
    }
};

export const getPaginaCrearProducto = async (req, res) => {
    try {
        res.render('crear-producto', { title: 'Alta de Producto - Admin' });
    } catch (error) {
        console.error('Error al cargar la Página', error);
    }
};

export const getPaginaModificarProducto = async (req, res) => {
    try {
        const productoId = req.params.id;
        const producto = await Producto.findByPk(productoId);

        if (!producto) {
            return res.redirect('/admin/dashboard');
        }

        res.render('modificar-producto', {
            title: 'Modificar Producto',
            error: null,
            producto: producto
        });

    } catch (error) {
        console.error('Error al cargar Página de modificación', error);
        res.redirect('/admin/dashboard');
    }
};

//entrega la imagen binaria desde la base de datos al navegador
export const getImagenProducto = async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id);

        if (!producto || !producto.imagen) {
            return res.status(404).send("Imagen no encontrada");
        }

        res.setHeader('Content-Type', producto.mimetype || 'image/jpeg');
        res.send(producto.imagen);
    } catch (error) {
        console.error("Error al obtener imagen:", error);
        res.status(500).send("Error al cargar la imagen");
    }
};

export const getProductosApi = async (req, res) => {
    try {
        // Exccluye el campo binario pesado para no saturar el JSON
        const productos = await Producto.findAll({
            where: { activo: true },
            attributes: { exclude: ['imagen'] }
        });

        // agrega una propiedad con la url directa a la imagen para el front
        const productosConUrl = productos.map(prod => ({
            ...prod.toJSON(),
            imagenUrl: `/admin/producto/imagen/${prod.id}`
        }));

        res.status(200).json({
            success: true,
            count: productosConUrl.length,
            data: productosConUrl
        });

    } catch (error) {
        console.error('Error en API productos', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};

export const getSessionInfo = (req, res) => {
    res.json({ nombre: req.session.nombreCliente || 'Invitado' });
};


//METODOS POST

export const postPaginaLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const usuario = await Usuario.findOne({
            where: { email: email }
        });
        
        if (!usuario) {
            return res.render('login', { error: 'Usuario o contraseña incorrectos' });
        }

        const esPasswordCorrecta = await bcrypt.compare(password, usuario.password);

        if (!esPasswordCorrecta) {
            return res.render('login', { error: 'Usuario o contraseña incorrectos' });
        }

        req.session.usuarioId = usuario.id;
        req.session.usuarioEmail = usuario.email;
        
        res.redirect('/admin/dashboard');

    } catch (error) {
        console.error("Error en postPaginaLogin:", error);
        res.render('login', { error: 'Ocurrió un error inesperado. Por favor, intente de nuevo.' });
    }
};

export const postCrearProducto = async (req, res) => {
    try {
        const { nombre, precio, stock, descripcion, categoria } = req.body;
        
        if (!req.file) {
            return res.render('crear-producto', {
                title: 'Alta de Producto',
                error: 'Debes subir una imagen para el producto'
            });
        }

        // Guarda el buffer y el mimetype directo en la BD
        await Producto.create({
            nombre: nombre,
            precio: precio,
            stock: stock,
            descripcion: descripcion,
            imagen: req.file.buffer,
            mimetype: req.file.mimetype,
            activo: true,
            categoria: categoria
        });

        res.redirect('/admin/dashboard');

    } catch (error) {
        console.error('Error al crear el producto', error);
        res.render('crear-producto', {
            title: 'Alta de Producto',
            error: 'Error al guardar el producto en la base de datos'
        });
    }
};

export const postCambiarEstadoProducto = async (req, res) => {
    try {
        const productoId = req.params.id;
        const producto = await Producto.findOne({ where: { id: productoId } });

        if (!producto) {
            return res.status(404).send("el producto no pudo ser encontrado");
        }

        const nuevoEstado = !producto.activo;
        await Producto.update(
            { activo: nuevoEstado },
            { where: { id: productoId } }
        );

        res.redirect('/admin/dashboard');

    } catch (error) {
        console.error("Error al cambiar el estado del producto", error);
        res.status(500).send("Error interno del servidor");
    }
};

export const postModificarProducto = async (req, res) => {
    try {
        const productoId = req.params.id;
        const { nombre, precio, stock, descripcion, categoria } = req.body;

        const productoOriginal = await Producto.findByPk(productoId);

        if (!productoOriginal) {
            return res.redirect('/admin/dashboard');
        }

        const modificacion = {
            nombre,
            precio,
            stock,
            descripcion,
            categoria
        };

        // Si se subio un archivo nuevo, actualizamos el binario en la BD
        if (req.file) {
            modificacion.imagen = req.file.buffer;
            modificacion.mimetype = req.file.mimetype;
        }

        await Producto.update(
            modificacion,
            { where: { id: productoId } }
        );

        res.redirect('/admin/dashboard');

    } catch (error) {
        console.error('Error al modificar el producto', error);
        res.redirect('/admin/dashboard');
    }
};

export const postComprarProducto = async (req, res) => {
    const { id } = req.params;
    const { cantidad } = req.body;

    const producto = await Producto.findByPk(id);
    
    if (producto) {
        producto.stock -= cantidad;
        await producto.save();
        res.status(200).json({ success: true });
    } else {
        res.status(404).json({ success: false, message: "Producto no encontrado" });
    }
};

export const postDevolverProducto = async (req, res) => {
    const { id } = req.params;
    const { cantidad } = req.body;

    const producto = await Producto.findByPk(id);

    if (producto) {
        producto.stock += cantidad;
        await producto.save();
        res.status(200).json({ success: true, message: "Producto devuelto" });
    } else {
        res.status(404).json({ success: false, message: "Producto no encontrado" });
    }
};

export const postEliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;

        // Al estar en la base de datos, el registro y la imagen se eliminan juntos
        await Producto.destroy({
            where: { id: id }
        });

        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Error al eliminar el producto', error);
        res.redirect('/admin/dashboard');
    }
};