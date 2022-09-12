import Proyecto from '../models/Proyecto.js';
import Tarea from '../models/Tarea.js';

const agregarTarea = async (req,res) =>{
    const { proyecto } = req.body; //Extraer el proyecto 

    const existeProyecto = await Proyecto.findById(proyecto); //Identificar si existe el proyecto mediante consulta en BD (await)
    
    if(!existeProyecto) { //Si el proyecto no existe
        const error = new Error('El proyecto no existe');
        return res.status(404).json({msg: error.message});
    }

    if(existeProyecto.creador.toString() !== req.usuario._id.toString()) { //Comprobar si quien quiere modificar es quien lo creó
        const error = new Error('No tienes los permisos para añadir tareas');
        return res.status(404).json({msg: error.message})
    }

    try { //Pasadas las comprobaciones, almacenamos la tarea
        const tareaAlmacenada = await Tarea.create(req.body);
        res.json(tareaAlmacenada);
    }catch(error) {
        console.log(error)
    }
};

const obtenerTarea = async (req,res) =>{
    const { id } = req.params
    
    const tarea = await Tarea.findById(id).populate('proyecto'); //populate--> para colecciones por medio de su ref
    if(!tarea) {
        const error = new Error('Tarea no encontrada');
        return res.status(404).json({msg: error.message});
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) { //Comprobar quien es el creador del proyecto y tenga los permisos 
        const error = new Error('Acción no válida');
        return res.status(403).json({msg: error.message});
    }
    res.json(tarea); // Se muestra la tarea
};

const actualizarTarea = async (req,res) =>{ //Leer lo que enviemos en el form
    const { id } = req.params
    
    const tarea = await Tarea.findById(id).populate('proyecto'); //populate--> para colecciones por medio de su ref
    if(!tarea) {
        const error = new Error('Tarea no encontrada');
        return res.status(404).json({msg: error.message});
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) { //Comprobar quien es el creador del proyecto y tenga los permisos 
        const error = new Error('Acción no válida');
        return res.status(403).json({msg: error.message});
    }
    //Los datos que se pueden modificar
    tarea.nombre = req.body.nombre || tarea.nombre;
    tarea.description = req.body.description || tarea.description;
    tarea.prioridad = req.body.prioridad  || tarea.prioridad ;
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;

    try {
        const tareaAlmacenada = await tarea.save(); //Guardo cambios
        res.json(tareaAlmacenada); //Retorno la tarea almacenada
    }catch(error) {
        console.log(error)
    }
}; 

const eliminarTarea = async (req,res) =>{
    const { id } = req.params
    
    const tarea = await Tarea.findById(id).populate('proyecto'); //populate--> para colecciones por medio de su ref
    if(!tarea) {
        const error = new Error('Tarea no encontrada');
        return res.status(404).json({msg: error.message});
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) { //Comprobar quien es el creador del proyecto y tenga los permisos 
        const error = new Error('Acción no válida');
        return res.status(403).json({msg: error.message});
    }

    try {
        await tarea.deleteOne()
        res.json({mgs: 'Tarea Eliminada'}) 
    }catch(error) {
        console.log(error)
    }
};

const cambiarEstado = async (req,res) =>{};

export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado,
};