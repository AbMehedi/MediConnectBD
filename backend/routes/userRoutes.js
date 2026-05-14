const express = require('express');
const { registerUser, authUser } = require('../controllers/userController_WORKING');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);

module.exports = router;