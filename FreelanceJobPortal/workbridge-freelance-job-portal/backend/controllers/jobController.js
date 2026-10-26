const Job = require('../models/jobModel');
const Proposal = require('../models/proposalModel');
const Category = require('../models/categoryModel');
const asyncHandler = require('../utils/asyncHandler');

const canManage = (job, user) => user.role === 'admin' || job.client_id === user.id;

exports.listJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.list(req.query);
  res.json({ jobs });
});
exports.featured = asyncHandler(async (req, res) => res.json({ jobs: await Job.featured(req.query.limit) }));
exports.categories = asyncHandler(async (_req, res) => res.json({ categories: await Category.all() }));
exports.getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) { const error = new Error('Job not found.'); error.statusCode = 404; throw error; }
  res.json({ job });
});
exports.createJob = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.body.category_id);
  if (!category) { const error = new Error('Select a valid category.'); error.statusCode = 422; throw error; }
  const job = await Job.create(req.user.id, req.body);
  res.status(201).json({ message: 'Job posted successfully.', job });
});
exports.updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) { const error = new Error('Job not found.'); error.statusCode = 404; throw error; }
  if (!canManage(job, req.user)) { const error = new Error('Only the job owner can edit it.'); error.statusCode = 403; throw error; }
  const updated = await Job.update(job.id, req.body);
  res.json({ message: 'Job updated.', job: updated });
});
exports.deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) { const error = new Error('Job not found.'); error.statusCode = 404; throw error; }
  if (!canManage(job, req.user)) { const error = new Error('Only the job owner can delete it.'); error.statusCode = 403; throw error; }
  await Job.remove(job.id);
  res.json({ message: 'Job deleted.' });
});
exports.clientJobs = asyncHandler(async (req, res) => res.json({ jobs: await Job.byClient(req.user.id) }));
exports.getJobProposals = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) { const error = new Error('Job not found.'); error.statusCode = 404; throw error; }
  if (!canManage(job, req.user)) { const error = new Error('Only the job owner can view proposals.'); error.statusCode = 403; throw error; }
  res.json({ proposals: await Proposal.forJob(job.id) });
});
exports.createProposal = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job || job.status !== 'open') { const error = new Error('This job is not open for proposals.'); error.statusCode = 400; throw error; }
  const proposal = await Proposal.create(req.user.id, { ...req.body, job_id: job.id });
  res.status(201).json({ message: 'Proposal sent.', proposal });
});

