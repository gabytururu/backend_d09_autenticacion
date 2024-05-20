import {fileURLToPath} from 'url';
import {dirname} from 'path';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

export default __dirname

const SECRET_SALT= "coderbackendecommerce?_?"

//--------- hash con crypto--------------//
// export const hashPassword = (password) =>{
//     const hashedPassword = crypto.createHmac("sha256",SECRET_SALT).update(password).digest("hex")
//     return hashedPassword
// }


//--------- hash con bcrypt--------------//
//con bcrypt : método síncrono de hasheo + 2 args: el psw a hashear y el # de saltos aleatorios a usar
//a + saltos, + seguridad pero tmb - performance (más lento) - el default recommendado es 10
export const hashPassword = (password) => bcrypt.hashSync(password,bcrypt.genSaltSync(10))

//a diferencia del metodo de crypto donde para recuperar(validar) comparabamos hash vs hash, en este método eso ya no será posible.. porque el # aleatorio de saltos lo impide. 
//por ese motivo necesito entonces una función adicional para recuperar y validar
// este nuevo metodo (comparesync) copara el psw original con el hasheado y devuelve un valor booleano : true si coinciden y false si no coinciden
export const validatePassword = (password, hashPassword) =>bcrypt.compareSync(password, hashPassword)



export const generateDynamicSessionSecret =()=> {
  const dynamicSessionSecret= crypto.randomBytes(32).toString('hex');
  return dynamicSessionSecret
}