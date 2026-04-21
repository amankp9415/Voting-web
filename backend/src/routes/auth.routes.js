const express = require('express');
const router = express.Router();
const {adminRegister,
  adminLogin,
  adminForgotPassword,
  userRegister,
  userLogin,
  userForgotPassword,
  getMe,
} = require('../controllers/auth.controller');
const { auth } = require('../middleware/auth');

router.post('/admin/register', adminRegister);
router.post('/admin/login', adminLogin);
router.post('/admin/forgot-password', adminForgotPassword);
router.post('/user/register', userRegister);
router.post('/user/login', userLogin);
router.post('/user/forgot-password', userForgotPassword);
router.get('/me', auth, getMe);

module.exports = router;
