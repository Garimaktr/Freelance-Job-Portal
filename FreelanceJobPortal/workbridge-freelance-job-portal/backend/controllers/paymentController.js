const Payment = require('../models/paymentModel');
const Job = require('../models/jobModel');
const Proposal = require('../models/proposalModel');
const asyncHandler = require('../utils/asyncHandler');

exports.listPayments = asyncHandler(async (req, res) => res.json({ payments: await Payment.listForUser(req.user) }));
exports.createPayment = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.body.job_id);
  const proposal = await Proposal.findById(req.body.proposal_id);
  if (!job || !proposal || job.client_id !== req.user.id || proposal.status !== 'accepted' || proposal.job_id !== job.id) {
    const error = new Error('An accepted proposal on your job is required to create escrow.'); error.statusCode = 400; throw error;
  }
  const payment = await Payment.create(req.user.id, { ...req.body, freelancer_id: proposal.freelancer_id });
  res.status(201).json({ message: 'Simulated escrow record created. Fund it to hold payment.', payment });
});
exports.updateStatus = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) { const error = new Error('Payment not found.'); error.statusCode = 404; throw error; }
  const { status } = req.body;
  const isAdmin = req.user.role === 'admin';
  const isClient = payment.client_id === req.user.id;
  const valid = ['pending', 'escrow_held', 'released'];
  if (!valid.includes(status) || (!isAdmin && !isClient)) { const error = new Error('You cannot make this payment change.'); error.statusCode = 403; throw error; }
  if (!isAdmin && !((payment.status === 'pending' && status === 'escrow_held') || (payment.status === 'escrow_held' && status === 'released'))) {
    const error = new Error('Payments move from Pending → Escrow Held → Released.'); error.statusCode = 400; throw error;
  }
  res.json({ message: `Payment marked ${status.replace('_', ' ')}.`, payment: await Payment.setStatus(payment.id, status) });
});

