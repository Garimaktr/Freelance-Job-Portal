const Proposal = require('../models/proposalModel');
const Job = require('../models/jobModel');
const asyncHandler = require('../utils/asyncHandler');

exports.myProposals = asyncHandler(async (req, res) => res.json({ proposals: await Proposal.forFreelancer(req.user.id) }));
exports.updateProposal = asyncHandler(async (req, res) => {
  const proposal = await Proposal.findById(req.params.id);
  if (!proposal) { const error = new Error('Proposal not found.'); error.statusCode = 404; throw error; }
  if (proposal.freelancer_id !== req.user.id || proposal.status !== 'pending') { const error = new Error('Only your pending proposal can be edited.'); error.statusCode = 403; throw error; }
  res.json({ message: 'Proposal updated.', proposal: await Proposal.update(proposal.id, req.body) });
});
exports.deleteProposal = asyncHandler(async (req, res) => {
  const proposal = await Proposal.findById(req.params.id);
  if (!proposal) { const error = new Error('Proposal not found.'); error.statusCode = 404; throw error; }
  if (proposal.freelancer_id !== req.user.id || proposal.status !== 'pending') { const error = new Error('Only your pending proposal can be withdrawn.'); error.statusCode = 403; throw error; }
  await Proposal.remove(proposal.id);
  res.json({ message: 'Proposal withdrawn.' });
});
exports.setStatus = asyncHandler(async (req, res) => {
  const proposal = await Proposal.findById(req.params.id);
  if (!proposal) { const error = new Error('Proposal not found.'); error.statusCode = 404; throw error; }
  if (proposal.client_id !== req.user.id && req.user.role !== 'admin') { const error = new Error('Only the job owner can change a proposal status.'); error.statusCode = 403; throw error; }
  const { status } = req.body;
  const updated = await Proposal.setStatus(proposal.id, status);
  if (status === 'accepted') {
    await Job.update(proposal.job_id, { status: 'in_progress' });
    const proposals = await Proposal.forJob(proposal.job_id);
    await Promise.all(proposals.filter((item) => item.id !== proposal.id && item.status === 'pending').map((item) => Proposal.setStatus(item.id, 'rejected')));
  }
  res.json({ message: `Proposal ${status}.`, proposal: updated });
});

