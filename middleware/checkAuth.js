//Así se proteje el middleware que sigue: perfil, evitando el acceso hasta que el usuario no esté autenticado

import jwt from 'jsonwebtoken'
import Usuario from '../models/Usuario.js';

const checkAuth = async (req, res, next) => {
    let token;
    if (
        req.headers.authorization && //JWT se envía en los headers
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1]; //Divide la cadena en dos y asigno la posición 1. Elimina el bearer[0] y queda el token[1]

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.usuario = await Usuario.findById(decoded.id)//Busca al usuario por el id, la asigna a la variable y tenemos la sesión del usuario
                .select('-password -confirmado -token -createdAt -updatedAt -__v') //Quito de la rta los datos que no se necesitan

            return next() //Una vez que verificamos el jwt y lo asignamos al req pasamos al siguiente middleware
        } catch (error) {
            return res.status(404).json({ msg: 'Hubo un error' })
        }
    }

    if (!token) {
        const error = new Error('Token no válido');
        return res.status(401).json({ msg: error.message }) //para que no ejecute el siguiente middleware
    }
    next(); //pasa al siguiente middleware
}

export default checkAuth;