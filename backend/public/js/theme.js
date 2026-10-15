// Función para actualizar el logo
function updateLogo(isDarkMode) {
    const logoImg = document.querySelector('.logo-responsive img, img.logo-responsive');
    if (logoImg) {
        const currentSrc = logoImg.src;
        if (isDarkMode && currentSrc.includes('logo_dark_admin.svg')) {
            logoImg.src = currentSrc.replace('logo_dark_admin.svg', 'logo_light_admin.svg');
        } else if (!isDarkMode && currentSrc.includes('logo_light_admin.svg')) {
            logoImg.src = currentSrc.replace('logo_light_admin.svg', 'logo_dark_admin.svg');
        }
    }
}

// 1. Aplicar tema inmediatamente
(function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.addEventListener("DOMContentLoaded", () => updateLogo(true));
    }
})();

// 2. Lógica del botón
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('theme-toggle');
    const logoImg = document.querySelector('.logo-responsive img, img.logo-responsive');
    
    // Transición suave para el logo
    if(logoImg) logoImg.style.transition = "opacity 0.3s ease";

    if (!toggleBtn) return; 

    const icon = toggleBtn.querySelector('i');
    const body = document.body;

    // Sincronizar icono al cargar (Usa clases de Bootstrap Icons)
    if (body.classList.contains('dark-mode')) {
        icon.classList.remove('bi-moon-stars-fill');
        icon.classList.add('bi-sun-fill');
        updateLogo(true);
    }

    toggleBtn.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');

        // Animación
        icon.style.transform = 'rotate(360deg)';
        setTimeout(() => icon.style.transform = '', 500);

        // Cambiar Icono (Lógica Bootstrap Icons)
        if (isDark) {
            icon.classList.replace('bi-moon-stars-fill', 'bi-sun-fill');
            localStorage.setItem('theme', 'dark');
        } else {
            icon.classList.replace('bi-sun-fill', 'bi-moon-stars-fill');
            localStorage.setItem('theme', 'light');
        }

        // Efecto visual logo
        if(logoImg) logoImg.style.opacity = '0';
        setTimeout(() => {
            updateLogo(isDark);
            if(logoImg) logoImg.style.opacity = '1';
        }, 150);
    });
});