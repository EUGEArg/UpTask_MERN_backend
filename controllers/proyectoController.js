import Proyecto from "../models/Proyecto.js"
import Usuario from "../models/Usuario.js"

const obtenerProyectos = async(req, res) => {
    const proyectos = await Proyecto.find({
        '$or' : [ //Operador-condición: creador o colaborador
            {'colaboradores' : { $in: req.usuario}},
            {'creador' : { $in: req.usuario}}
        ]
    })//.Trae todos los proyectos almacenados en la BD.        
        .select('-tareas'); //Para que no traiga las tareas
    res.json(proyectos);
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
    
    const proyecto = await Proyecto
        .findById(id)
        .populate({path: 'tareas', populate: {path: 'completado', select: 'nombre'}}) //La ref es por el campo que tenemos en el modelo Proyecto
        .populate('colaboradores', 'nombre email'); 
    console.log(proyecto);

     if(!proyecto) { //verificar si el proyecto no existe
        const error = new Error('No encontrado')
        return res.status(404).json({ msg: error.message });
    }

    if(proyecto.creador.toString() !== req.usuario._id.toString()
        && !proyecto.colaboradores.some(colaborador => colaborador._id.toString()
        === req.usuario._id.toString())){ //Si quien quiere acceder no es el creador ni colaborador del proyecto
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

//----------------------------------------COLABORADORES----------------------------------------

const buscarColaborador = async(req, res) => {
    //Consulto el email ingresado
    const {email} = req.body
    //Consulto si el usuario está registrado
    const usuario = await Usuario.findOne({email}).select('-confirmado -createdAt -password -token -updatedAt -__v ') //Resto la info innecesaria

    if(!usuario){
        const error = new Error('Usuario no encontrado')
        return res.status(404).json({msg: error.message})
    }
    res.json(usuario)
};

const agregarColaborador = async (req, res) => {
    //Consulta a la API
    const proyecto = await Proyecto.findById(req.params.id);

    //Si no se encuentra el proyecto
    if(!proyecto) {
        const error = new Error ('Proyecto no Encontrado')
        return res.status(404).json({msg: error.message});
    }

    //Verificar que solo el creador pueda agregar colaboradores
    if(proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error ('Acción no Válida')
        return res.status(404).json({msg: error.message})
    }
    
    const {email} = req.body
    const usuario = await Usuario.findOne({email}).select('-confirmado -createdAt -password -token -updatedAt -__v ') //Resto la info innecesaria

    //Verificar que el usuario exista
    if(!usuario){
        const error = new Error('Usuario no encontrado')
        return res.status(404).json({msg: error.message})
    }

    //El colaborador no es el admin del proyecto
    if(proyecto.creador.toString() === usuario._id.toString()){
        const error = new Error ('El Creador del Proyecto no puede ser Colaborador')
        return res.status(404).json({msg: error.message})
    }

    //Revisar si ya está agregado al proyecto
    if(proyecto.colaboradores.includes(usuario._id)) {
        const error = new Error('El usuario ya pertenece al Proyecto')
        return res.status(404).json({msg: error.message})
    };
    
    //Luego de verficar: Agregar el usuario como colaborador
    proyecto.colaboradores.push(usuario._id)
    await proyecto.save()
    res.json({msg: 'Colaborador Agregado Correctamente'})
    
}

const eliminarColaborador = async(req, res) => {
    const proyecto = await Proyecto.findById(req.params.id);

    //Si no se encuentra el proyecto
    if(!proyecto) {
        const error = new Error ('Proyecto no Encontrado')
        return res.status(404).json({msg: error.message});
    }

    //Verificar que solo el creador pueda agregar colaboradores
    if(proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error ('Acción no Válida')
        return res.status(404).json({msg: error.message});
    }
    
   //Luego de verficar: Eliminar el usuario como colaborador
   proyecto.colaboradores.pull(req.body.id)
   await proyecto.save()
   res.json({msg: 'Colaborador Eliminado correctamente'});
}

export {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    buscarColaborador,
    agregarColaborador,
    eliminarColaborador,
}