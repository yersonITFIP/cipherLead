const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const otplib = require('otplib');
const QRCode = require('qrcode');
require('dotenv').config();

const app = express();

const PORT = Number(process.env.PORT || 3001);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';
const PASSWORD_SALT_ROUNDS = Number(process.env.PASSWORD_SALT_ROUNDS || 12);
const TWO_FACTOR_CHALLENGE_EXPIRES_IN = process.env.TWO_FACTOR_CHALLENGE_EXPIRES_IN || '5m';
const TOTP_ISSUER = process.env.TOTP_ISSUER || 'Diario App';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const MAX_NOTE_IMAGE_BYTES = Number(process.env.MAX_NOTE_IMAGE_BYTES || 2 * 1024 * 1024);
const ALLOWED_NOTE_IMAGE_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json({ limit: '5mb' }));

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'diario',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function ensureColumnExists(tableName, columnName, definition) {
  const [rows] = await db.execute(
    `SELECT COLUMN_NAME
     FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?
     LIMIT 1`,
    [tableName, columnName]
  );

  if (rows.length === 0) {
    await db.execute(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

async function ensureDatabaseSchema() {
  await ensureColumnExists('users', 'password_hash', 'VARCHAR(255) NULL AFTER email');

  await db.execute(
    `CREATE TABLE IF NOT EXISTS user_totp (
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
    ) ENGINE=InnoDB`
  );

  await db.execute(
    `CREATE TABLE IF NOT EXISTS subjects (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id BIGINT UNSIGNED NOT NULL,
      title_encrypted TEXT NOT NULL,
      description_encrypted TEXT NULL,
      icon VARCHAR(50) NOT NULL DEFAULT 'Book',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_user_id (user_id),
      CONSTRAINT fk_subjects_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  );

  await ensureColumnExists('subjects', 'icon', "VARCHAR(50) NOT NULL DEFAULT 'Book' AFTER description_encrypted");

  await db.execute(
    `UPDATE subjects
     SET icon = 'Book'
     WHERE icon IS NULL OR TRIM(icon) = ''`
  );

  await db.execute(
    `CREATE TABLE IF NOT EXISTS notes (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id BIGINT UNSIGNED NOT NULL,
      subject_id BIGINT UNSIGNED NOT NULL,
      title_encrypted TEXT NOT NULL,
      content_encrypted LONGTEXT NOT NULL,
      image_encrypted LONGTEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_user_id (user_id),
      INDEX idx_subject_id (subject_id),
      INDEX idx_user_subject (user_id, subject_id),
      CONSTRAINT fk_notes_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      CONSTRAINT fk_notes_subject
        FOREIGN KEY (subject_id) REFERENCES subjects(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  );

  await ensureColumnExists('notes', 'image_encrypted', 'LONGTEXT NULL AFTER content_encrypted');

  await db.execute(
    `CREATE TABLE IF NOT EXISTS password_entries (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  );
}

function buildUserSnapshot(user) {
  return {
    id: user.id,
    email: user.email,
    display_name: user.display_name || null
  };
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function normalizeOtpCode(code) {
  return String(code || '').replace(/\s+/g, '').replace(/-/g, '');
}

function isSixDigitOtp(code) {
  return /^\d{6}$/.test(code);
}

function normalizeNoteImageDataUrl(imageDataUrl) {
  const raw = String(imageDataUrl || '').trim();
  if (!raw) {
    return '';
  }

  const match = raw.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    throw new Error('Formato de imagen invalido. Usa una imagen en base64 valida.');
  }

  const mimeType = match[1].toLowerCase();
  const base64Payload = match[2];
  if (!ALLOWED_NOTE_IMAGE_MIME_TYPES.has(mimeType)) {
    throw new Error('Tipo de imagen no permitido. Usa PNG, JPG, WEBP o GIF.');
  }

  const estimatedSizeBytes = Math.floor((base64Payload.length * 3) / 4);
  if (estimatedSizeBytes > MAX_NOTE_IMAGE_BYTES) {
    throw new Error('La imagen excede el tamano permitido (maximo 2MB).');
  }

  return `data:${mimeType};base64,${base64Payload}`;
}

function normalizeOptionalEncryptedField(rawValue, maxLength, fieldLabel) {
  const normalized = String(rawValue || '').trim();
  if (!normalized) {
    return '';
  }

  if (normalized.length > maxLength) {
    throw new Error(`${fieldLabel} excede el máximo permitido (${maxLength} caracteres).`);
  }

  return normalized;
}

function normalizeUrlField(rawValue) {
  const normalized = String(rawValue || '').trim();
  if (!normalized) {
    return '';
  }

  let parsed;
  try {
    parsed = new URL(normalized);
  } catch (error) {
    throw new Error('La URL no es válida.');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('La URL debe comenzar con http:// o https://');
  }

  return parsed.toString();
}

function mapPasswordEntryResponse(entry) {
  return {
    id: entry.id,
    title: decrypt(entry.title_encrypted),
    username: decrypt(entry.username_encrypted),
    password: decrypt(entry.password_encrypted),
    url: entry.url_encrypted ? decrypt(entry.url_encrypted) : '',
    notes: entry.notes_encrypted ? decrypt(entry.notes_encrypted) : '',
    created_at: entry.created_at,
    updated_at: entry.updated_at
  };
}

function generateTotpSecret() {
  return otplib.generateSecret({ length: 20 });
}

function buildTotpUri(email, secret) {
  return otplib.generateURI({
    strategy: 'totp',
    issuer: TOTP_ISSUER,
    label: email,
    secret,
    digits: 6,
    period: 30
  });
}

async function verifyTotpCode(secret, token) {
  if (!isSixDigitOtp(token)) {
    return false;
  }

  const result = await otplib.verify({
    strategy: 'totp',
    secret,
    token,
    digits: 6,
    period: 30,
    epochTolerance: 30
  });
  return result === true || (result && result.valid === true);
}

function createSessionToken(user, sessionId) {
  return jwt.sign(
    {
      type: 'session',
      sub: user.id,
      sid: sessionId,
      email: user.email,
      name: user.display_name || user.email
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function createTwoFactorChallengeToken(user) {
  return jwt.sign(
    {
      type: '2fa-pending',
      sub: user.id,
      email: user.email,
      name: user.display_name || user.email
    },
    JWT_SECRET,
    { expiresIn: TWO_FACTOR_CHALLENGE_EXPIRES_IN }
  );
}

async function createSession(userId, req) {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

  await db.execute(
    `INSERT INTO user_sessions (id, user_id, ip_address, user_agent, expires_at)
     VALUES (?, ?, ?, ?, ?)`,
    [
      sessionId,
      userId,
      req.ip || null,
      req.headers['user-agent'] || null,
      expiresAt
    ]
  );

  return sessionId;
}

async function fetchUserByEmail(email) {
  const [rows] = await db.execute(
    `SELECT id, email, password_hash, display_name, given_name, family_name, avatar_url, locale, is_active, last_login_at
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [normalizeEmail(email)]
  );

  return rows[0] || null;
}

async function fetchUserById(userId) {
  const [rows] = await db.execute(
    `SELECT id, email, display_name, given_name, family_name, avatar_url, locale, is_active, last_login_at
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
}

async function touchLastLogin(userId) {
  await db.execute('UPDATE users SET last_login_at = NOW() WHERE id = ?', [userId]);
}

async function getTwoFactorRecord(userId) {
  const [rows] = await db.execute(
    `SELECT user_id, secret, pending_secret, is_enabled, enabled_at, last_used_at
     FROM user_totp
     WHERE user_id = ?
     LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
}

async function isTwoFactorEnabled(userId) {
  const record = await getTwoFactorRecord(userId);
  return Boolean(record && record.is_enabled && record.secret);
}

async function buildAuthenticatedSession(user, req) {
  const sessionId = await createSession(user.id, req);
  const token = createSessionToken(user, sessionId);
  return { token, sessionId };
}

// ========================================
// Encryption/Decryption Functions
// ========================================

function encrypt(text) {
  if (!text) return '';
  
  const iv = crypto.randomBytes(16);
  const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex');
  const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Return IV + encrypted data
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedData) {
  if (!encryptedData) return '';
  
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 2) return '';
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Error al descifrar:', error.message);
    return '';
  }
}

// ========================================
// Auth Middleware
// ========================================

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.type && payload.type !== 'session') {
      return res.status(401).json({ error: 'Token inválido para sesión' });
    }

    const [sessions] = await db.execute(
      `SELECT id
       FROM user_sessions
       WHERE id = ? AND user_id = ? AND revoked_at IS NULL AND expires_at > NOW()
       LIMIT 1`,
      [payload.sid, payload.sub]
    );

    if (sessions.length === 0) {
      return res.status(401).json({ error: 'Sesión inválida o expirada' });
    }

    req.auth = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'No autorizado' });
  }
}

app.post('/auth/register', async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');
  const displayName = String(req.body.displayName || '').trim();

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  }

  const existingUser = await fetchUserByEmail(email);
  if (existingUser) {
    return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
  const [result] = await db.execute(
    `INSERT INTO users (email, password_hash, display_name, is_active)
     VALUES (?, ?, ?, 1)`,
    [email, passwordHash, displayName || email]
  );

  const createdUser = await fetchUserById(result.insertId);
  return res.status(201).json({ ok: true, user: buildUserSnapshot(createdUser) });
});

app.post('/auth/login', async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
  }

  const user = await fetchUserByEmail(email);
  if (!user || !user.password_hash) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  if (!user.is_active) {
    return res.status(403).json({ error: 'Usuario inactivo' });
  }

  if (await isTwoFactorEnabled(user.id)) {
    return res.json({
      requiresTwoFactor: true,
      challengeToken: createTwoFactorChallengeToken(user),
      user: buildUserSnapshot(user)
    });
  }

  await touchLastLogin(user.id);
  const fullUser = await fetchUserById(user.id);
  const { token } = await buildAuthenticatedSession(fullUser, req);
  return res.json({ token, user: buildUserSnapshot(fullUser) });
});

app.post('/auth/2fa/verify', async (req, res) => {
  const code = normalizeOtpCode(req.body.code);
  const challengeToken = typeof req.body.challengeToken === 'string' ? req.body.challengeToken : '';

  if (!challengeToken || !code) {
    return res.status(400).json({ error: 'challengeToken y code son obligatorios' });
  }

  if (!isSixDigitOtp(code)) {
    return res.status(400).json({ error: 'Código 2FA inválido' });
  }

  try {
    const payload = jwt.verify(challengeToken, JWT_SECRET);
    if (payload.type !== '2fa-pending') {
      return res.status(401).json({ error: 'Challenge inválido' });
    }

    const record = await getTwoFactorRecord(payload.sub);
    if (!record || !record.is_enabled || !record.secret) {
      return res.status(400).json({ error: 'El usuario no tiene 2FA habilitado' });
    }

    const valid = await verifyTotpCode(record.secret, code);
    if (!valid) {
      return res.status(400).json({ error: 'Código 2FA inválido' });
    }

    await db.execute('UPDATE user_totp SET last_used_at = NOW() WHERE user_id = ?', [payload.sub]);
    await touchLastLogin(payload.sub);

    const user = await fetchUserById(payload.sub);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { token } = await buildAuthenticatedSession(user, req);
    return res.json({ token, user: buildUserSnapshot(user) });
  } catch (error) {
    return res.status(401).json({ error: 'Challenge expirado o inválido' });
  }
});

app.get('/auth/2fa/status', authMiddleware, async (req, res) => {
  const record = await getTwoFactorRecord(req.auth.sub);
  return res.json({
    enabled: Boolean(record && record.is_enabled && record.secret),
    hasPendingSetup: Boolean(record && record.pending_secret)
  });
});

app.post('/auth/2fa/setup', authMiddleware, async (req, res) => {
  const existingRecord = await getTwoFactorRecord(req.auth.sub);

  if (existingRecord && existingRecord.is_enabled && existingRecord.secret) {
    return res.status(409).json({ error: 'El 2FA ya está activado para este usuario' });
  }

  const secret = generateTotpSecret();
  const user = await fetchUserById(req.auth.sub);
  const otpAuthUrl = buildTotpUri(user.email, secret);
  const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

  await db.execute(
    `INSERT INTO user_totp (user_id, pending_secret, is_enabled)
     VALUES (?, ?, 0)
     ON DUPLICATE KEY UPDATE
      pending_secret = VALUES(pending_secret),
      updated_at = NOW()`,
    [req.auth.sub, secret]
  );

  return res.json({
    manualEntryKey: secret,
    otpAuthUrl,
    qrCodeDataUrl
  });
});

app.post('/auth/2fa/enable', authMiddleware, async (req, res) => {
  const code = normalizeOtpCode(req.body.code);
  if (!code) {
    return res.status(400).json({ error: 'Código 2FA requerido' });
  }

  if (!isSixDigitOtp(code)) {
    return res.status(400).json({ error: 'Código 2FA inválido' });
  }

  const record = await getTwoFactorRecord(req.auth.sub);
  if (!record || !record.pending_secret) {
    return res.status(400).json({ error: 'No hay una configuración 2FA pendiente' });
  }

  const valid = await verifyTotpCode(record.pending_secret, code);
  if (!valid) {
    return res.status(400).json({ error: 'Código 2FA inválido' });
  }

  await db.execute(
    `UPDATE user_totp
     SET secret = pending_secret,
         pending_secret = NULL,
         is_enabled = 1,
         enabled_at = COALESCE(enabled_at, NOW()),
         last_used_at = NOW()
     WHERE user_id = ?`,
    [req.auth.sub]
  );

  return res.json({ ok: true, enabled: true });
});

app.post('/auth/2fa/disable', authMiddleware, async (req, res) => {
  const code = normalizeOtpCode(req.body.code);
  if (!code) {
    return res.status(400).json({ error: 'Código 2FA requerido' });
  }

  if (!isSixDigitOtp(code)) {
    return res.status(400).json({ error: 'Código 2FA inválido' });
  }

  const record = await getTwoFactorRecord(req.auth.sub);
  if (!record || !record.is_enabled || !record.secret) {
    return res.status(400).json({ error: 'El 2FA no está activado' });
  }

  const valid = await verifyTotpCode(record.secret, code);
  if (!valid) {
    return res.status(400).json({ error: 'Código 2FA inválido' });
  }

  await db.execute(
    `UPDATE user_totp
     SET secret = NULL,
         pending_secret = NULL,
         is_enabled = 0,
         enabled_at = NULL,
         last_used_at = NULL
     WHERE user_id = ?`,
    [req.auth.sub]
  );

  return res.json({ ok: true, enabled: false });
});

app.get('/auth/me', authMiddleware, async (req, res) => {
  const user = await fetchUserById(req.auth.sub);

  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  return res.json({
    ...user,
    two_factor_enabled: await isTwoFactorEnabled(req.auth.sub)
  });
});

app.post('/auth/logout', authMiddleware, async (req, res) => {
  await db.execute(
    'UPDATE user_sessions SET revoked_at = NOW() WHERE id = ? AND user_id = ?',
    [req.auth.sid, req.auth.sub]
  );

  return res.json({ ok: true });
});

app.get('/protected/summary', authMiddleware, async (req, res) => {
  const user = await fetchUserById(req.auth.sub);
  return res.json({
    message: 'Ruta protegida accesible solo con middleware de autenticación',
    user: buildUserSnapshot(user)
  });
});

// ========================================
// Subjects Endpoints
// ========================================

app.post('/subjects', authMiddleware, async (req, res) => {
  try {
    const title = String(req.body.title || '').trim();
    const description = String(req.body.description || '').trim();
    const icon = String(req.body.icon || 'Book').trim();

    if (!title) {
      return res.status(400).json({ error: 'El título es obligatorio' });
    }

    // Encrypt title and description
    const titleEncrypted = encrypt(title);
    const descriptionEncrypted = description ? encrypt(description) : null;

    const [result] = await db.execute(
      `INSERT INTO subjects (user_id, title_encrypted, description_encrypted, icon)
       VALUES (?, ?, ?, ?)`,
      [req.auth.sub, titleEncrypted, descriptionEncrypted, icon]
    );

    const [rows] = await db.execute(
      `SELECT id, user_id, title_encrypted, description_encrypted, icon, created_at, updated_at
       FROM subjects
       WHERE id = ?
       LIMIT 1`,
      [result.insertId]
    );

    const subject = rows[0];
    
    return res.status(201).json({
      id: subject.id,
      title: decrypt(subject.title_encrypted),
      description: subject.description_encrypted ? decrypt(subject.description_encrypted) : '',
      icon: subject.icon || 'Book',
      created_at: subject.created_at,
      updated_at: subject.updated_at
    });
  } catch (error) {
    console.error('Error al crear materia:', error);
    return res.status(500).json({ error: 'Error al crear la materia' });
  }
});

app.get('/subjects', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, user_id, title_encrypted, description_encrypted, icon, created_at, updated_at
       FROM subjects
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.auth.sub]
    );

    const subjects = rows.map(subject => ({
      id: subject.id,
      title: decrypt(subject.title_encrypted),
      description: subject.description_encrypted ? decrypt(subject.description_encrypted) : '',
      icon: subject.icon || 'Book',
      created_at: subject.created_at,
      updated_at: subject.updated_at
    }));

    return res.json(subjects);
  } catch (error) {
    console.error('Error al obtener materias:', error);
    return res.status(500).json({ error: 'Error al obtener las materias' });
  }
});

app.delete('/subjects/:id', authMiddleware, async (req, res) => {
  try {
    const subjectId = req.params.id;

    // Verify that the subject belongs to the user
    const [rows] = await db.execute(
      `SELECT id FROM subjects WHERE id = ? AND user_id = ? LIMIT 1`,
      [subjectId, req.auth.sub]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Materia no encontrada' });
    }

    await db.execute(
      `DELETE FROM subjects WHERE id = ? AND user_id = ?`,
      [subjectId, req.auth.sub]
    );

    return res.json({ ok: true });
  } catch (error) {
    console.error('Error al eliminar materia:', error);
    return res.status(500).json({ error: 'Error al eliminar la materia' });
  }
});

// ========================================
// Notes Endpoints
// ========================================

app.post('/notes', authMiddleware, async (req, res) => {
  try {
    const subjectId = req.body.subjectId;
    const title = String(req.body.title || '').trim();
    const content = String(req.body.content || '').trim();
    const imageDataUrl = normalizeNoteImageDataUrl(req.body.imageDataUrl);

    if (!subjectId) {
      return res.status(400).json({ error: 'El ID de la materia es obligatorio' });
    }

    if (!title) {
      return res.status(400).json({ error: 'El título es obligatorio' });
    }

    if (!content) {
      return res.status(400).json({ error: 'El contenido es obligatorio' });
    }

    // Verify that the subject belongs to the user
    const [subjectRows] = await db.execute(
      `SELECT id FROM subjects WHERE id = ? AND user_id = ? LIMIT 1`,
      [subjectId, req.auth.sub]
    );

    if (subjectRows.length === 0) {
      return res.status(404).json({ error: 'Materia no encontrada' });
    }

    // Encrypt title and content
    const titleEncrypted = encrypt(title);
    const contentEncrypted = encrypt(content);
    const imageEncrypted = imageDataUrl ? encrypt(imageDataUrl) : null;

    const [result] = await db.execute(
      `INSERT INTO notes (user_id, subject_id, title_encrypted, content_encrypted, image_encrypted)
       VALUES (?, ?, ?, ?, ?)`,
      [req.auth.sub, subjectId, titleEncrypted, contentEncrypted, imageEncrypted]
    );

    const [rows] = await db.execute(
      `SELECT id, user_id, subject_id, title_encrypted, content_encrypted, image_encrypted, created_at, updated_at
       FROM notes
       WHERE id = ?
       LIMIT 1`,
      [result.insertId]
    );

    const note = rows[0];
    
    return res.status(201).json({
      id: note.id,
      subjectId: note.subject_id,
      title: decrypt(note.title_encrypted),
      content: decrypt(note.content_encrypted),
      imageDataUrl: note.image_encrypted ? decrypt(note.image_encrypted) : '',
      created_at: note.created_at,
      updated_at: note.updated_at
    });
  } catch (error) {
    if (error.message && (error.message.includes('Formato de imagen') || error.message.includes('Tipo de imagen') || error.message.includes('tamano permitido'))) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error al crear nota:', error);
    return res.status(500).json({ error: 'Error al crear la nota' });
  }
});

app.get('/notes/subject/:subjectId', authMiddleware, async (req, res) => {
  try {
    const subjectId = req.params.subjectId;

    // Verify that the subject belongs to the user
    const [subjectRows] = await db.execute(
      `SELECT id FROM subjects WHERE id = ? AND user_id = ? LIMIT 1`,
      [subjectId, req.auth.sub]
    );

    if (subjectRows.length === 0) {
      return res.status(404).json({ error: 'Materia no encontrada' });
    }

    const [rows] = await db.execute(
      `SELECT id, user_id, subject_id, title_encrypted, content_encrypted, image_encrypted, created_at, updated_at
       FROM notes
       WHERE subject_id = ? AND user_id = ?
       ORDER BY updated_at DESC`,
      [subjectId, req.auth.sub]
    );

    const notes = rows.map(note => ({
      id: note.id,
      subjectId: note.subject_id,
      title: decrypt(note.title_encrypted),
      content: decrypt(note.content_encrypted),
      imageDataUrl: note.image_encrypted ? decrypt(note.image_encrypted) : '',
      created_at: note.created_at,
      updated_at: note.updated_at
    }));

    return res.json(notes);
  } catch (error) {
    console.error('Error al obtener notas:', error);
    return res.status(500).json({ error: 'Error al obtener las notas' });
  }
});

app.get('/notes/:id', authMiddleware, async (req, res) => {
  try {
    const noteId = req.params.id;

    const [rows] = await db.execute(
      `SELECT id, user_id, subject_id, title_encrypted, content_encrypted, image_encrypted, created_at, updated_at
       FROM notes
       WHERE id = ? AND user_id = ?
       LIMIT 1`,
      [noteId, req.auth.sub]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }

    const note = rows[0];
    
    return res.json({
      id: note.id,
      subjectId: note.subject_id,
      title: decrypt(note.title_encrypted),
      content: decrypt(note.content_encrypted),
      imageDataUrl: note.image_encrypted ? decrypt(note.image_encrypted) : '',
      created_at: note.created_at,
      updated_at: note.updated_at
    });
  } catch (error) {
    console.error('Error al obtener nota:', error);
    return res.status(500).json({ error: 'Error al obtener la nota' });
  }
});

app.put('/notes/:id', authMiddleware, async (req, res) => {
  try {
    const noteId = req.params.id;
    const title = String(req.body.title || '').trim();
    const content = String(req.body.content || '').trim();
    const imageDataUrl = normalizeNoteImageDataUrl(req.body.imageDataUrl);

    if (!title) {
      return res.status(400).json({ error: 'El título es obligatorio' });
    }

    if (!content) {
      return res.status(400).json({ error: 'El contenido es obligatorio' });
    }

    // Verify that the note belongs to the user
    const [noteRows] = await db.execute(
      `SELECT id FROM notes WHERE id = ? AND user_id = ? LIMIT 1`,
      [noteId, req.auth.sub]
    );

    if (noteRows.length === 0) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }

    // Encrypt title and content
    const titleEncrypted = encrypt(title);
    const contentEncrypted = encrypt(content);
    const imageEncrypted = imageDataUrl ? encrypt(imageDataUrl) : null;

    await db.execute(
      `UPDATE notes
       SET title_encrypted = ?, content_encrypted = ?, image_encrypted = ?, updated_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [titleEncrypted, contentEncrypted, imageEncrypted, noteId, req.auth.sub]
    );

    const [rows] = await db.execute(
      `SELECT id, user_id, subject_id, title_encrypted, content_encrypted, image_encrypted, created_at, updated_at
       FROM notes
       WHERE id = ?
       LIMIT 1`,
      [noteId]
    );

    const note = rows[0];
    
    return res.json({
      id: note.id,
      subjectId: note.subject_id,
      title: decrypt(note.title_encrypted),
      content: decrypt(note.content_encrypted),
      imageDataUrl: note.image_encrypted ? decrypt(note.image_encrypted) : '',
      created_at: note.created_at,
      updated_at: note.updated_at
    });
  } catch (error) {
    if (error.message && (error.message.includes('Formato de imagen') || error.message.includes('Tipo de imagen') || error.message.includes('tamano permitido'))) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error al actualizar nota:', error);
    return res.status(500).json({ error: 'Error al actualizar la nota' });
  }
});

app.delete('/notes/:id', authMiddleware, async (req, res) => {
  try {
    const noteId = req.params.id;

    // Verify that the note belongs to the user
    const [rows] = await db.execute(
      `SELECT id FROM notes WHERE id = ? AND user_id = ? LIMIT 1`,
      [noteId, req.auth.sub]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }

    await db.execute(
      `DELETE FROM notes WHERE id = ? AND user_id = ?`,
      [noteId, req.auth.sub]
    );

    return res.json({ ok: true });
  } catch (error) {
    console.error('Error al eliminar nota:', error);
    return res.status(500).json({ error: 'Error al eliminar la nota' });
  }
});

// ========================================
// Password Manager Endpoints
// ========================================

app.post('/passwords', authMiddleware, async (req, res) => {
  try {
    const title = String(req.body.title || '').trim();
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');
    const url = normalizeUrlField(req.body.url);
    const notes = normalizeOptionalEncryptedField(req.body.notes, 4000, 'Las notas');

    if (!title) {
      return res.status(400).json({ error: 'El nombre de la entrada es obligatorio' });
    }

    if (title.length > 160) {
      return res.status(400).json({ error: 'El nombre de la entrada no puede superar los 160 caracteres' });
    }

    if (!username) {
      return res.status(400).json({ error: 'El usuario o email es obligatorio' });
    }

    if (username.length > 190) {
      return res.status(400).json({ error: 'El usuario o email no puede superar los 190 caracteres' });
    }

    if (!password) {
      return res.status(400).json({ error: 'La contraseña es obligatoria' });
    }

    if (password.length > 512) {
      return res.status(400).json({ error: 'La contraseña no puede superar los 512 caracteres' });
    }

    const [result] = await db.execute(
      `INSERT INTO password_entries
        (user_id, title_encrypted, username_encrypted, password_encrypted, url_encrypted, notes_encrypted)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.auth.sub,
        encrypt(title),
        encrypt(username),
        encrypt(password),
        url ? encrypt(url) : null,
        notes ? encrypt(notes) : null
      ]
    );

    const [rows] = await db.execute(
      `SELECT id, user_id, title_encrypted, username_encrypted, password_encrypted, url_encrypted, notes_encrypted, created_at, updated_at
       FROM password_entries
       WHERE id = ? AND user_id = ?
       LIMIT 1`,
      [result.insertId, req.auth.sub]
    );

    return res.status(201).json(mapPasswordEntryResponse(rows[0]));
  } catch (error) {
    if (error.message && (error.message.includes('URL') || error.message.includes('máximo permitido'))) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error al crear entrada de password:', error);
    return res.status(500).json({ error: 'Error al crear la entrada de password' });
  }
});

app.get('/passwords', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, user_id, title_encrypted, username_encrypted, password_encrypted, url_encrypted, notes_encrypted, created_at, updated_at
       FROM password_entries
       WHERE user_id = ?
       ORDER BY updated_at DESC`,
      [req.auth.sub]
    );

    return res.json(rows.map(mapPasswordEntryResponse));
  } catch (error) {
    console.error('Error al listar passwords:', error);
    return res.status(500).json({ error: 'Error al obtener las entradas de password' });
  }
});

app.get('/passwords/:id', authMiddleware, async (req, res) => {
  try {
    const passwordId = req.params.id;
    const [rows] = await db.execute(
      `SELECT id, user_id, title_encrypted, username_encrypted, password_encrypted, url_encrypted, notes_encrypted, created_at, updated_at
       FROM password_entries
       WHERE id = ? AND user_id = ?
       LIMIT 1`,
      [passwordId, req.auth.sub]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Entrada de password no encontrada' });
    }

    return res.json(mapPasswordEntryResponse(rows[0]));
  } catch (error) {
    console.error('Error al obtener entrada de password:', error);
    return res.status(500).json({ error: 'Error al obtener la entrada de password' });
  }
});

app.put('/passwords/:id', authMiddleware, async (req, res) => {
  try {
    const passwordId = req.params.id;
    const title = String(req.body.title || '').trim();
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');
    const url = normalizeUrlField(req.body.url);
    const notes = normalizeOptionalEncryptedField(req.body.notes, 4000, 'Las notas');

    if (!title) {
      return res.status(400).json({ error: 'El nombre de la entrada es obligatorio' });
    }

    if (title.length > 160) {
      return res.status(400).json({ error: 'El nombre de la entrada no puede superar los 160 caracteres' });
    }

    if (!username) {
      return res.status(400).json({ error: 'El usuario o email es obligatorio' });
    }

    if (username.length > 190) {
      return res.status(400).json({ error: 'El usuario o email no puede superar los 190 caracteres' });
    }

    if (!password) {
      return res.status(400).json({ error: 'La contraseña es obligatoria' });
    }

    if (password.length > 512) {
      return res.status(400).json({ error: 'La contraseña no puede superar los 512 caracteres' });
    }

    const [existingRows] = await db.execute(
      `SELECT id
       FROM password_entries
       WHERE id = ? AND user_id = ?
       LIMIT 1`,
      [passwordId, req.auth.sub]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Entrada de password no encontrada' });
    }

    await db.execute(
      `UPDATE password_entries
       SET title_encrypted = ?,
           username_encrypted = ?,
           password_encrypted = ?,
           url_encrypted = ?,
           notes_encrypted = ?,
           updated_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [
        encrypt(title),
        encrypt(username),
        encrypt(password),
        url ? encrypt(url) : null,
        notes ? encrypt(notes) : null,
        passwordId,
        req.auth.sub
      ]
    );

    const [rows] = await db.execute(
      `SELECT id, user_id, title_encrypted, username_encrypted, password_encrypted, url_encrypted, notes_encrypted, created_at, updated_at
       FROM password_entries
       WHERE id = ? AND user_id = ?
       LIMIT 1`,
      [passwordId, req.auth.sub]
    );

    return res.json(mapPasswordEntryResponse(rows[0]));
  } catch (error) {
    if (error.message && (error.message.includes('URL') || error.message.includes('máximo permitido'))) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error al actualizar entrada de password:', error);
    return res.status(500).json({ error: 'Error al actualizar la entrada de password' });
  }
});

app.delete('/passwords/:id', authMiddleware, async (req, res) => {
  try {
    const passwordId = req.params.id;

    const [rows] = await db.execute(
      `SELECT id
       FROM password_entries
       WHERE id = ? AND user_id = ?
       LIMIT 1`,
      [passwordId, req.auth.sub]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Entrada de password no encontrada' });
    }

    await db.execute(
      `DELETE FROM password_entries
       WHERE id = ? AND user_id = ?`,
      [passwordId, req.auth.sub]
    );

    return res.json({ ok: true, message: 'Entrada eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar entrada de password:', error);
    return res.status(500).json({ error: 'Error al eliminar la entrada de password' });
  }
});

// ========================================
// Health & Admin Endpoints
// ========================================

app.get('/health/db', async (req, res) => {
  try {
    await db.query('SELECT 1 AS ok');
    return res.json({ ok: true, database: 'connected' });
  } catch (error) {
    return res.status(500).json({ ok: false, database: 'disconnected', error: error.message });
  }
});

app.get('/users', authMiddleware, async (req, res) => {
  try {
    const [results] = await db.query(
      'SELECT id, email, display_name, is_active, last_login_at, created_at FROM users ORDER BY id DESC'
    );
    return res.json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, async () => {
  try {
    await ensureDatabaseSchema();
    await db.query('SELECT 1');
    console.log('MySQL conectado');
  } catch (error) {
    console.error('Error al conectar MySQL:', error.message);
  }

  console.log(`Servidor en puerto ${PORT}`);
});
