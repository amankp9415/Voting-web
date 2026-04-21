const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true
  },
  aadhaar: {
    type: String,
    required: true,
    unique: true
  },
  dob: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  empId: {
    type: String,
    unique: true
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    default: 'admin'
  },
}, { timestamps: true });

// Auto-generate empId before saving
adminSchema.pre('save', async function () {
  if (!this.empId) {
    const currentYear = new Date().getFullYear();
    const dobYear = new Date(this.dob).getFullYear();
    // Make unique by adding random suffix if needed
    let baseId = `EMP${currentYear}${dobYear}`;
    const Admin = mongoose.model('Admin');
    const existing = await Admin.countDocuments({ empId: new RegExp(`^${baseId}`) });
    this.empId = existing > 0 ? `${baseId}${String(existing).padStart(2, '0')}` : baseId;
  }
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

adminSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

adminSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Admin', adminSchema);
