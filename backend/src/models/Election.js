const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  totalVotes: { type: Number, default: 0 },
}, { timestamps: true });

// Virtual to compute status dynamically
electionSchema.virtual('status').get(function () {
  const now = Date.now();
  const start = new Date(this.startTime).getTime();
  const end = new Date(this.endTime).getTime();
  if (isNaN(start) || isNaN(end)) return 'invalid';  // fixed
  if (now < start) return 'upcoming';
  if (now <= end) return 'active';
  return 'ended';
});
electionSchema.set('toJSON', { virtuals: true });
electionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Election', electionSchema);
