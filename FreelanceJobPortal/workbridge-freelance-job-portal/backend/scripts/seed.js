require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const seed = async () => {
  const passwordHash = await bcrypt.hash('Password123!', 12);
  const users = [
    ['Aisha Client', 'client@workbridge.dev', 'client'],
    ['Rohan Freelancer', 'freelancer@workbridge.dev', 'freelancer'],
    ['WorkBridge Admin', 'admin@workbridge.dev', 'admin']
  ];
  for (const [name, email, role] of users) {
    await pool.query('INSERT INTO users (name, email, password_hash, role, bio, skills, portfolio_url) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)', [
      name, email, passwordHash, role,
      role === 'freelancer' ? 'Product-minded full-stack developer focused on thoughtful web experiences.' : 'A demo account for the WorkBridge portfolio project.',
      role === 'freelancer' ? 'React, Node.js, MySQL, UI/UX' : null,
      role === 'freelancer' ? 'https://github.com/' : null
    ]);
  }
  const [[client]] = await pool.query("SELECT id FROM users WHERE email = 'client@workbridge.dev'");
  const [[freelancer]] = await pool.query("SELECT id FROM users WHERE email = 'freelancer@workbridge.dev'");
  const [[web]] = await pool.query("SELECT id FROM categories WHERE slug = 'web-development'");
  const [[design]] = await pool.query("SELECT id FROM categories WHERE slug = 'design'");
  const [existing] = await pool.query('SELECT id FROM jobs LIMIT 1');
  if (!existing.length) {
    const [first] = await pool.query('INSERT INTO jobs (client_id, category_id, title, description, budget_min, budget_max, skills, experience_level, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(CURDATE(), INTERVAL 21 DAY))', [client.id, web.id, 'Build a polished SaaS landing page', 'Create a fast, accessible, responsive landing page from a Figma file. The finished page needs clean React components, responsive behavior, and careful performance work.', 800, 1400, 'React, Bootstrap, CSS, Accessibility', 'intermediate']);
    await pool.query('INSERT INTO jobs (client_id, category_id, title, description, budget_min, budget_max, skills, experience_level, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(CURDATE(), INTERVAL 30 DAY))', [client.id, design.id, 'Refresh our mobile app design system', 'We need a visual designer to expand an existing mobile design system with reusable components, documented patterns, and developer-ready handoff notes.', 600, 1000, 'Figma, UI/UX, Design Systems', 'expert']);
    await pool.query('INSERT INTO proposals (job_id, freelancer_id, bid_amount, cover_letter, delivery_days) VALUES (?, ?, ?, ?, ?)', [first.insertId, freelancer.id, 1100, 'I build conversion-focused React interfaces with a strong accessibility and performance baseline. I can turn your design into a maintainable component system and keep you updated throughout delivery.', 12]);
  }
  console.log('Seed complete. Demo password for all accounts: Password123!');
  await pool.end();
};

seed().catch(async (error) => { console.error(error); await pool.end(); process.exit(1); });

