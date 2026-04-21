const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword } = require('../controllers/admin.controller');
const { auth, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/profile', auth, adminOnly, getProfile);
router.put('/profile', auth, adminOnly, upload.single('profilePhoto'), updateProfile);
router.put('/change-password', auth, adminOnly, changePassword);

module.exports = router;
