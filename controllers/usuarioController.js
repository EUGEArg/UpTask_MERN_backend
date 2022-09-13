import Usuario from "../models/Usuario.js";
import generarId from "../helpers/generarId.js";
import generarJWT from "../helpers/generarJWT.js";
import { emailRegistro } from "../helpers/email.js"

//REGISTRO DE USUARIO
const registrar = async (req, res) => {   
    //Prevenir registros duplicados
    const { email } = req.body; //consulta
    const existeUsuario = await Usuario.findOne({ email }) // encuentra el primero que coincida con el email
    
    if(existeUsuario) { //para no crear un nuevo usuario con el mail ya registrado e informar al usuario de que ya hay un registro
        const error = new Error('Usuario ya registrado')
        return res.status(400).json({msg: error.message})
    }
    
    try {
        const usuario = new Usuario(req.body) //creo un nuevo usuario a partir del modelo(Usuario) y con req.body creo una nueva instancia del modelo
        usuario.token = generarId();
        await usuario.save() //almacenar en la BD --- .save() permite tener un obj, modificarlo y almacenarlo
        
        //Enviar email de confirmación
        emailRegistro({ //Se manda como objeto los datos requeridos
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token,
        })
        
        res.json({msg: 'Usuario Creado Correctamente. Revisa tu Email para confirmar tu cuenta'}) //finaliza el llamado a la función y retorna el usuario con la info

    }catch(error) {
        console.log(error)
    }

};

const autenticar = async (req, res)=> {

    const { email, password } =req.body;

    //Comprobar si el usuario existe
    const usuario = await Usuario.findOne({email}) //Comprobar si el email ya existe
    if(!usuario) {
        const error = new Error('El usuario no existe');
        return res.status(404).json({msg: error.message})
    }

    //Comprobar si el usuario está confirmado
    if(!usuario.confirmado) {
        const error = new Error('Tu cuenta no ha sido confirmada');
        return res.status(403).json({msg: error.message})
    }

    //Confirmar su password
    if( await usuario.comprobarPassword(password)) {
    res.json({ //datos que requiero en el front
        _id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        token: generarJWT(usuario._id),
    })
    }else {
        const error = new Error('El Password es incorrecto');
        return res.status(403).json({msg: error.message})
    }
}

const confirmar = async (req, res) =>{
    const { token } = req.params //Leemos de la url
    const usuarioConfirmar = await Usuario.findOne({token}) // Buscamos un usuario con ese token
    if(!usuarioConfirmar) { //si no existe el usuario a confirmar
        const error = new Error('Token no válido'); 
        return res.status(403).json({msg: error.message})
    }     
    try{ //Si existe:
        usuarioConfirmar.confirmado = true; // Confirmamos el usuario. De false a true 
        usuarioConfirmar.token = '' //Eliminamos el token porque es de un solo uso
        await usuarioConfirmar.save(); //almacena en BD con los cambios
        res.json({msg: 'Usuario Confirmado Correctamente'}) // Rta: confirmación de usuario
    }catch(error){
        console.log(error)
    }
}

const olvidePassword = async (req,res) => {
    const { email } = req.body; //primero consulta si el email/usuario existe
    const usuario = await Usuario.findOne({email}) //Comprobar si el email/usuario ya existe
    if(!usuario) { //Si el usuario no existe:
        const error = new Error('El usuario no existe');
        return res.status(404).json({msg: error.message})
    }
    try{ //Si existe usuario:
        usuario.token = generarId()
        await usuario.save() //Guardar en BD
        res.json({msg: 'Se ha enviado un email con las instrucciones'})
    }catch(error){
        console.log(error)
    }
}

const comprobarToken = async (req,res) =>{
    const { token } = req.params; //'params' porque extraigo valores de la url
    const tokenValido = await Usuario.findOne({ token }) //Buscar por token

    if(tokenValido) {
        res.json({msg: 'Token válido y usuario existente'})
    }else {
        const error = new Error('Token no válido');
        return res.status(404).json({msg: error.message})
    }
}

const nuevoPassword = async (req,res) =>{
    const { token } = req.params; //.params porque extraigo valores de la url
    const { password } = req.body; //.body porque extraigo valores desde el form
    
    const usuario = await Usuario.findOne({ token }) //Verificar el token

    if(usuario) { //Primero corroborar que el token sea válido
        usuario.password = password; //Nuevo password
        usuario.token = '' //Reseteamos y eliminamos       
        try {
            usuario.save() //Almaceno en la BD
            res.json({msg: 'Password Modificado Correctamente'})
        }catch(error){
            console.log(error)
        }
    }else { //Si no es correcto esta rta
        const error = new Error('Token no válido');
        return res.status(404).json({msg: error.message})
    }
}

const perfil = async (req, res) => {
    const {usuario} = req
    res.json(usuario) //lee desde el servidor
}

export {
    registrar,
    autenticar,
    confirmar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    perfil
}