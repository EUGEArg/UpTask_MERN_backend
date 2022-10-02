//--CONFIGURACIÓN DEL SERVIDOR--
import express from 'express';
import dotenv from 'dotenv'; 
import cors from 'cors';
import conectarDB from './config/db.js';
import usuarioRoutes from './routes/usuarioRoutes.js'
import proyectoRoutes from './routes/proyectoRoutes.js'
import tareaRoutes from './routes/tareaRoutes.js'


const app = express();
app.use(express.json()) //obtengo la rta json a la consulta del form

dotenv.config(); //busca en archivo .env

conectarDB();

//Configurar CORS
const  whitelist = [process.env.FRONTEND_URL]; //Dominio permitido---.env

const corsOptions = {
    origin: function(origin, callback) { //Identificar el origen del req, qué url está realizando la petición
        if(whitelist.includes(origin)){     
            //Puede consultar la API     
            callback(null, true);  //null porque no hay mje de error, true porque se da acceso
        }else{       
            //No está permitido su req     
            callback(new Error("Error de Cors"));
        }
    },
};

app.use(cors(corsOptions)); //

//ROUTING
app.use('/api/usuarios', usuarioRoutes); //hacemos referencia al app que concentra toda la funcionalidad de express---.use soporta get,post,put,patch y delete
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/tareas', tareaRoutes);

const PORT = process.env.PORT || 4000;
const servidor = app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});


//Socket.io
import { Server } from 'socket.io'; 

const io = new Server(servidor, {
    pingTimeout:60000,
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"],
        credentials: true
    },
});

io.on('connection', (socket) => {
    // console.log('Conectado a socket.io');

    //Definir los eventos de Socket io
    socket.on('abrir proyecto', (proyecto) => {
        socket.join(proyecto); // En qué pág está cada usuario
    }); 

    socket.on('nueva tarea', (tarea) => {
        const proyecto  = tarea.proyecto;
        socket.to(proyecto).emit('tarea agregada', tarea);
    });

    socket.on('eliminar tarea', (tarea) => {
        const proyecto = tarea.proyecto;
        socket.to(proyecto).emit('tarea eliminada', tarea)
    });

    socket.on('actualizar tarea', (tarea) => {
        const proyecto = tarea.proyecto._id;
        socket.to(proyecto).emit('tarea actualizada', tarea);
    })

    socket.on('cambiar estado', (tarea) => {
        const proyecto = tarea.proyecto._id;
        socket.to(proyecto).emit('nuevo estado', tarea);
    });
});