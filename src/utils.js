import {fileURLToPath} from 'url';
import {dirname} from 'path';
import crypto from 'crypto'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

export default __dirname

const SECRET_SALT= "coderbackendecommerce?_?"

export const hashPassword = (password) =>{
    const hashedPassword = crypto.createHmac("sha256",SECRET_SALT).update(password).digest("hex")
    return hashedPassword
}


export const generateDynamicSessionSecret =()=> {
  const dynamicSessionSecret= crypto.randomBytes(32).toString('hex');
  return dynamicSessionSecret
}