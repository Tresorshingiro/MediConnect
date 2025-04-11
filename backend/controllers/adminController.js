const doctorModel = require('../models/doctorModel')
const validator = require('validator')
const bcrypt = require('bcrypt')
const {v2: cloudinary} = require('cloudinary')
const jwt = require('jsonwebtoken')

//API for adding doctor
const addDoctor = async (req,res) => {
    try{

        const {name, email, password, speciality, degree, experience, about, fees, address} = req.body
        const imageFile = req.file

        //checking for all data to add doctor
        if(!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address || !imageFile){
            return res.json({success: false, message: "Missing Details"})
        }

        //validating email format
        if(!validator.isEmail(email)){
            return res.json({success: false, message: "Please enter a valid email"})
        }

        //validating strong password
        if(!validator.isStrongPassword(password)){
            return res.json({success: false, message: "Password must contain atleast 8 characters, 1 lowercase, 1 uppercase, 1 number and 1 special character"})
        }

        //hashing password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type:"image"})
        const imageUrl = imageUpload.secure_url

        //create doctor
        const doctorData = {
           name,
           email,
           image:imageUrl,
           password: hashedPassword,
           speciality,
           degree,
           experience,
           about,
           fees,
           address:JSON.parse(address),
           date:Date.now()
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()

        res.json({success:true, message:"Doctor added successfully"})

    }catch(error){
      console.log(error)
      res.json({success:false, message:error.message})  
    }
}

//Get all doctors for admin panel
const allDoctors = async (req, res) => {
    try{
        const doctors = await doctorModel.find({}).select('-password')
        res.json({success:true, doctors})
    } catch(error){
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

//API for admin login
const loginAdmin = async (req, res) => {
    try{

        const {email, password} = req.body

        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            const token = jwt.sign(email+password, process.env.JWT_SECRET)
            res.status(200).json({success:true, token})
        }else {
            res.json({success:false, message: 'Invalid Credentials'})
        }

    }catch(error){
        console.log(error)
        res.status(400).json({error: error.message})
    }
}

module.exports = {
    addDoctor,
    loginAdmin,
    allDoctors
}