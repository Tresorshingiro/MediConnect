const express = require('express')
const { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, makePayment } = require('../controllers/userController')
const authUser = require('../middlewares/authUser')
const upload = require('../middlewares/multer')

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/get-profile', authUser, getProfile)
router.post('/update-profile', upload.single('image'), authUser, updateProfile)
router.post('/book-appointment', authUser, bookAppointment)
router.get('/appointments', authUser, listAppointment)
router.post('/cancel-appointment', authUser, cancelAppointment)
router.post('/stripe', authUser, makePayment)

module.exports = router