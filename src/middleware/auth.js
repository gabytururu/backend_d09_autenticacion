export const auth=(req,res,next)=>{
    if(!req.session.user){
        res.setHeader('Content-type', 'application/json');
        return res.status(401).json({
            error:`Failed to Login - Invalid credentials - no authenticated users were found.`,
        })
    }
    next()
}

export const authManager=(req,res,next)=>{
    if(!req.session.user){
        res.setHeader('Content-type', 'application/json');
        return res.status(401).json({
            error:`Failed to Login - Invalid credentials - no authenticated users were found.`,
        })
    }

    if(req.session.user.rol !== 'admin'){
        res.setHeader('Content-type', 'application/json');
        return res.status(403).json({
            error:`Failed to Login - Invalid credentials - This resource is only Open for Managers'.`,
        })
    }
    next()
}

export const authUserIsLogged=(req,res,next)=>{
    if(req.session.user){
        return res.status(302).redirect('/perfil')
    }
    next()
}