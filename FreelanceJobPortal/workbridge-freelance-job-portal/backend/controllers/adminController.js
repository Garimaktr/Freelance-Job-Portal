const pool = require('../config/db');
const User = require('../models/userModel');
const Job = require('../models/jobModel');
const Proposal = require('../models/proposalModel');
const Payment = require('../models/paymentModel');
const asyncHandler = require('../utils/asyncHandler');

exports.dashboard = asyncHandler(async (_req, res) => {
  const [[users]] = await pool.query('SELECT COUNT(*) AS total, SUM(role = \'freelancer\') AS freelancers, SUM(role = \'client\') AS clients FROM users');
  const [[jobs]] = await pool.query('SELECT COUNT(*) AS total, SUM(status = \'open\') AS open FROM jobs');
  const [[registrations]] = await pool.query(`SELECT COUNT(*) AS total FROM users WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`);
  res.json({
    totals: { users: users.total, freelancers: users.freelancers || 0, clients: users.clients || 0, jobs: jobs.total, openJobs: jobs.open || 0, proposals: await Proposal.count(), payments: await Payment.count(), registrationsLast30Days: registrations.total },
    jobsByCategory: await Job.categoryStats()
  });
});
exports.users = asyncHandler(async (_req, res) => res.json({ users: await User.list() }));
exports.setUserActive = asyncHandler(async (req, res) => {
  if (Number(req.params.id) === req.user.id) { const error = new Error('You cannot disable your own account.'); error.statusCode = 400; throw error; }
  const user = await User.setActive(req.params.id, req.body.is_active);
  if (!user) { const error = new Error('User not found.'); error.statusCode = 404; throw error; }
  res.json({ message: 'User status updated.', user });
});
exports.allJobs = asyncHandler(async (_req, res) => {
  const [jobs] = await pool.query(`SELECT j.*, c.name AS category_name, u.name AS client_name FROM jobs j JOIN categories c ON c.id = j.category_id JOIN users u ON u.id = j.client_id ORDER BY j.created_at DESC`);
  res.json({ jobs });
});

