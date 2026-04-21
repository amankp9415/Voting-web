const Admin = require('../models/Admin');
const path = require('path');
const fs = require('fs');

exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id).select('-password');
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
    res.json({ success: true, admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, gender } = req.body;
    const updateData = { name, phone, gender };

    if (req.file) {
      // Delete old photo if exists
      const admin = await Admin.findById(req.user._id);
      if (admin.profilePhoto) {
        const oldPath = path.join(__dirname, '../../uploads', path.basename(admin.profilePhoto));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.profilePhoto = `/uploads/${req.file.filename}`;
    }

    const updated = await Admin.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      select: '-password',
    });

    res.json({ success: true, message: 'Profile updated successfully', admin: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.user._id);

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    admin.password = newPassword;
    await admin.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
