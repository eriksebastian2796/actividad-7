document.addEventListener('DOMContentLoaded', () => {
    renderTicketPage();
});

function renderTicketPage() {
//esta funcion se encarga de dibujar el ticket en el html
    const compraJSON = localStorage.getItem('ultimaCompra'); //buscamos los datos de la compra
    const { cliente, fecha, tipo, productos, total } = JSON.parse(compraJSON);

    const elNombre = document.getElementById('nameTicket');
    const elFecha = document.getElementById('fechaCompleta');

    if(elNombre) elNombre.textContent =cliente;
    if(elFecha) elFecha.textContent = fecha;
    
    if (elNombre) elNombre.textContent = cliente;
    if (elFecha) elFecha.textContent = fecha;

   //llenado de la tabla de detalles
    const tbody = document.getElementById('ticket-body');
    if (tbody) {
        tbody.innerHTML = ''; //limpiamos contenido previo

        productos.forEach(item => {
            //aseguramos que los valores sean números para evitar errores
            const precio = parseFloat(item.precio);
            const cantidad = item.cantidad || 1;
            const subtotal = precio * cantidad;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.nombre}</td>
                <td>${item.categoria  || 'Varios'}</td>
                <td>$${precio.toFixed(2)}</td>
                <td>${cantidad}</td>
                <td class="text-end">$${subtotal.toFixed(2)}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    //llenamos el Total
    const elTotal = document.getElementById('ticket-total');
    if (elTotal) {
        elTotal.textContent = `$${parseFloat(total).toFixed(2)}`;
    }
}

function imprimirTicket() {
//essta funcion se encarga entre otras cosas, de imprimir el ticket
//seleccionamos la tarjeta del ticket
    const tarjetaTicket = document.querySelector('main .card');
    if (!tarjetaTicket) return;

    //obtenemos latarjeta
    const contenidoHTML = tarjetaTicket.outerHTML;

    //Se abre una ventana nueva con el ticket
    const ventana = window.open('', 'IMPRIMIR', 'height=800,width=800');

    //DIBUJADO DE DOCUMENTO EN EL TICKET    
    ventana.document.write('<html><head><title>Ticket - Los Vigilantes</title>');
    // mira si no le voy a meter bootstrap joe
    ventana.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">');
    //AHORA SI OCULTA los botones, asi que joe no se ve
    ventana.document.write(`
        <style> 
            body { padding: 40px; font-family: sans-serif; display: flex; justify-content: center; }
            .card { border: 1px solid #ddd !important; width: 100%; max-width: 600px; }
            .text-center.d-flex, button, a.btn { display: none !important; }
        </style>
    `);
    
    ventana.document.write('</head><body>');
    ventana.document.write(contenidoHTML); //
    ventana.document.write('</body></html>');
    ventana.document.close();
    ventana.focus();

    //espera para que carge bootstrap
    setTimeout(() => {
        ventana.print();
        ventana.close();
    }, 500);
}

function eliminarDelLocalStorage(key) {
//funcion que se invoca en el HTML cuando se oprime el boton "Salir"
    localStorage.removeItem(key);
}