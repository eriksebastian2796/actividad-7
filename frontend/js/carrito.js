let carrito = [];

function cerrarSesion() {
//funcion encargada de vaciar el localStorage y redirigir al home al cerrar sesion
    const nombre = localStorage.getItem('clienteNombre');
    if(nombre) {
        localStorage.removeItem(`carrito_${nombre}`);
    }
    localStorage.removeItem('clienteNombre');
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    
    //verificar sesión y alojamiento de nombre de usuario en boton para salir
    //si no exite nombre, al querer ingresar manualmente te arroja al home
    const nombre = localStorage.getItem('clienteNombre');
    if(!nombre){
        window.location.href = 'index.html';
        return;
    }

    const nombreUsuario = document.getElementById('usuario-nombre');
    if(nombreUsuario && nombre) {
        nombreUsuario.textContent = `Bienvenido, ${nombre}.`;
    }

    inicializarCarrito();
    renderizarCarrito();
    actualizarContadorCarrito();
});

//función para obtener la clave dinámica del carrito por cada usuario
function obtenerClaveCarrito(){
    const nombreCliente = localStorage.getItem('clienteNombre');
    if(!nombreCliente) return null;
    //Creamos la clave única
    return `carrito_${nombreCliente}`;
}

//inicializacion del carrito
function inicializarCarrito(){
    const clave = obtenerClaveCarrito();
    if(!clave){
        //si no hay usuario, no hay carrito
        carrito = [];
        return;
    }
    const carritoLocal = localStorage.getItem(clave);
    carrito = carritoLocal ? JSON.parse(carritoLocal) : [];
}


function renderizarCarrito() {
    const contenidoCarrito = document.getElementById('carrito-contenido');
    const carritoVacio = document.getElementById('carrito-vacio');
    const contadorItems = document.getElementById('contador-items');
    const subtotal = document.getElementById('subtotal');
    const totalCarrito = document.getElementById('total-carrito');
    const btnProceder = document.getElementById('btn-proceder-compra');
    const btnVaciar = document.getElementById('btn-vaciar-carrito');
    const resumenCarrito = document.getElementById('resumen-carrito');

    if (!contenidoCarrito) return; //si no estamos en la página del carrito corta

    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    const total = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);

    if (carrito.length === 0) {
        if(carritoVacio) carritoVacio.style.display = 'block';
        if(resumenCarrito) resumenCarrito.style.display = 'none';
        contenidoCarrito.innerHTML = '';
        return;
    }

    if(carritoVacio) carritoVacio.style.display = 'none';
    if(resumenCarrito) resumenCarrito.style.display = 'block';

    // Actualizar información del resumen
    if (contadorItems) contadorItems.textContent = totalItems;
    if (subtotal) subtotal.textContent = `$${total.toFixed(2)}`;
    if (totalCarrito) totalCarrito.textContent = `$${total.toFixed(2)}`;
    if (btnProceder) btnProceder.disabled = false;
    if (btnVaciar) btnVaciar.disabled = false;

    //generar HTML
    //mapeo de propiedades (nombre, precio, imagen, id) según productos
    contenidoCarrito.innerHTML = `
        <div class="card shadow-sm">
            <div class="card-body">
                ${carrito.map(item => {
                    // Si item.imagen ya viene con la ruta del endpoint la usa, si no la arma con el id
                    const rutaImg = (item.imagen && item.imagen.startsWith('/admin/producto/imagen/'))
                        ? item.imagen
                        : `/admin/producto/imagen/${item.id}`;

                    return `
                    <div class="row align-items-center border-bottom py-3" data-producto-id="${item.id}">
                        <div class="col-md-2">
                            <!-- Carga la imagen binaria desde la base de datos -->
                            <img src="${rutaImg}" alt="${item.nombre}" class="img-fluid rounded" style="max-height: 80px; object-fit: cover;">
                        </div>
                        <div class="col-md-4">
                            <h6 class="mb-1">${item.nombre}</h6>                             <small class="text-muted">Producto</small>                          </div>                         <div class="col-md-2 text-center">                             <span class="fw-bold">$${item.precio}</span>
                        </div>
                        <div class="col-md-2">
                            <div class="input-group input-group-sm">
                                <button class="btn btn-outline-secondary" type="button" onclick="cambiarCantidad('${item.nombre}', -1)">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <input type="text" class="form-control text-center" value="${item.cantidad}" readonly>
                                <button class="btn btn-outline-secondary" type="button" onclick="cambiarCantidad('${item.nombre}', 1)">                                     <i class="fas fa-plus"></i>                                 </button>                             </div>                         </div>                         <div class="col-md-2 text-center">                             <div class="d-flex flex-column align-items-center">                                 <span class="fw-bold mb-2">$${(item.precio * item.cantidad).toFixed(2)}</span>
                                <button class="btn btn-outline-danger btn-sm" onclick="eliminarDelCarrito('${item.nombre}')" title="Eliminar producto">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;}).join('')}
            </div>
        </div>
    `;
}

async function cambiarCantidad(productoNombre, cambio) {
    const index = carrito.findIndex(item => item.nombre === productoNombre);
    if (index === -1) return;

    const producto = carrito[index];
    const nuevaCantidad = producto.cantidad + cambio;

    if (cambio < 0) {
        if (nuevaCantidad <= 0) {
            eliminarDelCarrito(productoNombre); // eliminar ya maneja devolverStock
        } else {
            // Si solo restamos 1 unidad, hay que devolverla a la base de datos
            const devuelto = await devolverStock(producto.id, 1); // 1 unidad
            if (devuelto) {
                producto.cantidad = nuevaCantidad;
                actualizarYRenderizar(`Se quitó una unidad de ${producto.nombre}`);
            }
        }
    } 
    else if (cambio > 0) {
        try {
            // Intentamos "comprar" 1 unidad más en el servidor
            const res = await fetch(`/admin/api/productos/comprar/${producto.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cantidad: 1 }) // Solo pedimos 1 extra
            });
            const datos = await res.json();

            if (datos.success) {
                producto.cantidad = nuevaCantidad;
                actualizarYRenderizar(`Se agregó una unidad más de ${producto.nombre}`);
            } else {
                // Si el server falla, mostramos alerta y no cambiamos nada
                mostrarAlerta("No hay más stock disponible de este producto", "danger");
            }
        } catch (error) {
            console.error("Error al conectar", error);
            mostrarAlerta("Stock máximo permitido", "danger");
        }
    }
}

// Función auxiliar para no repetir código de guardado
function actualizarYRenderizar(mensaje) {
    guardarCarrito();
    actualizarContadorCarrito();
    renderizarCarrito();
    mostrarAlerta(mensaje, "info");
}

async function eliminarDelCarrito(productoNombre) {
//funcion encargada de eliminar un item del carrito indistintamente de las unidades que haya cargadas
    const index = carrito.findIndex(item => item.nombre === productoNombre);

    if (index > -1) {
        const id = carrito[index].id;
        const cantidad = carrito[index].cantidad;
        await devolverStock(id, cantidad);
        
        const nombreProd = carrito[index].nombre;
        carrito.splice(index, 1);
        guardarCarrito();
        actualizarContadorCarrito();
        renderizarCarrito();
        mostrarAlerta(`${nombreProd} eliminado del carrito`, 'warning');
    }
}

function actualizarContadorCarrito() {
//funcion que actualiza el contador en la navbar si existen items
    const contadorNav = document.getElementById('contador-items-navbar'); //contador en navbar
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);

    if (contadorNav) {
        contadorNav.textContent = `[ ${totalItems} ]`;
        contadorNav.style.display = totalItems > 0 ? 'inline' : 'none'; 
    }
}

function guardarCarrito() {
//funcion encargada de guardar el carrito en el localstorage
    const clave = obtenerClaveCarrito();
    if(clave) {
        localStorage.setItem(clave, JSON.stringify(carrito));
    }
}

function mostrarAlerta(mensaje, tipo) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo} position-fixed top-0 end-0 m-3`;
    alertDiv.style.zIndex = "9999";
    alertDiv.textContent = mensaje;
    document.body.appendChild(alertDiv);
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

async function vaciarCarrito() {
//Funcion encargada de vaciar el carrito en su totalidad
    if(confirm("Si vacia el carro, se perderan su lista de productos. \n¿Desea continuar?")){
        
        const btn = document.getElementById('btn-vaciar-carrito');
        const textoOriginal = btn.innerHTML;

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Vaciando Carrito...';
        try {
            for(const item of carrito){
                await devolverStock(item.id, item.cantidad);
            }
        
            carrito = []; //reestablece el carro a 0
            guardarCarrito(); //guarda 
            actualizarContadorCarrito(); //actualiza cantidades dibujadas
            renderizarCarrito(); //dibuja la pantalla de carrito sin productos
            mostrarAlerta('Se ha vaciado el carro en su totalidad', 'success'); //alerta flotante
        } catch (error){
            console.error("Error al vaciar:", error);
            mostrarAlerta("Hubo un error al intentar vaciar el carrito", "danger");

            btn.disabled = false;
            btn.innerHTML = textoOriginal;
        }
    }
}

async function procederCompra() {
//esta funcion asincrona guarda la info de la compra y la finaliza, para redirigirse al ticket
    const boton = document.getElementById('btn-proceder-compra');
    const textoOriginal = boton.innerHTML;
    boton.disabled = true;
    boton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Procesando...';

    //valida la sesion por si caduca
    const nombreUsuario = localStorage.getItem('clienteNombre'); 
    if(!nombreUsuario){
        alert('Debes registrar tu nombre para comprar');
        window.location.href = '/index.html'; 
        return;
    }

    //carga de datos 
    const totalCompra = carrito.reduce((acumulador, item) => acumulador + (item.precio * item.cantidad), 0);
    await new Promise(resolve => setTimeout(resolve, 1000)); //simulamos una espera para que el usuario vea el icono de carga aunque sea un seg

    const datosCompraFinalizada = {
        productos: [...carrito],
        total: totalCompra,
        fecha: new Date().toLocaleString(),
        cliente: nombreUsuario,
    };

    try {
        localStorage.setItem('ultimaCompra', JSON.stringify(datosCompraFinalizada));

        //vaciado del carrito
        carrito = [];
        guardarCarrito();
        actualizarContadorCarrito();
        renderizarCarrito();
        localStorage.setItem('carrito', JSON.stringify([]));

        const contenedor = document.getElementById('carrito-contenido');
        if(contenedor) contenedor.innerHTML = '';
        document.getElementById('resumen-carrito').style.display = 'none';

        mostrarAlertaConSpinner('¡Compra realizada con éxito! Generando ticket...', 'success');
        await new Promise(resolve => setTimeout(resolve, 1000));
        window.location.href = 'ticket.html';
    } catch (error) {
        console.error("Error al guardar:", error);
        mostrarAlerta("No se pudo procesar la compra");
        boton.disabled = false;
        boton.innerHTML = textoOriginal;
    }
}

function mostrarAlertaConSpinner(mensaje, tipo) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo} position-fixed top-0 end-0 m-3 d-flex align-items-center`;
    alertDiv.style.zIndex = "9999";
    alertDiv.innerHTML = `
        <div class="spinner-border spinner-border-sm me-2" role="status">
            <span class="visually-hidden"></span>
        </div>
        <div>${mensaje}</div>
    `;

    document.body.appendChild(alertDiv);
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

async function devolverStock(idProducto, cantidad){
    try {
        const res = await fetch(`/admin/api/productos/devolver/${idProducto}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({cantidad: cantidad})
        });

        const datos = await res.json();

        if(datos.success){
            console.log('Producto devuelto');
            return true;
        } else {
            console.error("Error al devolver el producto", datos.message);
            return false;
        }
    } catch (error) {
        console.error('Error de conexión al devolver producto', error);
        return false;
    }
}

const observador = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
        if (entrada.isIntersecting) {
            entrada.target.classList.add('active');
        } else {
            entrada.target.classList.remove('active');
        }
    });
}, {
    threshold: 0.1
});

const loginCard = document.querySelector('.reveal-card');
if (loginCard) {
    observador.observe(loginCard);
}