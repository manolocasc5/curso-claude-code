const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { validateEmail } = require('../src/validators/emailValidator');

const router = express.Router();

const SALT_ROUNDS = 10;

const insertWithPosition = db.transaction((name, email, passwordHash) => {
  const { maxPosition } = db
    .prepare('SELECT MAX(position) AS maxPosition FROM waitlist')
    .get();
  const position = (maxPosition || 0) + 1;

  db.prepare(
    'INSERT INTO waitlist (name, email, password_hash, position) VALUES (?, ?, ?, ?)'
  ).run(name, email, passwordHash, position);

  return position;
});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email y password son obligatorios' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'El email no tiene un formato válido' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const position = insertWithPosition(name, email, passwordHash);

    return res.status(201).json({ success: true, position });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || /UNIQUE constraint failed/.test(err.message)) {
      return res.status(409).json({ error: 'Ese email ya está registrado' });
    }
    console.error('Error en /register:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email y password son obligatorios' });
  }

  try {
    const user = db.prepare('SELECT * FROM waitlist WHERE email = ?').get(email);
    const passwordMatches = user ? await bcrypt.compare(password, user.password_hash) : false;

    if (!user || !passwordMatches) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ success: true, token });
  } catch (err) {
    console.error('Error en /login:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/me', requireAuth, (req, res) => {
  try {
    const user = db
      .prepare('SELECT name, email, position FROM waitlist WHERE id = ?')
      .get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { total } = db.prepare('SELECT COUNT(*) AS total FROM waitlist').get();

    return res.json({
      name: user.name,
      email: user.email,
      position: user.position,
      total,
    });
  } catch (err) {
    console.error('Error en /me:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
