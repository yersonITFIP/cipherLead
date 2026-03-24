-- Migracion idempotente para iconos en materias
-- 1) Agrega columna icon si no existe
ALTER TABLE subjects
ADD COLUMN IF NOT EXISTS icon VARCHAR(50) NOT NULL DEFAULT 'Book' AFTER description_encrypted;

-- 2) Normaliza datos previos nulos/vacios para evitar fallback inconsistentes
UPDATE subjects
SET icon = 'Book'
WHERE icon IS NULL OR TRIM(icon) = '';
