import mongoose from "mongoose";

const conectarDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI, { //url desde MongoDB-->connect -->connect your application
            useNewUrlParser: true, //configuración de mongoose
            useUnifiedTopology: true,//idem
        }
        )
        //permite la conexión a un servidor
        const url = `${connection.connection.host}:${connection.connection.port}`;
        console.log(`MongoDB conectado en: ${url}`)
    }catch (error) {
        console.log(`error: ${error.message}`) //para poder ver de qué trata el error
        process.exit(1); //para forzar que el proceso termine
    }
}

export default conectarDB;