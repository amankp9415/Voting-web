const express = require('express');
const router = express.Router();
const {
  getAllElections,
  getElectionById,
  createElection,
  updateElection,
  deleteElection,
  getResults,
} = require('../controllers/election.controller');
const { auth, adminOnly } = require('../middleware/auth');

// Public / authenticated routes
router.get('/', auth, getAllElections);
router.get('/:id', auth, getElectionById);

// Admin-only
router.post('/', auth, adminOnly, createElection);
router.put('/:id', auth, adminOnly, updateElection);
router.delete('/:id', auth, adminOnly, deleteElection);
router.get('/:id/results', auth, adminOnly, getResults);

module.exports = router;
