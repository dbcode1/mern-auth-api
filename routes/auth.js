const express = require('express')
const router = express.Router()

const {signup, accountActivation, signin, forgotPassword, resetPassword} = require('../controllers/auth')
const {userSignupValidator, userSigninValidator, forgotPasswordValidator,  resetPasswordValidator} = require('../validators/auth')
const {runValidation} = require('../validators')


router.post('/account-activation', accountActivation)
router.post('/signup', userSignupValidator, runValidation, signup)
router.post('/signin', userSigninValidator, runValidation, signin)
// forgot password
router.put('/forgot-password', forgotPasswordValidator, runValidation, forgotPassword);
router.put('/reset-password', resetPasswordValidator, runValidation, resetPassword)


module.exports = router