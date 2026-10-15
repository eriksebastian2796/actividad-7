document.addEventListener('DOMContentLoaded', () => {
        const inputBusqueda = document.getElementById('buscador-input');
        const selectFiltro = document.getElementById('filtro-categoria');
        
        // Seleccionamos todas las filas del cuerpo de la tabla
        const filas = document.querySelectorAll('.table-custom tbody tr');

        function filtrarTabla() {
            const texto = inputBusqueda.value.toLowerCase();
            const categoria = selectFiltro.value.toLowerCase();

            filas.forEach(fila => {
                // Obtenemos el contenido de las celdas (ID es indice 0, Nombre es índice 2, Categoría es índice 3)
                // Usamos optional chaining (?) por si la fila está vacía o es el mensaje de "No hay productos"
                const tdId = fila.cells[0]?.textContent.toLowerCase(); 
                const tdNombre = fila.cells[2]?.textContent.toLowerCase();
                const tdCategoria = fila.cells[3]?.textContent.toLowerCase();

                // Si no hay datos, la ignoramos
                if (!tdNombre) return;

                // Verificamos si cumple con la búsqueda Y con el filtro
                const coincideBusqueda = tdId.includes(texto) || tdNombre.includes(texto);
                const coincideCategoria = categoria === '' || tdCategoria.includes(categoria);

                // Mostramos u ocultamos
                if (coincideBusqueda && coincideCategoria) {
                    fila.style.display = '';
                } else {
                    fila.style.display = 'none';
                }
            });
        }

        // Escuchamos los eventos
        inputBusqueda.addEventListener('input', filtrarTabla);
        selectFiltro.addEventListener('change', filtrarTabla);
    });