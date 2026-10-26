-- WorkBridge MySQL 8+ schema. Import this file before running `npm run seed` in backend/.
CREATE DATABASE IF NOT EXISTS workbridge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE workbridge;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('freelancer', 'client', 'admin') NOT NULL DEFAULT 'freelancer',
  bio TEXT NULL,
  skills VARCHAR(500) NULL,
  portfolio_url VARCHAR(500) NULL,
  profile_photo_url VARCHAR(500) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_created_at (created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS freelancer_profiles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  hourly_rate DECIMAL(10,2) NULL,
  availability ENUM('available', 'busy', 'unavailable') NOT NULL DEFAULT 'available',
  total_earnings DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(120) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS jobs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  client_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  budget_min DECIMAL(10,2) NOT NULL,
  budget_max DECIMAL(10,2) NOT NULL,
  skills VARCHAR(500) NOT NULL,
  experience_level ENUM('entry', 'intermediate', 'expert') NOT NULL DEFAULT 'intermediate',
  status ENUM('open', 'in_progress', 'completed', 'closed') NOT NULL DEFAULT 'open',
  deadline DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_job_client FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_job_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  CONSTRAINT chk_job_budget CHECK (budget_max >= budget_min),
  INDEX idx_jobs_status_created (status, created_at),
  INDEX idx_jobs_category (category_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS proposals (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  job_id INT UNSIGNED NOT NULL,
  freelancer_id INT UNSIGNED NOT NULL,
  bid_amount DECIMAL(10,2) NOT NULL,
  cover_letter TEXT NOT NULL,
  delivery_days SMALLINT UNSIGNED NOT NULL,
  status ENUM('pending', 'accepted', 'rejected', 'withdrawn') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_proposal_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  CONSTRAINT fk_proposal_freelancer FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT uq_proposal_one_per_job UNIQUE (job_id, freelancer_id),
  INDEX idx_proposals_freelancer (freelancer_id),
  INDEX idx_proposals_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  job_id INT UNSIGNED NOT NULL,
  client_id INT UNSIGNED NOT NULL,
  freelancer_id INT UNSIGNED NOT NULL,
  proposal_id INT UNSIGNED NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'escrow_held', 'released') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  released_at TIMESTAMP NULL,
  CONSTRAINT fk_payment_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE RESTRICT,
  CONSTRAINT fk_payment_client FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_payment_freelancer FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_payment_proposal FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE RESTRICT,
  INDEX idx_payments_status (status)
) ENGINE=InnoDB;

INSERT INTO categories (name, slug, description) VALUES
  ('Web Development', 'web-development', 'Frontend, backend, and full-stack development'),
  ('Design', 'design', 'UI/UX, branding, illustration, and visual design'),
  ('Writing', 'writing', 'Copywriting, technical writing, and editing'),
  ('Marketing', 'marketing', 'SEO, social media, growth, and campaigns')
ON DUPLICATE KEY UPDATE description = VALUES(description);

