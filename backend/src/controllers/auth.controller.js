const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizePhone = (phone) => String(phone || '').replace(/\D/g, '');
const normalizeAadhaar = (aadhaar) => String(aadhaar || '').replace(/\D/g, '');
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/;

const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
};

// ─── Admin Auth ───────────────────────────────────────────────
exports.adminRegister = async (req, res) => {
  try {
    const { name, email, password, phone, aadhaar, dob, gender } = req.body;
    const normalizedAadhaar = normalizeAadhaar(aadhaar);

    if (!emailRegex.test(email || '')) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }
    if (normalizePhone(phone).length !== 10) {
      return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits after +91' });
    }
    if (!passwordRegex.test(password || '')) {
      return res.status(400).json({ success: false, message: 'Password must include letters, numbers, and a special character' });
    }
    if (normalizedAadhaar.length !== 12) {
      return res.status(400).json({ success: false, message: 'Aadhaar number must be exactly 12 digits' });
    }
    if (calculateAge(dob) < 18) {
      return res.status(400).json({ success: false, message: 'Admin must be at least 18 years old to register' });
    }

    const [existingAdminEmail, existingUserEmail] = await Promise.all([
      Admin.findOne({ email }),
      User.findOne({ email }),
    ]);
    if (existingAdminEmail || existingUserEmail) {
      return res.status(400).json({ success: false, message: 'This email is already registered in the system' });
    }
    const existingAadhaar = await Admin.findOne({ aadhaar: normalizedAadhaar });
    if (existingAadhaar) {
      return res.status(400).json({ success: false, message: 'Admin with this Aadhaar number already exists' });
    }

    const admin = new Admin({ name, email, password, phone: normalizePhone(phone), aadhaar: normalizedAadhaar, dob, gender });
    await admin.save();
    const token = generateToken(admin._id, 'admin');

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      token,
      user: admin,
    });
  
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!emailRegex.test(email || '')) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(admin._id, 'admin');
    res.json({
      success: true,
      message: 'Admin logged in successfully',
      token,
      user: admin,
    });
  
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── User Auth ────────────────────────────────────────────────
exports.userRegister = async (req, res) => {
  try {
    const { name, email, password, phone, aadhaar, dob, gender } = req.body;
    const normalizedAadhaar = normalizeAadhaar(aadhaar);

    if (!emailRegex.test(email || '')) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }
    if (normalizePhone(phone).length !== 10) {
      return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits after +91' });
    }
    if (!passwordRegex.test(password || '')) {
      return res.status(400).json({ success: false, message: 'Password must include letters, numbers, and a special character' });
    }
    if (normalizedAadhaar.length !== 12) {
      return res.status(400).json({ success: false, message: 'Aadhaar number must be exactly 12 digits' });
    }

    const [existingUserEmail, existingAdminEmail] = await Promise.all([
      User.findOne({ email }),
      Admin.findOne({ email }),
    ]);
    if (existingUserEmail || existingAdminEmail) {
      return res.status(400).json({ success: false, message: 'This email is already registered in the system' });
    }
    const existingAadhaar = await User.findOne({ aadhaar: normalizedAadhaar });
    if (existingAadhaar) {
      return res.status(400).json({ success: false, message: 'User with this Aadhaar number already exists' });
    }

    if (calculateAge(dob) < 18) {
      return res.status(400).json({ success: false, message: 'User must be at least 18 years old to register' });
    }

    const user = new User({ name, email, password, phone: normalizePhone(phone), aadhaar: normalizedAadhaar, dob, gender });
    await user.save();
    const token = generateToken(user._id, 'user');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user,
    });
  
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!emailRegex.test(email || '')) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, 'user');
    res.json({
      success: true,
      message: 'User logged in successfully',
      token,
      user,
    });
  
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const resetPasswordForModel = async (req, res, Model, roleLabel) => {
  try {
    const { email, aadhaar, password } = req.body;
    const normalizedAadhaar = normalizeAadhaar(aadhaar);

    if (!emailRegex.test(email || '')) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }

    if (normalizedAadhaar.length !== 12) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 12-digit Aadhaar number' });
    }

    if (!passwordRegex.test(password || '')) {
      return res.status(400).json({ success: false, message: 'Password must include letters, numbers, and a special character' });
    }

    const account = await Model.findOne({ email });
    if (!account) {
      return res.status(404).json({ success: false, message: `${roleLabel} not found with this email` });
    }

    if (normalizeAadhaar(account.aadhaar) !== normalizedAadhaar) {
      return res.status(400).json({ success: false, message: 'Email and Aadhaar number do not match our records' });
    }

    account.password = password;
    await account.save();

    return res.json({
      success: true,
      message: `${roleLabel} password reset successfully. Please sign in with your new password.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.adminForgotPassword = async (req, res) => {
  return resetPasswordForModel(req, res, Admin, 'Admin');
};

exports.userForgotPassword = async (req, res) => {
  return resetPasswordForModel(req, res, User, 'User');
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user, role: req.role });
};
