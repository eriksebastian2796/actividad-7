document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body; 

    const updateTheme = () => {
        const isDark = body.classList.contains('dark-mode');

        // 2. Lógica para el icono del botón
        if (themeToggleBtn) {
            const icon = themeToggleBtn.querySelector('i');
            if(icon) {
                // Truco: toggle reemplaza add/remove manual
                icon.classList.toggle('bi-moon-stars-fill', !isDark);
                icon.classList.toggle('bi-sun-fill', isDark);
            }
        }
        
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    };

    // Inicialización
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
    }
    updateTheme(); // Ejecutar al inicio para sincronizar

    // Evento
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            updateTheme();
        });
    }
});