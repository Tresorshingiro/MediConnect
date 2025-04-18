require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const connectCloudinary = require('./config/cloudinary')
const adminRouter = require('./routes/adminRoute')
const doctorRouter = require('./routes/doctorRoute')
const userRouter = require('./routes/userRoute')


//express app
const app = express()
connectCloudinary()

const corsOptions = {
    origin: [
      'https://mediconnect-three.vercel.app',
      'https://mediconnectadmin.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token', 'atoken', 'dtoken'],
    credentials: true
  };
//middleware
app.use(express.json())
app.use(cors(corsOptions))

//routes
app.use('/api/admin', adminRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter)

//connect to db
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        //listen for requests
        app.listen(process.env.PORT, () => {
        console.log('Connect to DB andlistenning on port', process.env.PORT)
    })
    })
    .catch((error) => {
        console.log(error)
    })
