import { Router } from 'express';
export const router=Router();
import { SessionsManagerMONGO as SessionsManager } from '../dao/sessionsManagerMONGO.js';
import { hashPassword,validatePassword } from '../utils.js';
import { CartManagerMONGO as CartManager } from '../dao/cartManagerMONGO.js';
import { authUserIsLogged } from '../middleware/auth.js';
import passport from "passport";

const sessionsManager = new SessionsManager()
const cartManager = new CartManager()

//failureFlash:true
//failureMessage: true
//failureRedirect:"/api/sessions/error", 

//router.post('/registro',authUserIsLogged,async(req,res)=>{
router.post('/registro',passport.authenticate("registro",{failureMessage:true,failureRedirect:"/api/sessions/error"}),async(req,res)=>{

    // ------------- LOGICA MIGRADA A PASSPORT.CONFIG.JS --------------//
    // let {nombre,email,password,web} = req.body
    // res.setHeader('Content-type', 'application/json');

    // if(!nombre || !email || !password){        
    //     return res.status(400).json({
    //         error:`Error: Failed to complete signup due to missing information`,
    //         message: `Please make sure all mandatory fields(*)are completed to proceed with signup.`
    //     })
    // }

    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if(!emailRegex.test(email)){
    //     return res.status(400).json({
    //         error:`Failed to complete registration due to invalid email`,
    //         message: ` The email ${email} does not match a valid email format. Other types of data structures are not accepted as an email address. Please verify and try again`
    //     })
    // }

    // try {
    //     const emailAlreadyExists = await sessionsManager.getUserByFilter({email})
    //     if(emailAlreadyExists){
    //         return res.status(400).json({
    //             error:`Failed to complete Signup due to duplicated email`,
    //             message: `The email you are trying to register (email:${email}) already exists in our database and cannot be duplicated. Please try again using a diferent email.`
    //         })
    //     }
    // } catch (error) {
    //     return res.status(500).json({
    //         error:`Error 500 Server failed unexpectedly, please try again later`,
    //         message: `${error.message}`
    //     })
    // }

    // // este no sufre ningun cambio con el hasheo de crypto hacia bcrypt (pero login si)
    // password = hashPassword(password)

    // try{
    //     const newCart = await cartManager.createCart()
    //     let newUser = await sessionsManager.createUser({nombre,email,password,cart:newCart._id})

    //     newUser = {...newUser}
    //     delete newUser.password

    //     //front end not working -- future improvement (see /js/signup)
    //     if(web){
    //         return res.status(301).redirect('/login')
    //     }

    //     res.status(200).json({
    //         status:"success",
    //         message:"Signup process was completed successfully",
    //         payload:{
    //             nombre:newUser.nombre,
    //             email: newUser.email,
    //             rol: newUser.rol,
    //             carrito: newUser.cart
    //         }
    //     })
    // }catch(error){
    //     return res.status(500).json({
    //         error:`Server failed unexpectedly, please try again later`,
    //         message: `${error.message}`
    //     })
    // }

    // si sale todo OK passport trae el req.user que creo antes (todo lo q platique con chatgpt :D)
    // console.log('desde el router /registro la REQUEST: ',req)
    // console.log('desde el router /registro la RESPONSE: ',req)
    console.log('desde el router  /registro LA REQ.USER: ',req.user)
    res.setHeader('Content-type', 'application/json');
    return res.status(201).json({mensaje:'Registro OK', newUser: req.user})
})

//router.post('/login',authUserIsLogged,async(req,res)=>{
router.post('/login',passport.authenticate("login",{failureMessage:true,failureRedirect:"/api/sessions/error"}),async(req,res)=>{
    // let {email,password,web}=req.body
    // res.setHeader('Content-type', 'application/json');

    // if(!email || !password){        
    //     return res.status(400).json({
    //         error:`Error: Failed to complete login due to missing information`,
    //         message: `Please make sure all mandatory fields(*)are completed to proceed with signup.`
    //     })
    // }

    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if(!emailRegex.test(email)){
    //     return res.status(400).json({
    //         error:`Failed to complete login due to invalid email`,
    //         message: ` The email ${email} does not match a valid email format. Other types of data structures are not accepted as an email address. Please verify and try again`
    //     })
    // }
  
    // try {
    //     const userIsManager={
    //         nombre:'Manager Session',
    //         email:'adminCoder@coder.com',
    //         password:'adminCod3r123',
    //         rol:'admin',
    //         cart: 'No Aplica'
    //     }
    //    // const emailIsValid = await sessionsManager.getUserByFilter({email})
    //     const userIsValid = await sessionsManager.getUserByFilter({email})
    //     if(!userIsValid && email !== userIsManager.email){
    //         return res.status(404).json({
    //             error:`Error: email not found`,
    //             message: `Failed to complete login. The email provided (email:${email} was not found in our database. Please verify and try again`
    //         })
    //     }

    //     if(!validatePassword(password,userIsValid.password)){
    //         return res.status(401).json({
    //             error:`Failed to complete login: Invalid credentials`,
    //             message: `The password you provided does not match our records. Please verify and try again.`
    //         })
    //     }
    //     //este proceso se ve alterado por la migracion de hasheo de crypto a bcrypt pq aqui estoy solo hasheando el password q me da el user para compararlo con el password hasheado q me llega de DB... pero debido a los saltos aleatorios es ono funcionará con bcrypt .. entonces toca implementar el validaPassword 
    //     let authenticatedUser;
    //     if(email === userIsManager.email && password === userIsManager.password){
    //         authenticatedUser = userIsManager
    //     }else{
    //        // authenticatedUser = await sessionsManager.getUserByFilter({email, password: hashPassword(password)})
    //         authenticatedUser = userIsValid
    //     }
 
    //     authenticatedUser = {...authenticatedUser}
    //     delete authenticatedUser.password

    //     req.session.user=authenticatedUser

    //     if(web){
    //         return res.status(301).redirect('/products')
    //     }

    //     return res.status(200).json({
    //         status: 'success',
    //         message: 'User login was completed successfully',
    //         payload: {
    //             nombre: authenticatedUser.nombre,
    //             email: authenticatedUser.email,
    //             rol:authenticatedUser.rol,
    //             carrito:authenticatedUser.cart
    //         }
    //     })      
    // } catch (error) {
    //     return res.status(500).json({
    //         error:`Error 500 Server failed unexpectedly, please try again later`,
    //         message: `${error.message}`
    //     })
    // }

    // el middleware passport al final lo que me envia es un req.user que entonces puede servir para las ultimas validaciones acá (como la eliminacion del password previo envio a frontend y eso) -- esa logica debe permanecer viviendo aca, pero antes se hacia con el user resultante del req.body... yahora se hara con el req.user que genera el middleware al terminar 

    let {web} = req.body

    let authenticatedUser ={...req.user}
    delete authenticatedUser.password
    req.session.user = authenticatedUser    
    
    if(web){
        return res.status(301).redirect('/products')
    }
    res.setHeader('Content-type', 'application/json');
    return res.status(200).json({
        status: 'success',
        message: 'User login was completed successfully',
        payload: {
            nombre: authenticatedUser.nombre,
            email: authenticatedUser.email,
            rol:authenticatedUser.rol,
            carrito:authenticatedUser.cart
        }
    })      

})

router.get('/logout', async(req,res)=>{
    req.session.destroy(error=>{
        if(error){
            res.setHeader('Content-type', 'application/json');
            return res.status(500).json({
                error:`Error 500 Server failed unexpectedly, please try again later`,
                message: `${error.message}`
            })
        }
    })

    res.setHeader('Content-type', 'application/json');
    return res.status(200).json({payload:'Logout Exitoso'})
})

router.get('/error',(req,res)=>{
    // console.log('desde el router /error la REQUEST: ',req)
    // console.log('desde el router /error la RESPONSE: ',req)
    
    res.setHeader('Content-type', 'application/json');
    return res.status(500).json({
        error:`Error 500 Server failed unexpectedly, please try again later`,
        message: `Fallo al autenticar`
    })
})
