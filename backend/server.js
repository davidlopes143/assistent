const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'planner-secret-key-2024';
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Auth middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Register
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password are required' });

  const hashed = bcrypt.hashSync(password, 10);
  try {
    const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    const result = stmt.run(name, email, hashed);
    const token = jwt.sign({ id: result.lastInsertRowid, name, email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: result.lastInsertRowid, name, email } });
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Email already registered' });
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid email or password' });

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// Get activities
app.get('/api/activities', auth, (req, res) => {
  const activities = db.prepare(
    'SELECT * FROM activities WHERE user_id = ? ORDER BY due_date ASC'
  ).all(req.user.id);
  res.json(activities);
});

// Create activity
app.post('/api/activities', auth, (req, res) => {
  const { title, description, due_date } = req.body;
  if (!title || !due_date) return res.status(400).json({ error: 'Title and due date are required' });

  const result = db.prepare(
    'INSERT INTO activities (user_id, title, description, due_date) VALUES (?, ?, ?, ?)'
  ).run(req.user.id, title, description || '', due_date);

  const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(activity);
});

// Update activity
app.put('/api/activities/:id', auth, (req, res) => {
  const { title, description, due_date, status } = req.body;
  const activity = db.prepare('SELECT * FROM activities WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!activity) return res.status(404).json({ error: 'Activity not found' });

  db.prepare(
    'UPDATE activities SET title = ?, description = ?, due_date = ?, status = ? WHERE id = ?'
  ).run(
    title ?? activity.title,
    description ?? activity.description,
    due_date ?? activity.due_date,
    status ?? activity.status,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// Delete activity
app.delete('/api/activities/:id', auth, (req, res) => {
  const activity = db.prepare('SELECT * FROM activities WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!activity) return res.status(404).json({ error: 'Activity not found' });

  db.prepare('DELETE FROM activities WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
