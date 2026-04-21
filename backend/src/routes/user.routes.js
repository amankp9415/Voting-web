const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword } = require('../controllers/user.controller');
const { auth, userOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/profile', auth, userOnly, getProfile);
router.put('/profile', auth, userOnly, upload.single('profilePhoto'), updateProfile);
router.put('/change-password', auth, userOnly, changePassword);

module.exports = router;
