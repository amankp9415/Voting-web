const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');

// Helper to sync election status
const syncStatus = (election) => {
  const now = new Date();
  if (now < new Date(election.startTime)) election.status = 'upcoming';
  else if (now >= new Date(election.startTime) && now <= new Date(election.endTime)) election.status = 'active';
  else election.status = 'ended';
  return election;
};

exports.getAllElections = async (req, res) => {
  try {
    let elections = await Election.find().populate('createdBy', 'name email empId').sort({ createdAt: -1 });

    // Update statuses dynamically
    for (let el of elections) {
      const computed = syncStatus(el);
      if (el.status !== computed.status) {
        await Election.findByIdAndUpdate(el._id, { status: el.status });
      }
    }

    // Re-fetch with candidate counts
    const electionsWithCounts = await Promise.all(
      elections.map(async (el) => {
        const candidateCount = await Candidate.countDocuments({ electionId: el._id });
        return { ...el.toJSON(), candidateCount };
      })
    );

    res.json({ success: true, elections: electionsWithCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getElectionById = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id).populate('createdBy', 'name email empId');
    if (!election) return res.status(404).json({ success: false, message: 'Election not found' });

    syncStatus(election);
    const candidateCount = await Candidate.countDocuments({ electionId: election._id });
    res.json({ success: true, election: { ...election.toJSON(), candidateCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createElection = async (req, res) => {
  try {
    const { title, description, startTime, endTime } = req.body;

    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ success: false, message: 'End time must be after start time' });
    }

    const election = new Election({
      title,
      description,
      startTime,
      endTime,
      createdBy: req.user._id,
    });
    syncStatus(election);
    await election.save();

    res.status(201).json({ success: true, message: 'Election created successfully', election });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateElection = async (req, res) => {
  try {
    const { title, description, startTime, endTime } = req.body;

    if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ success: false, message: 'End time must be after start time' });
    }

    const election = await Election.findByIdAndUpdate(
      req.params.id,
      { title, description, startTime, endTime },
      { new: true }
    );
    if (!election) return res.status(404).json({ success: false, message: 'Election not found' });

    syncStatus(election);
    await election.save();

    res.json({ success: true, message: 'Election updated successfully', election });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteElection = async (req, res) => {
  try {
    const election = await Election.findByIdAndDelete(req.params.id);
    if (!election) return res.status(404).json({ success: false, message: 'Election not found' });

    // Cascade delete candidates and votes
    await Candidate.deleteMany({ electionId: req.params.id });
    await Vote.deleteMany({ electionId: req.params.id });

    res.json({ success: true, message: 'Election and all related data deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Results (Admin only)
exports.getResults = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ success: false, message: 'Election not found' });

    const candidates = await Candidate.find({ electionId: req.params.id }).sort({ voteCount: -1 });
    const totalVotes = await Vote.countDocuments({ electionId: req.params.id });

    const results = candidates.map((c, index) => ({
      ...c.toJSON(),
      rank: index + 1,
      percentage: totalVotes > 0 ? ((c.voteCount / totalVotes) * 100).toFixed(1) : '0.0',
    }));

    const winner = results[0] || null;

    res.json({ success: true, election, results, totalVotes, winner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
