const pool = require('../config/db');

module.exports = {
  async all() {
    const [rows] = await pool.query('SELECT id, name, slug, description FROM categories ORDER BY name');
    return rows;
  },
  async findById(id) {
    const [rows] = await pool.query('SELECT id, name, slug FROM categories WHERE id = ?', [id]);
    return rows[0];
  }
};

