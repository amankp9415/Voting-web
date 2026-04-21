const Vote = require('../models/Vote');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');

exports.castVote = async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;
    const userId = req.user._id;

    // Validate election
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ success: false, message: 'Election not found' });

    const now = new Date();
    if (now < new Date(election.startTime)) {
      return res.status(400).json({ success: false, message: 'Election has not started yet' });
    }
    if (now > new Date(election.endTime)) {
      return res.status(400).json({ success: false, message: 'Election has ended' });
    }

    // Validate candidate belongs to this election
    const candidate = await Candidate.findOne({ _id: candidateId, electionId });
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found in this election' });
    }

    // Check if user already voted in this election
    const existingVote = await Vote.findOne({ userId, electionId });
    if (existingVote) {
      return res.status(400).json({ success: false, message: 'You have already voted in this election' });
    }

    // Check minimum candidates (at least 2 must exist)
    const candidateCount = await Candidate.countDocuments({ electionId });
    if (candidateCount < 2) {
      return res.status(400).json({ success: false, message: 'Election must have at least 2 candidates' });
    }

    // Cast vote
    const vote = new Vote({ userId, electionId, candidateId });
    await vote.save();

    // Increment candidate vote count and election total votes
    await Candidate.findByIdAndUpdate(candidateId, { $inc: { voteCount: 1 } });
    await Election.findByIdAndUpdate(electionId, { $inc: { totalVotes: 1 } });

    res.status(201).json({ success: true, message: 'Vote cast successfully!' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already voted in this election' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyVotes = async (req, res) => {
  try {
    const votes = await Vote.find({ userId: req.user._id })
      .populate('electionId', 'title startTime endTime status')
      .populate('candidateId', 'name party image')
      .sort({ votedAt: -1 });

    res.json({ success: true, votes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.checkVoteStatus = async (req, res) => {
  try {
    const vote = await Vote.findOne({ userId: req.user._id, electionId: req.params.electionId });
    res.json({ success: true, hasVoted: !!vote, vote });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
