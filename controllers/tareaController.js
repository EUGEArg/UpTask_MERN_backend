import Proyecto from '../models/Proyecto.js';
import Tarea from '../models/Tarea.js';


//----------------------------------------AGREGAR TAREA----------------------------------------
const agregarTarea = async (req,res) =>{
    const { proyecto } = req.body; //Extraer el proyecto 

    //Identificar si existe el proyecto mediante consulta en BD (await)
    const existeProyecto = await Proyecto.findById(proyecto); 
    
    //Si el proyecto no existe
    if(!existeProyecto) { 
        const error = new Error('El proyecto no existe');
        return res.status(404).json({msg: error.message});
    }

    //Comprobar si quien quiere modificar es quien lo creó
    if(existeProyecto.creador.toString() !== req.usuario._id.toString()) { 
        const error = new Error('No tienes los permisos para añadir tareas');
        return res.status(404).json({msg: error.message})
    }

    //Pasadas las comprobaciones, almacenamos la tarea
    try { 
        const tareaAlmacenada = await Tarea.create(req.body);
        //Almacenar ID en el Proyecto
        existeProyecto.tareas.push(tareaAlmacenada._id);
        await existeProyecto.save();// Guardar el cambio en BD
        res.json(tareaAlmacenada);
    }catch(error) {
        console.log(error);
    }
};

//----------------------------------------OBTENER TAREA----------------------------------------
const obtenerTarea = async (req,res) =>{
    const { id } = req.params;
    
    //populate--> para colecciones por medio de su ref
    const tarea = await Tarea.findById(id).populate('proyecto'); 
    if(!tarea) {
        const error = new Error('Tarea no encontrada');
        return res.status(404).json({msg: error.message});
    }

    //Comprobar quien es el creador del proyecto y tenga los permisos 
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) { 
        const error = new Error('Acción no válida');
        return res.status(403).json({msg: error.message});
    }
    res.json(tarea); // Se muestra la tarea
};

//----------------------------------------ACTUALIZAR TAREA----------------------------------------
const actualizarTarea = async (req,res) =>{ //Leer lo que enviemos en el form
    const { id } = req.params;
    
    const tarea = await Tarea.findById(id).populate('proyecto'); 

    if(!tarea) {
        const error = new Error('Tarea no encontrada');
        return res.status(404).json({msg: error.message});
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) { 
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
        console.log(error);
    }
}; 

//----------------------------------------ELIMINAR TAREA----------------------------------------
const eliminarTarea = async (req,res) =>{
    const { id } = req.params;
    
    const tarea = await Tarea.findById(id).populate('proyecto'); 
    if(!tarea) {
        const error = new Error('Tarea no encontrada');
        return res.status(404).json({msg: error.message});
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) { 
        const error = new Error('Acción no válida');
        return res.status(403).json({msg: error.message});
    }

    try {
        const proyecto = await Proyecto.findById(tarea.proyecto); //Identificar el proyecto
        proyecto.tareas.pull(tarea._id);  //Acceso a las tareas
        await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()])
        res.json({msg: 'La Tarea se eliminó'}) 
    }catch(error) {
        console.log(error);
    }
};

const cambiarEstado = async (req,res) =>{
    const { id } = req.params
    
    const tarea = await Tarea.findById(id).populate('proyecto'); 

    if(!tarea) {
        const error = new Error('Tarea no encontrada');
        return res.status(404).json({msg: error.message});
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString() && !tarea.proyecto.colaboradores.some(colaborador => colaborador._id.toString()
    === req.usuario._id.toString())) { 
        const error = new Error('Acción no válida');
        return res.status(403).json({msg: error.message});
    }

    tarea.estado = !tarea.estado;
    tarea.completado = req.usuario._id; //Mostrar el usuario que completó la tarea
    await tarea.save();

    const tareaAlmacenada = await Tarea.findById(id)
    .populate('proyecto')
    .populate('completado')
    res.json(tareaAlmacenada);
};

export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado,
};