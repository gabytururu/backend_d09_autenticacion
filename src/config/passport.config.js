import passport from "passport";
import local from "passport-local";
import { SessionsManagerMONGO as SessionsManager} from "../dao/sessionsManagerMONGO.js";
import { CartManagerMONGO as CartManager } from "../dao/cartManagerMONGO.js";
import { hashPassword, validatePassword } from "../utils.js";

//instancio aca sessionsManager pq aca es donde la voa consumir (antes estaba en el router de validaciones instanciado y consumido.. ahora q migré aqui la logica de validacion tengo q asegurarme q exista pa poder consumirlo)
const sessionsManager = new SessionsManager()
const cartManager = new CartManager()

export const initPassport=()=>{
    // --------- estrategia de registro -------------------//
    passport.use(
        "registro", // nombre de la estrategia
       

        //instanciacion de la estrategia: lleva 2 args: 1 obj donde puedo mandar configuraciones via parametros+ 1 funcion asyncrona cuyo contenido varía por estrategia pues esta supeditado a la data que se requiere para cada estrategia
        new local.Strategy(
            {
                usernameField: "email",
                passReqToCallback: true,
                //failureMessage: true // not working here either
            },
            async(req,username,password,done)=>{
                try {
                    //aca tralado toda la logica de registro/validaciones que viene del session router.
                    //PERO LUEGO de migrarlo toca adaptarlo/refactorarlo a las variables de passport por ej: el email en passport-local quedará guardado en la variable "username" asi que cada vez q busque el email realmente me toca buscar el username
                    //y el password por ej ya no ocupo llamarlo del body aca pq al instante el mdidleware lo rescata en automatico y lo almacecena en la variable password (asi como almacena el email en la variable username)
                    //como resultado, voy eliminando esos datos de mi codigo
                        //  let {nombre,email,password,web} = req.body
                    //y entonces ya solo rescato las variables remanentes, en este caso es nombre pero bien podría ser edad, o domicilio o whatever que vaya aquerer usar
                        //  let {nombre,web} = req.body
                    let {nombre} = req.body //le quite web por ahora
                    console.log('el body de req.body: ',req.body)
                    console.log('el username al inicio de req.body: ',username)
                    console.log('el password al inicio req.body: ',password)

                    // res.setHeader('Content-type', 'application/json');
                    
                    //de aca tmb borro el !email y !password pq tmb en parte de la validacion automatica de passport
                    //if(!nombre || !email || !password){        
                    if(!nombre){  
                        console.log('no habia nombre lleno')
                        //ya no ocupare estos responses... pq en passport opero con el done      
                            // return res.status(400).json({
                            //     error:`Error: Failed to complete signup due to missing information`,
                            //     message: `Please make sure all mandatory fields(*)are completed to proceed with signup.`
                            // })
                        //null: no hay error(no mando ningun callback pq en este metodo el unico error se manda en el catch) .. perooooo:
                        // false: no hay usuario (pues si no hay nombre no hay usuario y entonces mando a decir que nombre no hay y por ende el resultado de user found pues es false - y esto pues genera entonces el error requerido)
                        return done(null,false, {message:"All mandatory fields(*) must be completed to proceed with signup"})
                    }
                
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    console.log('el email regex: ',emailRegex)
                    console.log('el email regex test:',emailRegex.test(username))
                    //aca no testeo el email sino el username (que tiene encapsulado al email como valor) y luego si da error pues cambio el res por un done
                    //if(!emailRegex.test(email)){
                    if(!emailRegex.test(username)){ //si error quitar llaves y quitar email: portion.. dejar solo username
                        // return res.status(400).json({
                        //     error:`Failed to complete registration due to invalid email`,
                        //     message: ` The email ${email} does not match a valid email format. Other types of data structures are not accepted as an email address. Please verify and try again`
                        // })

                        console.log('el regex test fallo el')
                        return done(null,false,{message:"The email / turned to string email / does not match a valid email format. Other types of data structures are not accepted as an email address. Please verify and try again"})
                    }
                
                    try {
                        const emailAlreadyExists = await sessionsManager.getUserByFilter({email:username})
                        console.log('resultado de emailAlreadyExists: ',emailAlreadyExists)
                        if(emailAlreadyExists){
                            console.log('el emailAlready Exists fallo pq ya existe ese mail')
                            // return res.status(400).json({
                            //     error:`Failed to complete Signup due to duplicated email`,
                            //     message: `The email you are trying to register (email:${email}) already exists in our database and cannot be duplicated. Please try again using a diferent email.`
                            // })
                            return done(null,false,{message:"The email you are trying to register (email: / turned to string email /) already exists in our database and cannot be duplicated. Please try again using a diferent email."})
                        }
                    } catch (error) {
                        // return res.status(500).json({
                        //     error:`Error 500 Server failed unexpectedly, please try again later`,
                        //     message: `${error.message}`
                        // })
                        //---------------ver si opera o si toca borrarlo para el ultimo catch???--------------------//
                        done(error) 
                    }
                
                    // este no sufre ningun cambio con el hasheo de crypto hacia bcrypt (pero login si)
                    password = hashPassword(password)
                    
                
                    // try{
                    const newCart = await cartManager.createCart()
                    //let newUser = await sessionsManager.createUser({nombre,email:username,password,cart:newCart._id})
                    const newUser = await sessionsManager.createUser({nombre,email:username,password,cart:newCart._id})
                    
                    //--------- OPTION 1  HANDLING FORMAT HERE -------------------/
                    // newUser = {...newUser}
                    // delete newUser.password

                    // const userPayload={
                    //     nombre:newUser.nombre,
                    //     email: newUser.email,
                    //     rol: newUser.rol,
                    //     carrito: newUser.cart
                    // }
                    
                    // return done(null, userPayload)

                      //--------- OPTION 2  DELEGATING FORMAT OF RESPONSE  TO ROUTER AND KEEPING HERE ONLY THE AUTHENTICATION CONSCERN -------------------/

                      return done(null, newUser)
                    
                    //---------PENDIENTE VER DONDE DEBE QUEDAR? ROUTER O ACA? ----------------//
                    //front end not working -- future improvement (see /js/signup)
                    // if(web){
                    //     return res.status(301).redirect('/login')
                    // }
                     //------------------------------------------------//
                    
                    //can no longer be like this
                    // res.status(200).json({
                    //     status:"success",
                    //     message:"Signup process was completed successfully",
                    //     payload:{
                    //         nombre:newUser.nombre,
                    //         email: newUser.email,
                    //         rol: newUser.rol,
                    //         carrito: newUser.cart
                    //     }
                    // })

           
                    // }catch(error){
                    //     return res.status(500).json({
                    //         error:`Server failed unexpectedly, please try again later`,
                    //         message: `${error.message}`
                    //     })
                    // }
                } catch (error) {
                    return done(error) //sustituye res.status(400)
                }
            }
        )
    )

    // --------- estrategia de login ----------------------//
    passport.use(
        "login",
        new local.Strategy(
            {
                usernameField: "email",
            },
            async(username,password,done)=>{
                try {
                    //let {email,password,web}=req.body
                    // let {web}=req.body
                    //res.setHeader('Content-type', 'application/json');
                    
                    // Ya no se necesita porque PASSPORT LO hace automaticamente 
                        // if(!email || !password){        
                        //     return res.status(400).json({
                        //         error:`Error: Failed to complete login due to missing information`,
                        //         message: `Please make sure all mandatory fields(*)are completed to proceed with signup.`
                        //     })
                        // }
                
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    //if(!emailRegex.test(email)){
                    if(!emailRegex.test(username)){
                        // return res.status(400).json({
                        //     error:`Failed to complete login due to invalid email`,
                        //     message: ` The email ${email} does not match a valid email format. Other types of data structures are not accepted as an email address. Please verify and try again`
                        // })
                        console.log(`The email ${username} does not match a valid email format. Other types of data structures are not accepted as an email address. Please verify and try again`)
                        done(null,false)
                    }
                  
                    // try {
                        const userIsManager={
                            nombre:'Manager Session',
                            email:'adminCoder@coder.com',
                            password:'adminCod3r123',
                            rol:'admin',
                            cart: 'No Aplica'
                        }
                       // const emailIsValid = await sessionsManager.getUserByFilter({email})
                        const userIsValid = await sessionsManager.getUserByFilter({email:username})
                        if(!userIsValid && username !== userIsManager.email){
                            // return res.status(404).json({
                            //     error:`Error: email not found`,
                            //     message: `Failed to complete login. The email provided (email:${email} was not found in our database. Please verify and try again`
                            // })
                            console.log(`Failed to complete login. The email provided (email:${username} was not found in our database. Please verify and try again`)
                            return done(null,false)
                        }
                
                        if(!validatePassword(password,userIsValid.password)){
                            // return res.status(401).json({
                            //     error:`Failed to complete login: Invalid credentials`,
                            //     message: `The password you provided does not match our records. Please verify and try again.`
                            // })
                            console.log( `The password you provided does not match our records. Please verify and try again.`)
                            return done(null,false)
                        }
                        //este proceso se ve alterado por la migracion de hasheo de crypto a bcrypt pq aqui estoy solo hasheando el password q me da el user para compararlo con el password hasheado q me llega de DB... pero debido a los saltos aleatorios es ono funcionará con bcrypt .. entonces toca implementar el validaPassword 
                        let authenticatedUser;
                        if(username === userIsManager.email && password === userIsManager.password){
                            authenticatedUser = userIsManager
                        }else{
                           // authenticatedUser = await sessionsManager.getUserByFilter({email, password: hashPassword(password)})
                            authenticatedUser = userIsValid
                        }
                 
                        // authenticatedUser = {...authenticatedUser}
                        // delete authenticatedUser.password
                
                        // req.session.user=authenticatedUser
                
                        // if(web){
                        //     return res.status(301).redirect('/products')
                        // }
                
                        // return res.status(200).json({
                        //     status: 'success',
                        //     message: 'User login was completed successfully',
                        //     payload: {
                        //         nombre: authenticatedUser.nombre,
                        //         email: authenticatedUser.email,
                        //         rol:authenticatedUser.rol,
                        //         carrito:authenticatedUser.cart
                        //     }
                        // })      
                        return done(null,authenticatedUser)
                    // } catch (error) {
                    //     return res.status(500).json({
                    //         error:`Error 500 Server failed unexpectedly, please try again later`,
                    //         message: `${error.message}`
                    //     })
                    // }
                } catch (error) {
                    return done(error)
                }
            }
        )
    )

    // serializer + deserializer for apps w sessions
    //OJO AQUI : Dado que este serializer y deserializer aplica tanto p/login como /password, estoy nombrando la variable de forma mas generica (user) a pesar de que en las estrategias, el objeto/variable enviado tiene un nombre acorde a la estrategia (ej. newUser para registro y authenticatedUser para login) -- al final tanto esas variables (newUser/authenticadedUser) como estas (user) se refieren a lo mismo : la entidad ligada al username tratando de conectarse. 
    passport.serializeUser((user, done)=>{
        return done(null,user._id)
    })

    passport.deserializeUser(async(id,done)=>{
        let user=await sessionsManager.getUserByFilter({_id:id})
        return done(null,user)
    })

}