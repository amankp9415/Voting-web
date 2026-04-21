const express = require('express');
const router = express.Router();
const { castVote, getMyVotes, checkVoteStatus } = require('../controllers/vote.controller');
const { auth, userOnly } = require('../middleware/auth');

router.post('/', auth, userOnly, castVote);
router.get('/my', auth, userOnly, getMyVotes);
router.get('/status/:electionId', auth, userOnly, checkVoteStatus);

module.exports = router;
