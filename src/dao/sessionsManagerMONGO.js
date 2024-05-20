import { sessionsModel } from './models/sessionsModel.js'

export class SessionsManagerMONGO{

    async getUserByFilter(filter={}){
        return await sessionsModel.findOne(filter).lean()
    }
   
    async createUser(newUser){
        let newUserCreated= await sessionsModel.create(newUser)
        return newUserCreated.toJSON()
    }

    
}