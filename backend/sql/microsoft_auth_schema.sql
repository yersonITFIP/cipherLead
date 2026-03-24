-- Traditional auth + TOTP 2FA schema for MySQL
-- Safe to run multiple times.

CREATE DATABASE IF NOT EXISTS diario
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE diario;

-- App users table.
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NULL,
  display_name VARCHAR(150) NULL,
  given_name VARCHAR(100) NULL,
  family_name VARCHAR(100) NULL,
  avatar_url VARCHAR(500) NULL,
  locale VARCHAR(20) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- App sessions after successful login.
CREATE TABLE IF NOT EXISTS user_sessions (
  id CHAR(36) NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_user_sessions_user_id (user_id),
  KEY idx_user_sessions_expires (expires_at),
  CONSTRAINT fk_user_sessions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- TOTP 2FA credentials for 6-digit authenticator apps.
CREATE TABLE IF NOT EXISTS user_totp (
  user_id BIGINT UNSIGNED NOT NULL,
  secret VARCHAR(128) NULL,
  pending_secret VARCHAR(128) NULL,
  is_enabled TINYINT(1) NOT NULL DEFAULT 0,
  enabled_at DATETIME NULL,
  last_used_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_user_totp_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Optional audit table for security visibility.
CREATE TABLE IF NOT EXISTS login_audit (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL,
  provider VARCHAR(50) NOT NULL DEFAULT 'local',
  provider_user_id VARCHAR(100) NULL,
  status VARCHAR(20) NOT NULL,
  error_message VARCHAR(500) NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_login_audit_user_id (user_id),
  KEY idx_login_audit_created_at (created_at),
  CONSTRAINT fk_login_audit_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB;
