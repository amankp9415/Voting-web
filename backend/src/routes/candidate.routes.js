const express = require('express');
const router = express.Router();
const {
  getCandidatesByElection,
  addCandidate,
  updateCandidate,
  deleteCandidate,
} = require('../controllers/candidate.controller');
const { auth, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public read (authenticated)
router.get('/election/:electionId', auth, getCandidatesByElection);

// Admin-only write
router.post('/', auth, adminOnly, upload.single('image'), addCandidate);
router.put('/:id', auth, adminOnly, upload.single('image'), updateCandidate);
router.delete('/:id', auth, adminOnly, deleteCandidate);

module.exports = router;
