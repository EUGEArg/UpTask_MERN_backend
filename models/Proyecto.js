import mongoose from 'mongoose'

const proyectosSchema = mongoose.Schema({
    nombre: {
        type: String,
        trim: true,
        required: true,
    },
    description: {
        type: String,
        trim: true,
        required: true,
    },
    fechaEntrega: {
        type: Date,
        default: Date.now(),
    },
    cliente: {
        type: String,
        trim: true,
        required: true,
    },
    creador: { //Objeto porque sólo hay un creador o adm
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario", //de donde obtiene la referencia
    },
    tareas: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Tarea"
        }
    ],
    colaboradores: [ //Arreglo porque puede haber varios colaboradores, es una colección.
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Usuario",
        }
    ],
},
{
    timestamps: true,
}
);

const Proyecto = mongoose.model('Proyecto', proyectosSchema);
export default Proyecto;