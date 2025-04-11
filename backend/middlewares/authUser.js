const jwt = require('jsonwebtoken')

//user authentication middleware
const authUser = async (req,res,next) => {
    try{

        const {token} = req.headers
        if (!token) {
            return res.json({success:false, message:'Not Authorized Login Again'})
        }
        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        
        req.body.userId = token_decode.id

        next()

    }catch (error) {
        console.log(error)
        res.status(400).json({message:error.message})
    }
}

module.exports = authUser