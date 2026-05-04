const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');

// ✅ Helper to compute election status (NO mutation)
const syncStatus = (election) => {
  const now = Date.now();
  const start = new Date(election.startTime).getTime();
  const end = new Date(election.endTime).getTime();

  let status;

  if (isNaN(start) || isNaN(end)) status = 'invalid';
  else if (now < start) status = 'upcoming';
  else if (now <= end) status = 'active';
  else status = 'ended';

  return {
    ...election.toJSON(),
    status
  };
};

// ✅ Get all elections
exports.getAllElections = async (req, res) => {
  try {
    let elections = await Election.find()
      .populate('createdBy', 'name email empId')
      .sort({ createdAt: -1 });

    // Compute status (no DB update)
    const electionsWithCounts = await Promise.all(
      elections.map(async (el) => {
        const computed = syncStatus(el);
        const candidateCount = await Candidate.countDocuments({ electionId: el._id });

        return { ...computed, candidateCount };
      })
    );

    res.json({ success: true, elections: electionsWithCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get single election
exports.getElectionById = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id)
      .populate('createdBy', 'name email empId');

    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    const computed = syncStatus(election);
    const candidateCount = await Candidate.countDocuments({ electionId: election._id });

    res.json({
      success: true,
      election: { ...computed, candidateCount }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Create election (FIXED DATE ISSUE)
exports.createElection = async (req, res) => {
  try {
    const { title, description, startTime, endTime } = req.body;

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    const election = new Election({
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      createdBy: req.user._id,
    });

    await election.save();

    const computed = syncStatus(election);

    res.status(201).json({
      success: true,
      message: 'Election created successfully',
      election: computed
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update election
exports.updateElection = async (req, res) => {
  try {
    const { title, description, startTime, endTime } = req.body;

    let updateData = { title, description };

    if (startTime) updateData.startTime = new Date(startTime);
    if (endTime) updateData.endTime = new Date(endTime);

    if (updateData.startTime && updateData.endTime) {
      if (updateData.startTime >= updateData.endTime) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time'
        });
      }
    }

    const election = await Election.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    const computed = syncStatus(election);

    res.json({
      success: true,
      message: 'Election updated successfully',
      election: computed
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete election
exports.deleteElection = async (req, res) => {
  try {
    const election = await Election.findByIdAndDelete(req.params.id);

    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    await Candidate.deleteMany({ electionId: req.params.id });
    await Vote.deleteMany({ electionId: req.params.id });

    res.json({
      success: true,
      message: 'Election and all related data deleted successfully'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get results
exports.getResults = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    const candidates = await Candidate.find({ electionId: req.params.id })
      .sort({ voteCount: -1 });

    const totalVotes = await Vote.countDocuments({ electionId: req.params.id });

    const results = candidates.map((c, index) => ({
      ...c.toJSON(),
      rank: index + 1,
      percentage: totalVotes > 0
        ? ((c.voteCount / totalVotes) * 100).toFixed(1)
        : '0.0',
    }));

    const winner = results[0] || null;

    res.json({
      success: true,
      election: syncStatus(election), // ✅ status included
      results,
      totalVotes,
      winner
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};