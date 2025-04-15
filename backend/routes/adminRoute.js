const express = require('express')
const { 
    addDoctor,
    loginAdmin,
    allDoctors,
    appointmentsAdmin, appointmentCancel, adminDashboard  } = require('../controllers/adminController')
const upload = require('../middlewares/multer')
const authAdmin = require('../middlewares/authAdmin')
const { changeAvailability } = require('../controllers/doctorController')

const router = express.Router()

router.post('/add-doctor', authAdmin, upload.single('image'), addDoctor)

router.post('/login', loginAdmin)

router.post('/all-doctors', authAdmin, allDoctors)

router.post('/change-availability', authAdmin, changeAvailability)

router.get('/appointments', authAdmin, appointmentsAdmin)

router.post('/cancel-appointment', authAdmin, appointmentCancel)

router.get('/dashboard', authAdmin, adminDashboard)

module.exports = router