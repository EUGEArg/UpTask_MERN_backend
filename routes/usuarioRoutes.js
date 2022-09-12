import express from 'express';
const router = express.Router() //variable de router
import { 
    registrar, 
    autenticar, 
    confirmar, 
    olvidePassword, 
    comprobarToken, 
    nuevoPassword,
    perfil
} from '../controllers/usuarioController.js'

import checkAuth from '../middleware/checkAuth.js'


//Autenticación, Registro Y Confirmación de Usuarios
router.post('/', registrar) //Crea un nuevo usuario
router.post('/login', autenticar)
router.get('/confirmar/:token', confirmar) //routing dinámico--- Lo que coloque desp de los : es lo que express va a generar dinámicamente
router.post('/olvide-password', olvidePassword) 
router.route('/olvide-password/:token').get(comprobarToken).post(nuevoPassword) //Validar token para cambiar password --- Nuevo password

router.get('/perfil', checkAuth, perfil); //checkAuth verifica el jwt(que sea válido, que exista, que está enviado vía headers---todas las comprobaciones necesarias); si todo está bien pasa al siguiente middleware que es perfil


export default router;