const validator = require('validator')
const bcrypt = require('bcrypt')
const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')
const doctorModel = require('../models/doctorModel')
const cloudinary = require('cloudinary').v2
const appointmentModel = require('../models/appointmentModel')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

//API to register user
const registerUser = async (req, res) => {
    try{

        const {name, email, password} = req.body
        if(!name || !email || !password){
            return res.json({success: false, message:"Missing Details"})
        }

        if(!validator.isEmail(email)){
            return res.json({success: false, message:"Please enter a valid email"})
        }

        if(!validator.isStrongPassword(password)){
            return res.json({success: false, message:"Password must contain atleast 8 characters, 1 lowercase, 1 uppercase, 1 number and 1 special character"})
        }

        //hashing password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()

        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET)

        res.json({success:true, token})

    } catch(error){
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

const loginUser = async (req, res) => {
    try{
        const {email, password} = req.body
        const user = await userModel.findOne({email})

        if(!user){
            return res.json({success:false, message:"User not found"})
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch){
            const token = jwt.sign({id:user._id}, process.env.JWT_SECRET)
            return res.json({success:true, token})
        } else {
            res.json({success:false, message:"Invalid Credentials"})
        }
    } catch(error){
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

//API to get user profile data
const getProfile = async (req, res) => {
    try{
        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password')

        res.json({success:true, userData})

    } catch(error){
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

//API to update user profile
const updateProfile = async (req, res) => {
    try{
        const { userId, name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if(!name || !phone || !dob || !gender){
            return res.json({success: false, message:"Missing Details"})
        }

        const userData = await userModel.findByIdAndUpdate(userId, {name, phone, address:JSON.parse(address), dob, gender}, {new:true})

        if(imageFile){
            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type:'image'})
            const imageUrl = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, {image:imageUrl})
        }
        res.json({success:true, message:"Profile updated successfully"})

    } catch(error){
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

//API to book appointment
const bookAppointment = async (req, res) => {
    try{
        const { userId, docId, slotDate, slotTime } = req.body

        const docData = await doctorModel.findById(docId).select('-password')

        if(!docData.available){
            return res.json({success:false, message:"Doctor not Available"})
        }

        let slots_booked = docData.slots_booked
        // check for slot availability
        if (slots_booked[slotDate]) {
            if(slots_booked[slotDate].includes(slotTime)) {
                return res.json({success:false, message:"Slot already booked"})
            } else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select('-password')

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            slotDate,
            slotTime,
            userData,
            docData,
            amount: docData.fees,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        // save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId, {slots_booked})
        res.json({success:true, message:"Appointment booked successfully"})
    } catch(error){
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

//API to get user appointments
const listAppointment = async (req, res) => {
    try{
        const { userId } = req.body
        const appointments = await appointmentModel.find({userId}).sort({date:-1})

        res.json({success:true, appointments})

    } catch(error){
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

//API to cancel appointment
const cancelAppointment = async (req, res) => {
    try{
        const {userId, appointmentId} = req.body

        const appointmentDataData = await appointmentModel.findById(appointmentId)

        // verify appointment user
        if (appointmentDataData.userId !== userId){
            return res.json({success:false, message:"Not Authorized"})
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, {cancelled:true})

        // releasing doctor slot

        const {docId, slotDate, slotTime} = appointmentDataData
        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, {slots_booked})
        res.json({success:true, message:"Appointment cancelled"})
    } catch(error){
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

//API to make payment
const makePayment = async (req, res) => {
    try {
      const { appointmentId } = req.body;
      
      // Verify the appointment exists and isn't cancelled
      const appointment = await appointmentModel.findById(appointmentId);
      
      if (!appointment || appointment.cancelled) {
        return res.status(400).json({ 
          success: false, 
          message: "Appointment Cancelled or not found" 
        });
      }
  
      // Verify the user owns this appointment
      if (appointment.userId.toString() !== req.userId.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: "Not authorized to pay for this appointment" 
        });
      }
  
      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: appointment.amount * 100, 
        currency: 'usd',
        metadata: {
          appointmentId: appointment._id.toString(),
          userId: req.userId.toString()
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });
  
      res.json({ 
        success: true, 
        clientSecret: paymentIntent.client_secret 
      });
  
    } catch (error) {
      console.error('Payment error:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }




module.exports = {registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, makePayment}