const jwt = require('jsonwebtoken')

//Doctor authentication middleware
const authDoctor = async (req,res,next) => {
    try{

        const {dtoken} = req.headers
        if (!dtoken) {
            return res.json({success:false, message:'Not Authorized Login Again'})
        }
        const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET)
        
        req.body.docId = token_decode.id

        next()

    }catch (error) {
        console.log(error)
        res.status(400).json({message:error.message})
    }
}

module.exports = authDoctor