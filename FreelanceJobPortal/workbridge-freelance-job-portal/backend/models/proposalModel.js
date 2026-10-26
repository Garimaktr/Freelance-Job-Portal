const pool = require('../config/db');

const proposalSelect = `SELECT p.*, j.title AS job_title, j.client_id, j.status AS job_status,
  u.name AS freelancer_name, u.skills AS freelancer_skills, u.portfolio_url
  FROM proposals p JOIN jobs j ON j.id = p.job_id JOIN users u ON u.id = p.freelancer_id`;

const Proposal = {
  async create(freelancerId, data) {
    const [result] = await pool.query('INSERT INTO proposals (job_id, freelancer_id, bid_amount, cover_letter, delivery_days) VALUES (?, ?, ?, ?, ?)',
      [data.job_id, freelancerId, data.bid_amount, data.cover_letter, data.delivery_days]);
    return this.findById(result.insertId);
  },
  async findById(id) {
    const [rows] = await pool.query(`${proposalSelect} WHERE p.id = ?`, [id]);
    return rows[0];
  },
  async forJob(jobId) {
    const [rows] = await pool.query(`${proposalSelect} WHERE p.job_id = ? ORDER BY p.created_at DESC`, [jobId]);
    return rows;
  },
  async forFreelancer(id) {
    const [rows] = await pool.query(`${proposalSelect} WHERE p.freelancer_id = ? ORDER BY p.created_at DESC`, [id]);
    return rows;
  },
  async update(id, data) {
    const allowed = ['bid_amount', 'cover_letter', 'delivery_days'];
    const entries = Object.entries(data).filter(([key, value]) => allowed.includes(key) && value !== undefined);
    if (entries.length) await pool.query(`UPDATE proposals SET ${entries.map(([key]) => `${key} = ?`).join(', ')} WHERE id = ?`, [...entries.map(([, value]) => value), id]);
    return this.findById(id);
  },
  async setStatus(id, status) {
    await pool.query('UPDATE proposals SET status = ? WHERE id = ?', [status, id]);
    return this.findById(id);
  },
  async remove(id) { await pool.query('DELETE FROM proposals WHERE id = ?', [id]); },
  async count() { const [[row]] = await pool.query('SELECT COUNT(*) AS total FROM proposals'); return row.total; }
};

module.exports = Proposal;

