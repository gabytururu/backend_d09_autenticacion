import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import sessions from 'express-session';
import dotenv from 'dotenv';
import {router as productsRouter} from './routes/productsRouter.js'
import {router as cartsRouter} from './routes/cartsRouter.js'
import {router as vistasRouter} from './routes/vistasRouter.js'
import {router as sessionsRouter} from './routes/sessionsRouter.js'
import { messagesModel } from './dao/models/messagesModel.js';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import __dirname from './utils.js';
import MongoStore from 'connect-mongo';
import passport from 'passport'
import { initPassport } from './config/passport.config.js'; 

const PORT = 8080;
dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(sessions({
    secret: 'cookieSecretSignature123?_?',
    resave:true,
    saveUninitialized: true,
    store:MongoStore.create({
        ttl:3600,
        mongoUrl: process.env.MONGO_URL,
        dbName:'ecommerce',
        collectionName:'browserSessions'
    })
})) 


initPassport()
app.use(passport.initialize())
app.use(passport.session())

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname,'/views'));

app.use(express.static(path.join(__dirname,'/public')));

app.use("/", vistasRouter)
app.use("/api/products", productsRouter)
app.use("/api/carts", cartsRouter)
app.use("/api/sessions", sessionsRouter)


const server= app.listen(PORT, ()=>{
    console.log(`listening on port ${PORT}`)
})

const dbConnection = async()=>{
    try{
        await mongoose.connect(
            process.env.MONGO_URL,
            {
                dbName: "ecommerce"
            }
        )
        console.log('DB Conectada en puerto 8080 - ecommerce...!')
    }catch(err){
        console.log('error al connectarse con la DB via puerto 8080:', err.message)
    }
}

dbConnection()

const io= new Server(server)

io.on("connection", socket=>{
    console.log(`El cliente con id ${socket.id} se ha conectado al chat`)

    socket.on("email", async email=>{
        let messages = await messagesModel.find()
        socket.emit("chatHistory", messages)
        socket.broadcast.emit("newUserConnection", email)
    })

    socket.on("createNewMessage", async (email, message)=>{
        await messagesModel.create({email, message})
        io.emit("displayNewMessage", email, message)
    })
})