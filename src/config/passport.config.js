import passport from "passport";
import local from "passport-local";
import github from "passport-github2";
import { SessionsManagerMONGO as SessionsManager} from "../dao/sessionsManagerMONGO.js";
import { CartManagerMONGO as CartManager } from "../dao/cartManagerMONGO.js";
import { hashPassword, validatePassword } from "../utils.js";

const sessionsManager = new SessionsManager()
const cartManager = new CartManager()

export const initPassport=()=>{
    // --------- estrategia de registro -------------------//
    passport.use(
        "registro",
        new local.Strategy(
            {
                usernameField: "email",
                passReqToCallback: true,
            },
            async(req,username,password,done)=>{
                try {
                    const {nombre} = req.body
                    if(!nombre){  
                        console.log(`Failed to complete signup due to missing name.Please make sure all mandatory fields(*)are completed to proceed with signup`)
                        return done(null,false)
                    }
                
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if(!emailRegex.test(username)){
                        console.log(`The email ${username} does not match a valid email format. Other types of data structures are not accepted as an email address. Please verify and try again`)
                        return done(null,false)
                    }
                
                    const emailAlreadyExists = await sessionsManager.getUserByFilter({email:username})
                    if(emailAlreadyExists){
                        console.log(`The email you are trying to register (email: ${username}) already exists in our database and cannot be duplicated. Please try again using a diferent email.`)
                        return done(null,false)
                    }
                   
                    password = hashPassword(password)                  
                    const newCart = await cartManager.createCart()
                    const newUser = await sessionsManager.createUser({nombre,email:username,password,cart:newCart._id})
                    
                    return done(null, newUser)

                } catch (error) {
                    return done(error) 
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
                  
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if(!emailRegex.test(username)){
                        console.log(`The email ${username} does not match a valid email format. Other types of data structures are not accepted as an email address. Please verify and try again`)
                        done(null,false)
                    }

                    const userIsManager={
                        nombre:'Manager Session',
                        email:'adminCoder@coder.com',
                        password:'adminCod3r123',
                        rol:'admin',
                        cart: 'No Aplica'
                    }
                    
                    const userIsValid = await sessionsManager.getUserByFilter({email:username})
                    if(!userIsValid && username !== userIsManager.email){
                        console.log(`Failed to complete login. The email provided (email:${username} was not found in our database. Please verify and try again`)
                        return done(null,false)
                    }
                
                    if(!validatePassword(password,userIsValid.password)){
                        console.log( `The password you provided does not match our records. Please verify and try again.`)
                        return done(null,false)
                    }
                    
                    let authenticatedUser;
                    if(username === userIsManager.email && password === userIsManager.password){
                        authenticatedUser = userIsManager
                    }else{
                        authenticatedUser = userIsValid
                    }
        
                    return done(null,authenticatedUser)
                } catch (error) {
                    return done(error)
                }
            }
        )
    )

    // --------- estrategia de github ----------------------//
    passport.use(
        "github",
        new github.Strategy(
            {
                clientID:"Iv23liYmzZNCNPJHlieH",
                clientSecret:"d85809b557621684be429d6d28b41ea5e5fb3870",
                callbackURL:"http://localhost:8080/api/sessions/callbackGithub"
            },
            async(accessToken,refreshToken,profile,done)=>{
                try {
                    const email=profile._json.email
                    const nombre= profile._json.name
                    let authenticatedUser = await sessionsManager.getUserByFilter({email})
                    if(!authenticatedUser){
                        const newCart= await cartManager.createCart()
                        console.log('new cart was created: ',newCart)
                        authenticatedUser=await sessionsManager.createUser({
                            nombre,email,cart:newCart._id,profile
                        })
                        console.log('new authenticated user being sent: ',authenticatedUser)
                    }
                    return done(null,authenticatedUser)
                } catch (error) {
                    return done(error)
                }
            }
        )
    )

    // serializer + deserializer for apps w sessions
    passport.serializeUser((user, done)=>{
        return done(null,user._id)
    })

    passport.deserializeUser(async(id,done)=>{
        let user=await sessionsManager.getUserByFilter({_id:id})
        return done(null,user)
    })

}