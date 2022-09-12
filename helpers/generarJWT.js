import jwt from 'jsonwebtoken';

const generarJWT = (id) =>{
    return jwt.sign({id}, process.env.JWT_SECRET, { //generación del token
        expiresIn: '30d', //expiración del token
    } ) 
}

export default generarJWT;