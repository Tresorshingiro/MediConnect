const doctorModel = require("../models/doctorModel")
const bcrypt = require('bcrypt')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const appointmentModel = require("../models/appointmentModel")


const changeAvailability = async (req, res) => {
    try{
        const {docId} = req.body

        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId,{available: !docData.available})
        res.json({success:true, message: 'Availability Changed'})
    } catch(error){
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

const doctorList = async (req, res) => {
    try{
        const doctors = await doctorModel.find({}).select(['-password','-email'])
        res.json({success:true, doctors})
    } catch(error){
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

//API for doctor Login
const loginDoctor = async(req, res) => {
    try{
        const {email, password} = req.body
        const doctor = await doctorModel.findOne({email})

        if(!doctor){
            return res.json({success:false, message:'Doctor Not Found'})
        }

        const isMatch = await bcrypt.compare(password, doctor.password)

        if(isMatch) {
            const token = jwt.sign({id:doctor._id}, process.env.JWT_SECRET, {expiresIn:'1d'})
            res.json({success:true, token})
        } else{
            res.json({success:false, message:'Invalid Credentials'})
        }
    } catch(error){
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

//API to get doctor Appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
    try{
        const {docId}= req.body
        const appointments = await appointmentModel.find({docId})
        res.json({success:true, appointments})
    } catch(error){
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

//API to mark appointment completed
const appointmentComplete = async (req, res) => {
    try{
        const { docId, appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true })
            return res.json({ success: true, message: 'Appointment Completed' })
        } else {
            return res.json({ success: false, message: 'Appointment Not Found' })
        }
    } catch(error){
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

//API to cancel appointment
const appointmentCancel = async (req, res) => {
    try{
        const { docId, appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })
            return res.json({ success: true, message: 'Appointment Cancelled' })
        } else {
            return res.json({ success: false, message: 'Cancellation Failed' })
        }
    } catch(error){
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

//API to get dashbard data for doctor panel
const doctorDashboard = async (req, res) => {
    try{
        const {docId} = req.body
        const appointments = await appointmentModel.find({docId})

        let earnings = 0

        appointments.map((item)=> {
            if(item.isCompleted || item.payment){
                earnings += item.amount
            }
        })
        let patients = []

        appointments.map((item)=>{
            if(!patients.includes(item.userId)){
                patients.push(item.userId)
            }
        })

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.slice(0, 5).reverse()
        }
        res.json({success:true, dashData})
    } catch(error){
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

//API to get doctor profile
const doctorProfile = async (req, res) => {
    try{
        const {docId} = req.body
        const profileData = await doctorModel.findById(docId).select(['-password'])
        res.json({success:true, profileData})

    } catch(error){
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

//API to update doctor profile
const updateDoctorProfile = async (req, res) => {
    try{
        const { docId, fees, address, available } = req.body
        
        await doctorModel.findByIdAndUpdate(docId, {fees, address, available})
        res.json({success:true, message:'Profile Updated'})
    } catch (error){
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

module.exports = {
    changeAvailability,
    doctorList,
    loginDoctor,
    appointmentsDoctor,
    appointmentComplete,
    appointmentCancel,
    doctorDashboard,
    doctorProfile,
    updateDoctorProfile
}