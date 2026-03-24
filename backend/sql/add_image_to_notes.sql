-- Migracion idempotente para habilitar imagen en notas
ALTER TABLE notes
ADD COLUMN IF NOT EXISTS image_encrypted LONGTEXT NULL AFTER content_encrypted;

