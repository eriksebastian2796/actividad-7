//archivo de configuración para session donde se verifica que el usuario esté logeado antes de acceder a una URL

const esAdmin = (req,res,next) => {
    //verificamos que el usuario tenga el pase de sesión
    if(req.session.usuarioId){
        next(); //si lo tiene, la petición continúa y puede acceder al dashboard

    } else {
        res.redirect('/admin/login'); //si no lo tiene, es redireccionado al login
    }

}

export default esAdmin;