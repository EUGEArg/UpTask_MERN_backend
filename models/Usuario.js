//MODELO DE USUARIOS
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const usuarioSchema = mongoose.Schema({
    nombre: {
    type: String,
    required: true,
    trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true //espacios
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true, //para evitar dos cuentas con el mismo mail
    },
    token: {
        type: String,
    },
    confirmado: {
        type: Boolean,
        default: false,
    },
},
{
    timestamps: true, //crear dos columnas más: creado y actualizado
}
);
//Hashear password
usuarioSchema.pre('save', async function(next){ //Antes de almacenar
    if(!this.isModified('password')){ //Antes de guardar revisa que el password esté hasheado.
        next(); //para pasar al siguiente Middleware

    }
    const salt = await bcrypt.genSalt(10); //Si no está hasheado ignora la línea anterior y lo vuelve a hashear
    this.password = await bcrypt.hash(this.password, salt) //el primero es el string que se va a hashear

})

//Comprobar el password
usuarioSchema.methods.comprobarPassword = async function(passwordFormulario){
    return await bcrypt.compare(passwordFormulario, this.password) //compara string que escribe el usuario y el password que ya está hasheado o encriptado
}

const Usuario = mongoose.model('Usuario', usuarioSchema); //definir el modelo
export default Usuario; //la hacemos disponible a la app