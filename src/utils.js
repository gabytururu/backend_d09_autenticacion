import {fileURLToPath} from 'url';
import {dirname} from 'path';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

export default __dirname

export const hashPassword = (password) => bcrypt.hashSync(password,bcrypt.genSaltSync(10))
export const validatePassword = (password, hashPassword) =>bcrypt.compareSync(password, hashPassword)



export const generateDynamicSessionSecret =()=> {
  const dynamicSessionSecret= crypto.randomBytes(32).toString('hex');
  return dynamicSessionSecret
}