const express = require('express')

const {doctorList} = require('../controllers/doctorController')

const router = express.Router()

router.get('/list', doctorList)

module.exports = router