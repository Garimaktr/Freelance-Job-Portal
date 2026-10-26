const pool = require('../config/db');

const paymentSelect = `SELECT pay.*, j.title AS job_title, client.name AS client_name, freelancer.name AS freelancer_name
  FROM payments pay JOIN jobs j ON j.id = pay.job_id JOIN users client ON client.id = pay.client_id
  JOIN users freelancer ON freelancer.id = pay.freelancer_id`;

module.exports = {
  async create(clientId, data) {
    const [result] = await pool.query('INSERT INTO payments (job_id, client_id, freelancer_id, proposal_id, amount, status) VALUES (?, ?, ?, ?, ?, \'pending\')',
      [data.job_id, clientId, data.freelancer_id, data.proposal_id, data.amount]);
    return this.findById(result.insertId);
  },
  async findById(id) { const [rows] = await pool.query(`${paymentSelect} WHERE pay.id = ?`, [id]); return rows[0]; },
  async listForUser(user) {
    const where = user.role === 'admin' ? '' : ' WHERE pay.client_id = ? OR pay.freelancer_id = ?';
    const values = user.role === 'admin' ? [] : [user.id, user.id];
    const [rows] = await pool.query(`${paymentSelect}${where} ORDER BY pay.created_at DESC`, values);
    return rows;
  },
  async setStatus(id, status) {
    await pool.query('UPDATE payments SET status = ?, released_at = CASE WHEN ? = \'released\' THEN CURRENT_TIMESTAMP ELSE released_at END WHERE id = ?', [status, status, id]);
    return this.findById(id);
  },
  async count() { const [[row]] = await pool.query('SELECT COUNT(*) AS total FROM payments'); return row.total; }
};
