const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const Vote = require('../models/Vote');
const path = require('path');
const fs = require('fs');

exports.getCandidatesByElection = async (req, res) => {
  try {
    const candidates = await Candidate.find({ electionId: req.params.electionId });
    res.json({ success: true, candidates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addCandidate = async (req, res) => {
  try {
    const { name, party, bio, age, qualification, electionId } = req.body;

    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ success: false, message: 'Election not found' });

    // Check candidate count (max 10)
    const count = await Candidate.countDocuments({ electionId });
    if (count >= 10) {
      return res.status(400).json({ success: false, message: 'Maximum 10 candidates allowed per election' });
    }
    if (count < 0) {
      return res.status(400).json({ success: false, message: 'Minimum 2 candidates required per election' });
    }

    const candidate = new Candidate({
      name,
      party,
      bio,
      age,
      qualification,
      electionId,
      image: req.file ? `/uploads/${req.file.filename}` : '',
    });
    await candidate.save();
    res.status(201).json({ success: true, message: 'Candidate added successfully', candidate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCandidate = async (req, res) => {
  try {
    const { name, party, bio, age, qualification } = req.body;
    const updateData = { name, party, bio, age, qualification };

    if (req.file) {
      const candidate = await Candidate.findById(req.params.id);
      if (candidate && candidate.image) {
        const oldPath = path.join(__dirname, '../../uploads', path.basename(candidate.image));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const candidate = await Candidate.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found' });

    res.json({ success: true, message: 'Candidate updated successfully', candidate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found' });

    // Delete candidate image if exists
    if (candidate.image) {
      const imgPath = path.join(__dirname, '../../uploads', path.basename(candidate.image));
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    // Remove related votes
    await Vote.deleteMany({ candidateId: req.params.id });

    res.json({ success: true, message: 'Candidate deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
