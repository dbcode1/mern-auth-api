const express = require('express')
const router = express.Router()
const {requireSignin, checkToken} = require('../controllers/auth')

const { search } = require('../controllers/search')


router.get('/search', requireSignin, search)



module.exports = router