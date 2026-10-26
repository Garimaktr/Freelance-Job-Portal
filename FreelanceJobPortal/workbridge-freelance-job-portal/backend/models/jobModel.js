const pool = require('../config/db');

const jobSelect = `SELECT j.*, c.name AS category_name, u.name AS client_name,
  (SELECT COUNT(*) FROM proposals p WHERE p.job_id = j.id) AS proposal_count
  FROM jobs j JOIN categories c ON c.id = j.category_id JOIN users u ON u.id = j.client_id`;

const Job = {
  async list(filters = {}) {
    const where = ['j.status = \'open\''];
    const values = [];
    if (filters.search) {
      where.push('(j.title LIKE ? OR j.skills LIKE ? OR c.name LIKE ?)');
      const term = `%${filters.search}%`;
      values.push(term, term, term);
    }
    if (filters.category) { where.push('j.category_id = ?'); values.push(filters.category); }
    if (filters.experience) { where.push('j.experience_level = ?'); values.push(filters.experience); }
    if (filters.minBudget) { where.push('j.budget_max >= ?'); values.push(filters.minBudget); }
    if (filters.maxBudget) { where.push('j.budget_min <= ?'); values.push(filters.maxBudget); }
    const [rows] = await pool.query(`${jobSelect} WHERE ${where.join(' AND ')} ORDER BY j.created_at DESC`, values);
    return rows;
  },
  async featured(limit = 6) {
    const [rows] = await pool.query(`${jobSelect} WHERE j.status = 'open' ORDER BY j.created_at DESC LIMIT ?`, [Number(limit)]);
    return rows;
  },
  async findById(id) {
    const [rows] = await pool.query(`${jobSelect} WHERE j.id = ?`, [id]);
    return rows[0];
  },
  async create(clientId, data) {
    const { title, description, category_id, budget_min, budget_max, skills, experience_level, deadline } = data;
    const [result] = await pool.query(
      `INSERT INTO jobs (client_id, category_id, title, description, budget_min, budget_max, skills, experience_level, deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [clientId, category_id, title, description, budget_min, budget_max, skills, experience_level, deadline || null]
    );
    return this.findById(result.insertId);
  },
  async update(id, data) {
    const allowed = ['title', 'description', 'category_id', 'budget_min', 'budget_max', 'skills', 'experience_level', 'deadline', 'status'];
    const entries = Object.entries(data).filter(([key, value]) => allowed.includes(key) && value !== undefined);
    if (!entries.length) return this.findById(id);
    await pool.query(`UPDATE jobs SET ${entries.map(([key]) => `${key} = ?`).join(', ')} WHERE id = ?`, [...entries.map(([, value]) => value), id]);
    return this.findById(id);
  },
  async remove(id) {
    await pool.query('DELETE FROM jobs WHERE id = ?', [id]);
  },
  async byClient(clientId) {
    const [rows] = await pool.query(`${jobSelect} WHERE j.client_id = ? ORDER BY j.created_at DESC`, [clientId]);
    return rows;
  },
  async categoryStats() {
    const [rows] = await pool.query(`SELECT c.name, COUNT(j.id) AS count FROM categories c LEFT JOIN jobs j ON j.category_id = c.id GROUP BY c.id ORDER BY count DESC`);
    return rows;
  }
};

module.exports = Job;

