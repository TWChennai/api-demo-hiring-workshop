const express = require('express')
const router = express.Router()
const UserController = require('../controllers/users')

router.post('/signup', UserController.users_create_user)

router.post('/login', UserController.users_login_user)
 
module.exports = router