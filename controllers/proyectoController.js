import Proyecto from "../models/Proyecto.js"
import Tarea from "../models/Tarea.js"

const obtenerProyectos = async(req, res) => {
    const proyectos = await Proyecto
        .find()//.Trae todos los proyectos almacenados en la BD.
        .where('creador') //Consulto por el creador del proyecto
        .equals(req.usuario) //Comparo
        .select('-tareas') //Para que no traiga las tareas

    res.json(proyectos)
}

const nuevoProyecto = async (req, res) => {
    const proyecto = new Proyecto(req.body) //Instancia con la info de la BD (nombre, descrip, cliente)
    proyecto.creador = req.usuario._id; //Agregar el creador
    try {
        const proyectoAlmacenado = await proyecto.save() //Guardo en BD
        res.json(proyectoAlmacenado);
    }catch(error){
        console.log(error)
    }

}

const obtenerProyecto = async (req, res) => {
    const { id } = req.params; //.params para acceder al routing dinámico.
    
    const proyecto = await Proyecto.findById(id).populate('tareas'); //La ref es por el campo que tenemos en Proyecto
    console.log(proyecto);

     if(!proyecto) { //verificar si el proyecto no existe
        const error = new Error('No encontrado')
        return res.status(404).json({ msg: error.message });
    }

    if(proyecto.creador.toString() !== req.usuario._id.toString()){ //Si quien quiere acceder no es el creador del proyecto: otro usuario de la app
        const error = new Error('Acción no válida')
        return res.status(401).json({ msg: error.message });
    }

    res.json(proyecto)//Obtener el proyecto 
        
};

const editarProyecto = async(req, res) => {
    const { id } = req.params; //.params para acceder al routing dinámico.
    
    const proyecto = await Proyecto.findById(id.trim());
    console.log(proyecto);

     if(!proyecto) { //verificar si el proyecto no existe
        const error = new Error('No encontrado')
        return res.status(404).json({ msg: error.message });
    }

    if(proyecto.creador.toString() !== req.usuario._id.toString()){ //Solo quien lo creó puede hacer modificaciones al proyecto
        const error = new Error('Acción no válida')
        return res.status(401).json({ msg: error.message });
    }
    proyecto.nombre = req.body.nombre || proyecto.nombre; // Si el usuario envía req.body se asigna, sino se contempla lo que está en la BD
    proyecto.description = req.body.description || proyecto.description;
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
    proyecto.cliente = req.body.cliente || proyecto.cliente;

    try {
        const proyectoAlmacenado = await proyecto.save() //Guardo cambios de actualización
        res.json(proyectoAlmacenado)
    }catch(error){
        console.log(error)
    }
};

const eliminarProyecto = async(req, res) => {
    const { id } = req.params; //.params para acceder al routing dinámico.
    
    const proyecto = await Proyecto.findById(id.trim());
    console.log(proyecto);

     if(!proyecto) { //verificar si el proyecto no existe
        const error = new Error('No encontrado')
        return res.status(404).json({ msg: error.message });
    }

    if(proyecto.creador.toString() !== req.usuario._id.toString()){ //Si quien quiere acceder no es el creador del proyecto: otro usuario de la app
        const error = new Error('Acción no válida')
        return res.status(401).json({ msg: error.message });
    }

    try {
            await proyecto.deleteOne(); //Método para eliminar un doc de la BD
            res.json({msg: 'Proyecto Eliminado'}) //Mje que vamos a enviar
    }catch(error) {
        console.log(error)
    }
}

const agregarColaborador = async(req, res) => {
    
}

const eliminarColaborador = async(req, res) => {
    
}

export {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    agregarColaborador,
    eliminarColaborador,
}