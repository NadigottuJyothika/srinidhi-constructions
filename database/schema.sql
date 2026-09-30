CREATE DATABASE IF NOT EXISTS srinidhi_constructions CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE srinidhi_constructions;

CREATE TABLE admins (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS customers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  phone VARCHAR(40) NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customers_created_at (created_at)
);
CREATE TABLE projects (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  location VARCHAR(160) NOT NULL,
  category ENUM('Residential','Commercial','Renovation','Planning') NOT NULL,
  status ENUM('Planned','In progress','Completed') NOT NULL DEFAULT 'Planned',
  cover_image VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_projects_category (category), INDEX idx_projects_status (status)
);
CREATE TABLE project_images (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id INT UNSIGNED NOT NULL,
  image_path VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255) NOT NULL,
  sort_order SMALLINT UNSIGNED DEFAULT 0,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
CREATE TABLE services (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  sort_order SMALLINT UNSIGNED DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE enquiries (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(40),
  subject VARCHAR(180),
  message TEXT NOT NULL,
  status ENUM('New','In progress','Closed') NOT NULL DEFAULT 'New',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_enquiries_status (status)
);
INSERT INTO services (title, description, sort_order) VALUES
('Residential construction','Homes shaped around the way you live, with considered materials and an honest build process.',1),
('Commercial spaces','Workplaces and retail environments that balance operational clarity with a memorable point of view.',2),
('Design & planning','From first sketch to approvals, we turn a clear brief into a buildable plan.',3),
('Renovation & restoration','New life for existing structures, retaining their character while making them work harder.',4);
INSERT INTO projects (title,slug,description,location,category,status,cover_image) VALUES
('The Courtyard House','the-courtyard-house','A home shaped by natural light, honest materials, and the rhythms of everyday life.','Whitefield, Bengaluru','Residential','Completed','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85'),
('Nirvana Workspace','nirvana-workspace','A calm, adaptable workplace for a growing creative team.','Indiranagar, Bengaluru','Commercial','Completed','https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85');
