//MODELO PARA TAREAS
import mongoose from "mongoose";

const tareaSchema = mongoose.Schema({
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
    estado: { //Si está la tarea completa o no
        type: Boolean,
        default: false,
    },
    fechaEntrega: {
        type: Date,
        required: true,
        default: Date.now(),
    },
    prioridad: {
        type: String,
        required: true,
        enum: ['Baja', 'Media', 'Alta'],
    },
    proyecto: { //Para relacionar con el modelo de Proyecto
        type: mongoose.Schema.Types.ObjectId,
        ref: "Proyecto",
    }, 
    completado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        default: null,
    }
},{
    timestamps: true
});

const Tarea = mongoose.model("Tarea", tareaSchema);
export default Tarea;