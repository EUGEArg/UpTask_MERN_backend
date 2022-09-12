import nodemailer from "nodemailer";

export const emailRegistro = async (datos) => {
    const { email, nombre, token } = datos; //Lo requerido para el cuerpo del email

    const transport = nodemailer.createTransport({
        host: "smtp.mailtrap.io", //credenciales de acceso
        port: 2525,
        auth: {
            user: "88d5d9ab330df0",
            pass: "55c06cf5587468"
        }
    });

    //Información del email

    const info = await transport.sendMail({
        from:'"UpTask - Administrador de Proyectos" <cuentas@uptask.com>', //Quien envía el mail
        to: email, //Destinatario del email
        subjet:"UpTask - Confirma tu cuenta",
        text: "Comprueba tu cuenta en UpTask",
        html: `<p>Hola: ${nombre} Confirma tu cuenta en UpTask</p>

        <p>Tu cuenta ya está casi lista, solo debes comprobarla en el siguiente enlace: </p>
        
        <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Confirmar Cuenta</a>

        <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>    
        `
    })
}