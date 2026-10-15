# Sistema de Autoservicio - Tienda Los Vigilantes

Originalmente este proyecto era el proyecto final de programación 3 consiste en una aplicación de **Autoservicio** (Kiosco digital) intuitivo donde el usuario no deba escribir ningúna ruta a mano. Contando tambíen con un panel de administración (Backoffice) para la gestión de productos y ventas. 

## 📋 Integrantes del Grupo
* Cristian Iván Collante
    * Github: [@deltron9](https://github.com/deltron9)
    * Linkedin: [Cristian Iván Collante](https://www.linkedin.com/in/cristian-collante-171b04294/)
* Alan Joel Monzón
    * Github: [@kalcifer27](https://github.com/kalcifer27)
    * Linkedin: [Alan Joel Monzón](https://www.linkedin.com/in/alan-joel-monz%C3%B3n-7013a8340/)

## 🚀 Tecnologías Utilizadas

**Backend (backoffice y servidor) y Base de datos:**
* **Node.js & Express**
* **MVC** como patrón de arquitectura
* **Sequelize** como ORM para base de datos
* **MySQL** como base de datos
* **EJS** Motor de plantillas (para el panel de administración)

**Frontend (Cliente):**
* HTML5
* CSS3
* JavaScript

## ⚙️ Funcionalidades

### Cliente (Autoservicio)
* **Logeo mediante teclado virtual:** Teclado virtual en registro de nombre para no tener necesidad de utilizar el teclado.
* **Alojamiento de nombre de cliente y carrito de compras** en Localstorage.
* **Navegación intuitiva:** Selección de productos por tanto por categorías como general.
* **Carrito de compras:** Agregar, eliminar y modificar cantidades en tiempo real.
* **Generación de Ticket:** Al finalizar la compra, se genera un ticket con el detalle (opción de descarga en PDF).
* **Modo Oscuro/Claro:** Persistencia de preferencia de tema.

### 🛠️ Administrador (Backoffice)
* **Acceso oculto:** Botón de acceso oculto mediante combinación de teclas.
* **Login seguro:** Acceso restringido con encriptación de contraseñas.
* **Botón de Acceso Rápido:** Autocompletado de credenciales para testing agil.
* **Dashboard:**
    * CRUD completo de Productos (Alta, Baja lógica, Modificación).
    * Gestión de imágenes de productos.
    * Reactivación de productos eliminados.
* **API:** Endpoints JSON para alimentar la vista del cliente.

## Descarga de imágenes:
* **docker pull deltron9/vigilantes_backend:latest** para la imagen del backend.
* **docker pull deltron9/los-vigilantes-frontend** para la imagen del frontend.
* **docker pull deltron9/bd-app-web** para la base de datos.


## Acceso a sector empleados:
En la pagina de index apretar **CTRL + I** para activar el boton en la navbar que lleva al login de empleados.

## Credenciales de Prueba (Testing):
Para facilitar el acceso, el login en sector de gestión cuenta con una combinacion de **"Modo Tester (CTRL + R)"** que permite el logeo rápido activando una card con credenciales pre-cargadas.
