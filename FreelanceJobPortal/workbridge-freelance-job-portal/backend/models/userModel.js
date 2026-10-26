const pool = require('../config/db');

const publicFields = `u.id, u.name, u.email, u.role, u.bio, u.skills, u.portfolio_url,
  u.profile_photo_url, u.created_at, u.is_active`;

const User = {
  async findByEmail(email) {
    const [rows] = await pool.query(`SELECT ${publicFields}, u.password_hash FROM users u WHERE u.email = ?`, [email]);
    return rows[0];
  },
  async findById(id) {
    const [rows] = await pool.query(`SELECT ${publicFields} FROM users u WHERE u.id = ?`, [id]);
    return rows[0];
  },
  async create({ name, email, passwordHash, role }) {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, role]
    );
    if (role === 'freelancer') await pool.query('INSERT INTO freelancer_profiles (user_id) VALUES (?)', [result.insertId]);
    return this.findById(result.insertId);
  },
  async updateProfile(id, fields) {
    const allowed = ['name', 'bio', 'skills', 'portfolio_url', 'profile_photo_url'];
    const entries = Object.entries(fields).filter(([key, value]) => allowed.includes(key) && value !== undefined);
    if (!entries.length) return this.findById(id);
    const sql = `UPDATE users SET ${entries.map(([key]) => `${key} = ?`).join(', ')} WHERE id = ?`;
    await pool.query(sql, [...entries.map(([, value]) => value), id]);
    return this.findById(id);
  },
  async list() {
    const [rows] = await pool.query(`SELECT ${publicFields} FROM users u ORDER BY u.created_at DESC`);
    return rows;
  },
  async setActive(id, isActive) {
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [isActive, id]);
    return this.findById(id);
  }
};

module.exports = User;

