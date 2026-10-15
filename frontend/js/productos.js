// 1. Variables Globales para la paginación
let inventario = []; 
let listaComics = [];
let listaFiguras = [];

// Configuración de paginación
const ITEMS_POR_PAGINA = 9; // Cantidad de productos a mostrar
let pagActualComics = 1;
let pagActualFiguras = 1;

document.addEventListener('DOMContentLoaded', async () => {

    Splitting();
    actualizarContadorCarrito();
    cargarDestacados();

    await cargarProductosPrincipales();

    //verificar sesión y alojamiento de nombre de usuario en boton para salir
    const nombre = localStorage.getItem('clienteNombre');
    if(!nombre){
        window.location.href = 'index.html';
        return;
    }

    const nombreUsuario = document.getElementById('usuario-nombre');
    if(nombreUsuario && nombre) {
        nombreUsuario.textContent = `Bienvenido, ${nombre}.`;
    }

    await cargarProductosPrincipales();
});

function renderizarGrupo(listaProductos, idContenedor) {
    const contenedor = document.getElementById(idContenedor);
    if (!contenedor) return;

    contenedor.innerHTML = '';

    if (listaProductos.length === 0) {
        contenedor.innerHTML = `
            <div class="col-12 text-center py-4">
                <div class="alert alert-dark border-danger d-inline-block px-4 py-3 shadow-sm">
                    <h5 class="text-danger fw-bold m-0 text-uppercase" style="letter-spacing: 2px; color: #dc3545;">
                        NO HAY PRODUCTOS DISPONIBLES
                    </h5>
                </div>
            </div>
        `;
        return;
    }

        listaProductos.forEach(prod => {
            const sinStock = prod.stock === 0;

            //variables dinámicas según haya stock o no
            const filtroGris = sinStock ? 'filter: grayscale(100%); opacity: 0.9' : '';
            const estadoBoton = sinStock ? 'disabled' : '';
            const textoBoton  = sinStock ? 'Sin stock': 'Agregar al Carrito';
            const claseBoton = sinStock ? 'btn-secondary' : 'btn-outline-danger';

            // Creamos el HTML del overlay (el cartel del medio)
            let overlaySinStock = '';
            if (sinStock) {
                overlaySinStock = `
                    <div class="position-absolute top-50 start-50 translate-middle w-100 text-center bg-dark bg-opacity-75 py-2" style="z-index: 10;">
                        <h4 class="text-danger fw-bold m-0 text-uppercase" style="letter-spacing: 2px;">SIN STOCK</h4>
                    </div>
                `;
        }

            contenedor.innerHTML += `
            <div class="col reveal-card">
                <div class="card h-100 shadow-sm border-0 product-card">
                    <div class="position-relative">

                        ${overlaySinStock}
                        
                        <!-- Carga la imagen binaria desde la base de datos -->
                        <img src="/admin/producto/imagen/${prod.id}" class="card-img-top" alt="${prod.nombre}" 
     style="width: 100% !important; height: 320px !important; object-fit: cover !important; object-position: top center !important; ${filtroGris}">
                        
                        <span class="position-absolute top-0 end-0 badge rounded-pill bg-dark m-2 fs-6">
                            $${prod.precio}
                        </span>
                    </div>

                    <div class="card-body d-flex flex-column" style="${filtroGris}">
                        <h5 class="card-title text-center">${prod.nombre}</h5>
                        <p class="card-text text-center small flex-grow-1">
                            ${prod.descripcion || 'Sin descripción'}
                        </p>

                        <div class = "d-flex justify-content-center align-items-center mb-3">
                            <button class="btn btn-sm btn-outline-danger" onclick="cambiarCantidad(${prod.id}, -1)" ${estadoBoton}>
                                <i class="bi bi-dash-lg"></i>
                            </button>

                            <input type="number" id="cant-${prod.id}" class="form-control text-center mx-2 border-0 fw-bold"
                                value = "1" min="1" max="${prod.stock}" style="width: 50px; background: transparent;" readonly>

                            <button class="btn btn-outline-success btn-sm" onclick="cambiarCantidad(${prod.id} , 1)" ${estadoBoton}>
                                <i class="bi bi-plus-lg"></i>
                            </button>
                        </div>
                        
                        <button class="btn ${claseBoton} w-100 mt-3" onclick="agregarAlCarrito(${prod.id})" ${estadoBoton}>
                           ${textoBoton}
                        </button>
                    </div>
                </div>
            </div>
        `;
        });

        activarAnimaciones();
}

function cerrarSesion() {
    //funcion encargada de vaciar el localStorage y redirigir al home al cerrar sesion
    const nombre = localStorage.getItem('clienteNombre');
    if(nombre) {
        localStorage.removeItem(`carrito_${nombre}`);
    }
    localStorage.removeItem('clienteNombre');
    window.location.href = 'index.html';
}

async function agregarAlCarrito(idProducto) {
    // Buscamos el producto en la variable global
    const producto = inventario.find(p => p.id === idProducto);

    // Buscamos la cantidad del input
    const inputCantidad = document.getElementById(`cant-${idProducto}`);
    const cantidad = parseInt(inputCantidad.value);

    if (cantidad > 0) {
        const nombreCliente = localStorage.getItem('clienteNombre');
        if (!nombreCliente) {
            alert("Debes ingresar tu nombre primero");
            return;
        }

        try {
            // Enviamos la orden de restar stock a la base de datos
            const res = await fetch(`/admin/api/productos/comprar/${producto.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cantidad: cantidad })
            });

            const datos = await res.json();
            
            if (datos.success) {
                // Si el servidor dice "OK" (stock descontado), procedemos a guardar en el carrito local
                const claveCarrito = `carrito_${nombreCliente}`;
                let carrito = [];
                const carritoGuardado = localStorage.getItem(claveCarrito);

                if (carritoGuardado) {
                    try {
                        carrito = JSON.parse(carritoGuardado);
                    } catch (error) {
                        console.error("Error en el carrito, reiniciando", error);
                        carrito = [];
                    }
                }

                const indiceExistente = carrito.findIndex(item => item.id === producto.id);

                if (indiceExistente !== -1) {
                    carrito[indiceExistente].cantidad += cantidad;
                } else {
                    carrito.push({
                        id: producto.id,
                        nombre: producto.nombre,
                        precio: producto.precio,
                        imagen: `/admin/producto/imagen/${producto.id}`,
                        categoria: producto.categoria,
                        cantidad: cantidad
                    });
                }

                localStorage.setItem(claveCarrito, JSON.stringify(carrito));

                mostrarAlerta(`¡Agregaste ${cantidad} ${producto.nombre} al carrito y descontaste stock!`, "success");
                actualizarContadorCarrito();
                
                //recargar los productos para ver el stock actualizado en pantalla
                cargarDestacados(); 
                await cargarProductosPrincipales();

            } else {
                // Si el servidor dice que no (ej. falta de stock), avisamos al usuario
                mostrarAlerta("No se pudo agregar: " + (datos.message || "Error de stock"), "danger");
            }

        } catch (error) {
            console.error("Error al conectar con el servidor", error);
            mostrarAlerta("Error de conexión con el servidor", "danger");
        }
    }
}

function actualizarContadorCarrito() {
    // 1. Obtenemos el nombre del usuario actual
    const nombreUsuario = localStorage.getItem('clienteNombre');
    
    if (!nombreUsuario) {
        // Si no hay usuario, ponemos 0
        const badge = document.getElementById('contador-items-navbar');
        if (badge) badge.textContent = '0';
        return;
    }

    // 2. Generamos la clave dinámica (ej: carrito_Ricardo)
    const claveCarrito = `carrito_${nombreUsuario}`;

    // 3. Leemos el carrito específico de ese usuario
    const carritoGuardado = localStorage.getItem(claveCarrito);
    let totalItems = 0;

    if (carritoGuardado) {
        try {
            const carrito = JSON.parse(carritoGuardado);
            // Sumamos las cantidades de todos los productos
            totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
        } catch (error) {
            console.error("Error al leer el carrito para el contador", error);
        }
    }

    // Actualizamos el HTML del badge
    const badge = document.getElementById('contador-items-navbar');
    if (badge) {
        badge.textContent = `[ ${totalItems} ]`;
        
        //Ocultar el badge si es 0 para que se vea más limpio
        if (totalItems > 0) {
            badge.style.display = 'inline-block';
            badge.classList.remove('d-none');
        } else {
            badge.style.display = 'none'; 
        }
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

//esta función está hecha para que se rendericen las tarjetas del centro de la pantalla y vayan desapareciendo las anteriores y posteriores
function activarAnimaciones(){
   const observador = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada =>{
        //si el elemento está en el centro
        if(entrada.isIntersecting){
            entrada.target.classList.add('active');

        } else{
            //si no está en la zona central, le quitamos la clase
            entrada.target.classList.remove('active');
        }
    });
    },{
        rootMargin: '-25% 0px -25% 0px',
        threshold: 0.2 // Se activa cuando el 20% de la tarjeta entra en la zona segura
   });

   //le decimos al observador que vigile todas las tarjetas
   const tarjetas = document.querySelectorAll('.reveal-card');
   tarjetas.forEach(tarjeta => {
    observador.observe(tarjeta);
   });
}

//esta función configura y pone en marcha un carrusel dinámico con Splide
async function cargarDestacados() {
    const track = document.getElementById('lista-destacados');
    if (!track) return;

    try {
        const res = await fetch('/admin/api/productos');
        const datos = await res.json();

        if (datos.success) {
            //Solo dejamos pasar los que tienen stock > 0
            const productosConStock = datos.data.filter(prod => prod.stock > 0);

            productosConStock.sort(() => 0.5 - Math.random());

            //Tomamos los primeros 6 de los que sí tienen stock
            const destacados = productosConStock.slice(0, 6);

            track.innerHTML = '';

            if (destacados.length === 0) {
                track.innerHTML = '<p class="text-center text-white">No hay destacados disponibles por el momento.</p>';
                return;
            }

            destacados.forEach(prod => {
                track.innerHTML += `
                <li class="splide__slide">
                    <div class="col reveal-card">
                        <div class="card h-100 shadow-sm border-0 product-card" >
                            <div class="position-relative">
                                <!-- Carga la imagen binaria desde la base de datos -->
                                <img src="/admin/producto/imagen/${prod.id}" class="carrusel-img" alt="${prod.nombre}" 
                                style="width: 100% !important; height: 350px !important; object-fit: cover !important; 
                                object-position: top center !important; display: block !important;">
                        
                                <span class="position-absolute top-0 end-0 badge rounded-pill bg-dark m-2 fs-6">
                                    $${prod.precio}
                                </span>
                            </div>
                        
                            <div class="card-body text-center">
                                <h6 class="card-title text-center">${prod.nombre}</h6>
                                <button onclick="verProducto(${prod.id})" class="btn btn-sm btn-outline-warning mt-2">
                                    <i class="fas fa-eye me-1"></i> Ver más
                                </button>
                            </div>
                        </div>
                    </div>
                </li>
                `;
            });

            // Inicializar Splide
            const splide = new Splide('#carrusel-unico', {
                type: 'loop',
                drag: 'free',
                focus: 'center',
                gap: '.7rem',
                perPage: 3,
                autoScroll: {
                    speed: 1,
                },
                breakpoints: {
                    768: { perPage: 2 },
                    480: { perPage: 1 }
                },
            });
            splide.mount();

        }
    } catch (error) {
        console.error(error);
    }
}

//funcion para ver el producto a través de un modal
function verProducto(id){
    const producto = inventario.find(p => p.id === id);
    if(!producto) return;

    //rellenar el modal
    document.getElementById('modal-titulo').textContent = producto.nombre;
    // Carga la imagen binaria en el modal desde la base de datos
    document.getElementById('modal-img').src = `/admin/producto/imagen/${producto.id}`;
    document.getElementById('modal-descripcion').textContent = producto.descripcion;
    document.getElementById('modal-precio').textContent = `$${producto.precio}`;
    
    //configuración del stock
    const inputCantidad = document.getElementById('modal-cantidad');
    const btnAgregar = document.getElementById('btn-agregar-modal');

    inputCantidad.value = 1;
    inputCantidad.setAttribute('max', producto.stock);

    if(producto.stock === 0) {
        btnAgregar.disabled = true;
        btnAgregar.innerHTML = 'Sin stock';
        inputCantidad.disabled = true;
        inputCantidad.value = 0;
    } else {
        btnAgregar.disabled = false;
        btnAgregar.innerHTML = '<i class="fas fa-shopping-cart me-2"></i> Agregar al carrito';
        inputCantidad.disabled = false;
    }

    btnAgregar.onclick = function() {
        agregarDesdeModal(producto.id);
    }

    const modalElement = document.getElementById('modal-producto');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

//función para seleccionar cantidad en el modal
function cambiarCantidadModal(cambio){
    const input = document.getElementById('modal-cantidad');
    let nuevaCant = parseInt(input.value) + cambio;
    if(nuevaCant < 1) nuevaCant = 1;
    input.value = nuevaCant;
}

//función para agregar al carrito desde el modal
async function agregarDesdeModal(idProducto){
    const producto = inventario.find(p => p.id === idProducto);

    const inputCantidad = document.getElementById('modal-cantidad');
    const cantidad = parseInt(inputCantidad.value);

    if(cantidad > producto.stock){
        mostrarAlerta(`Solo quedan ${producto.stock} unidades disponibles`, "warning");
        return;
    }

    if(cantidad > 0) {
        const nombreCliente = localStorage.getItem('clienteNombre');
        if(!nombreCliente){
            alert("Debes ingresar tu nombre primero");
            return;
        }
        try{
            const res = await fetch(`/admin/api/productos/comprar/${producto.id}`, {
                method: 'POST',
                headers: {'Content-Type' : 'application/json'},
                body: JSON.stringify({cantidad : cantidad})
            });

            const datos = await res.json();

            if(datos.success){
                const claveCarrito = `carrito_${nombreCliente}`;
                let carrito = [];
                const carritoGuardado = localStorage.getItem(claveCarrito);

                if(carritoGuardado){
                    try{ carrito = JSON.parse(carritoGuardado);} catch (e) { carrito = [];}
                }
                const indiceExistente = carrito.findIndex(item => item.id === producto.id);

                 if(indiceExistente !== -1){
                    carrito[indiceExistente].cantidad += cantidad;
                } else {
                    carrito.push({
                        id: producto.id,
                        nombre: producto.nombre,
                        precio: producto.precio,
                        imagen: `/admin/producto/imagen/${producto.id}`,
                        categoria: producto.categoria,
                        cantidad: cantidad
                    });
                }

                localStorage.setItem(claveCarrito, JSON.stringify(carrito));

                mostrarAlerta(`Agregaste ${cantidad} ${producto.nombre} desde nuestro carrusel`, "success");
                actualizarContadorCarrito();

                cargarDestacados();
                await cargarProductosPrincipales();

                const modalElement = document.getElementById('modal-producto');
                const modal = bootstrap.Modal.getInstance(modalElement);
                modal.hide();

            } else {
                mostrarAlerta("No hay suficiente stock en el servidor", "danger");
            }

        } catch (error){
            console.error('Error de conexión', error);
            mostrarAlerta('Error al procesar la solicitud', "danger");
        }
    }
}

//función para cambiar la cantidad de productos que queremos agregar al carrito
function cambiarCantidad(id, cambio){
    const input = document.getElementById(`cant-${id}`); 

    let valorActual = parseInt(input.value);
    const stockMaximo = parseInt(input.getAttribute('max'));

    let nuevoValor = valorActual + cambio;

    if (nuevoValor >= 1 && nuevoValor <= stockMaximo){
        input.value = nuevoValor;
    } else {
        mostrarAlerta('No hay stock disponible', 'warning');
    }
}

async function cargarProductosPrincipales() {
    try {
        const res = await fetch('/admin/api/productos');
        const datos = await res.json();

        if (datos.success) {
            const mensajeGlobal = document.getElementById('sin-productos-global');
            const carrusel = document.getElementById('carrusel-unico');
            const tituloDestacados = document.getElementById('catalogo-completo');
            const seccionComics = document.getElementById('seccion-comics');
            const seccionFiguras = document.getElementById('seccion-figuras');

            // Si no hay productos en toda la base de datos
            if (!datos.data || datos.data.length === 0) {
                if (mensajeGlobal) mensajeGlobal.classList.remove('d-none');
                if (carrusel) carrusel.style.display = 'none';
                if (tituloDestacados) tituloDestacados.style.display = 'none';
                if (seccionComics) seccionComics.style.display = 'none';
                if (seccionFiguras) seccionFiguras.style.display = 'none';
                return;
            }

            // Si hay productos se oculta el mensaje global
            if (mensajeGlobal) mensajeGlobal.classList.add('d-none');

            datos.data.sort((a, b) => {
                const stockA = a.stock > 0 ? 1 : 0;
                const stockB = b.stock > 0 ? 1 : 0;
                return stockB - stockA;
            });

            inventario = datos.data;

            listaComics = datos.data.filter(p => p.categoria === 'Comic');
            listaFiguras = datos.data.filter(p => p.categoria === 'Figura');

            renderizarPagina('comic');
            renderizarPagina('figura');

            filtrarPorUrl();
        } else {
            mostrarAlerta("Error al cargar productos", "warning");
        }
    } catch (error) {
        console.error('Error cargando productos', error);
    }
}

function renderizarPagina(tipo) {
    let listaCompleta = [];
    let paginaActual = 1;
    let contenedorId = '';
    let paginacionId = '';

    if (tipo === 'comic') {
        listaCompleta = listaComics;
        paginaActual = pagActualComics;
        contenedorId = 'contenedor-comics';
        paginacionId = 'paginacion-comics';
    } else {
        listaCompleta = listaFiguras;
        paginaActual = pagActualFiguras;
        contenedorId = 'contenedor-figuras';
        paginacionId = 'paginacion-figuras';
    }

    const params = new URLSearchParams(window.location.search);
    const categoriaActual = params.get('cat');
    
    let productosAVisualizar;

    if (categoriaActual) {
        const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
        const fin = inicio + ITEMS_POR_PAGINA;
        productosAVisualizar = listaCompleta.slice(inicio, fin);
    } else {
        productosAVisualizar = listaCompleta;
    }

    renderizarGrupo(productosAVisualizar, contenedorId);
    actualizarControlesPaginacion(tipo, listaCompleta.length, paginacionId);
}

function actualizarControlesPaginacion(tipo, totalItems, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    const params = new URLSearchParams(window.location.search);
    const categoriaActual = params.get('cat');

    if(!categoriaActual){
        contenedor.innerHTML = '';
        return;
    }

    const totalPaginas = Math.ceil(totalItems / ITEMS_POR_PAGINA);
    let paginaActual = (tipo === 'comic') ? pagActualComics : pagActualFiguras;

    if (totalPaginas <= 1) {
        contenedor.innerHTML = ''; 
        return;
    }

    let html = '';

    const disabledPrev = paginaActual === 1 ? 'disabled' : '';
    html += `
        <button class="btn btn-outline-danger btn-sm" ${disabledPrev} 
            onclick="cambiarPagina('${tipo}', -1)">
            <i class="bi bi-chevron-left"></i> Anterior
        </button>
    `;

    html += `
        <span class="fw-bold mx-2" style="font-family: 'Orbitron', sans-serif;">
            ${paginaActual} / ${totalPaginas}
        </span>
    `;

    const disabledNext = paginaActual === totalPaginas ? 'disabled' : '';
    html += `
        <button class="btn btn-outline-danger btn-sm" ${disabledNext} 
            onclick="cambiarPagina('${tipo}', 1)">
            Siguiente <i class="bi bi-chevron-right"></i>
        </button>
    `;

    contenedor.innerHTML = html;
}

function cambiarPagina(tipo, delta) {
    if (tipo === 'comic') {
        pagActualComics += delta;
        renderizarPagina('comic');
        document.getElementById('seccion-comics').scrollIntoView({ behavior: 'smooth' });
    } else {
        pagActualFiguras += delta;
        renderizarPagina('figura');
        document.getElementById('seccion-figuras').scrollIntoView({ behavior: 'smooth' });
    }
}

function filtrarPorUrl() {
    const params = new URLSearchParams(window.location.search);
    const categoria = params.get('cat');

    const seccionComics = document.getElementById('seccion-comics');
    const seccionFiguras = document.getElementById('seccion-figuras');

    const carrusel = document.getElementById('carrusel-unico');
    const tituloDestacados = document.getElementById('titulo-destacados');
    const catalogoCompleto = document.getElementById('catalogo-completo');

    if(seccionComics) seccionComics.style.display = 'block';
    if(seccionFiguras) seccionFiguras.style.display = 'block';
    if(carrusel) carrusel.style.display = 'block';
    if(tituloDestacados) tituloDestacados.style.display = 'block';
    if(catalogoCompleto) catalogoCompleto.style.display = 'block';

    if(categoria){
        if(carrusel) carrusel.style.display = 'none';
        if(tituloDestacados) tituloDestacados.style.display = 'none';
        if(catalogoCompleto) catalogoCompleto.style.display = 'none';
    }
    if(categoria === 'comic'){
        if(seccionFiguras) seccionFiguras.style.display = 'none';
    } else if (categoria === 'figura') {
        if(seccionComics) seccionComics.style.display = 'none';
    }
}