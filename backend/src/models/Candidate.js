const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  party: {
    type: String,
    required: true,
    trim: true
  },
  bio: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election', required: true
  },
  voteCount: {
    type: Number,
    default: 0
  },
  age: { type: Number },
  qualification: {
    type: String,
    default: ''
  },
}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);
