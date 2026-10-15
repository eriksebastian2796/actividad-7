document.addEventListener('DOMContentLoaded', () => {

    const formNombre = document.getElementById('form-ingreso-nombre'); 
    const nombre = document.getElementById('nombreCliente');
    //logica para procesar el ingreso del nombre
    if (formNombre) {
        formNombre.addEventListener('submit', function(event) {
            event.preventDefault();

            const nombreUsuario = nombre.value.trim(); //se guarda el valor en la variable sin espacios

            //validacion para que el nombre no este vacio
            if (nombreUsuario.trim() === "") {
                alert("¡Nombre vacío!");
                return;
            }
            //validacion para que el nombre no sea menor a 4 caracteres
            if (nombreUsuario.length < 4 ) {
                alert("El nombre es muy corto");
                return;
            }

            localStorage.setItem('clienteNombre', nombreUsuario); //guardado de nombre en localstorage
            window.location.href = '../productos.html'; //redireccionamiento para ver los productos
        });
    }

    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                // Cuando entra en pantalla (o al cargar la página)
                entrada.target.classList.add('active');
            } else {
                // Cuando sale de pantalla (si la pantalla es chica o scrolleas)
                entrada.target.classList.remove('active');
            }
        });
    }, {
        threshold: 0.1 // Se activa apenas se ve un 10% de la tarjeta
    });

    // Buscamos la tarjeta y la ponemos bajo vigilancia
    const loginCard = document.querySelector('.reveal-card');
    if (loginCard) {
        observador.observe(loginCard);
    }

    //este bloque de codigo revela el boton de inicio de sesion mediante la tecla CTRL + "i" 
    document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key.toLowerCase() === 'i') {
        event.preventDefault(); 
        const adminBtn = document.getElementById('admin-btn');
        adminBtn.classList.toggle('d-none');
    }
    });

    const inputNombre = document.getElementById('nombreCliente');
    if(inputNombre) {
     inputNombre.addEventListener('focus', () => {
        // Scrollear suavemente para que el input quede arriba
        inputNombre.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });


    if (document.querySelector('.simple-keyboard') && inputNombre) {
        
        const myKeyboard = new SimpleKeyboard.default({
            // Asocia el teclado al input visualmente
            onChange: input => onChange(input),
            onKeyPress: button => onKeyPress(button),
            
            // Layout personalizado (opcional, por defecto viene en inglés)
            layout: {
                'default': [
                    'Q W E R T Y U I O P',
                    'A S D F G H J K L Ñ',
                    'Z X C V B N M {bksp}',
                    '{space}'
                ]
            },
            // Etiquetas personalizadas para botones especiales
            display: {
                '{bksp}': '⌫',
                '{space}': 'ESPACIO'
            }
        });

        // Función que actualiza el input cuando tocas el teclado virtual
        function onChange(input) {
            inputNombre.value = input;
        }

        // Función opcional para detectar teclas específicas
        function onKeyPress(button) {
            // Si quieres sonido o vibración, va acá
            if (navigator.vibrate) navigator.vibrate(20); 
        }

        // Sincronización inversa: Si el usuario escribe con teclado físico,
        // actualizamos el teclado virtual para que no pierda el hilo.
        inputNombre.addEventListener("input", event => {
            myKeyboard.setInput(event.target.value);
        });
    }
}
    
});