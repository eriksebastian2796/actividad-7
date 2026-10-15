//archivo que maneja la aparicion y desapàricion de las cards en el login del administrador
document.addEventListener('keydown', function(event) {
    //se captura el evento CTRL + r y se pasa a minuscula por las dudas
    if (event.ctrlKey && event.key.toLowerCase() === 'r') {
        event.preventDefault(); 
        const cardTest = document.getElementById('card-test'); //capturamos el id en la vista partial de la card

        if (cardTest.classList.contains('activa')) { //valida si esta activa o no
            cerrarCardTest();
        } else {
            abrirCardTest();
        }
    }
});

function abrirCardTest() {
    const cardTest = document.getElementById('card-test');
    const cardLogin = document.getElementById('card-login');
    const emailTraido = cardTest.dataset.email;
    const passTraido = cardTest.dataset.password;
    const inputEmail = document.getElementById('email-tester');
    if (inputEmail) {
        inputEmail.value = emailTraido;
    }

    const inputPass = cardTest.querySelector('input[name="password"]');
    if (inputPass) {
        inputPass.value = passTraido;
    }

    cardTest.classList.remove('desactivada'); 
    cardTest.classList.add('activa');

    if(cardLogin) {
        cardLogin.classList.remove('on');
        cardLogin.classList.add('off');
    }
}

function cerrarCardTest() {
    const cardTest = document.getElementById('card-test');
    const cardLogin = document.getElementById('card-login');

    cardTest.classList.remove('activa');
    cardTest.classList.add('desactivada'); 
    if(cardLogin) {
        cardLogin.classList.remove('off');
        cardLogin.classList.add('on');
    }
}

//tuve que reestructurar porque la anmacion de la card test al desaparecer no ocurria