-- Tabla para almacenar contraseñas cifradas por usuario
CREATE TABLE IF NOT EXISTS password_entries (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  title_encrypted TEXT NOT NULL,
  username_encrypted TEXT NOT NULL,
  password_encrypted TEXT NOT NULL,
  url_encrypted TEXT NULL,
  notes_encrypted LONGTEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_password_entries_user_id (user_id),
  INDEX idx_password_entries_user_updated (user_id, updated_at),
  CONSTRAINT fk_password_entries_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
