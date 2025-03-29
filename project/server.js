const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to SQLite database
const db = new Database('vendors.db');

// Create vendors table if it doesn't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact TEXT NOT NULL
  )
`).run();

// Create users table if it doesn't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )
`).run();

// Create contracts table if it doesn't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS contracts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'Pending'
  )
`).run();

// Create suppliers table if it doesn't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact TEXT NOT NULL,
    email TEXT NOT NULL
  )
`).run();

// Signup endpoint
app.post('/signup', (req, res) => {
  const { username, password } = req.body;

  // Check if the username already exists
  const userExists = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (userExists) {
    return res.status(400).json({ success: false, message: 'Username already exists' });
  }

  // Insert the new user into the database
  const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
  stmt.run(username, password);
  res.status(201).json({ success: true, message: 'User created successfully' });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Find the user in the database
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);

  if (user) {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid username or password' });
  }
});

// Create a new vendor
app.post('/vendors', (req, res) => {
  const { name, contact } = req.body;
  const stmt = db.prepare('INSERT INTO vendors (name, contact) VALUES (?, ?)');
  const result = stmt.run(name, contact);
  const vendor = { id: result.lastInsertRowid, name, contact };
  res.status(201).json(vendor);
});

// Get all vendors
app.get('/vendors', (req, res) => {
  const vendors = db.prepare('SELECT * FROM vendors').all();
  res.json(vendors);
});

// Update a vendor
app.put('/vendors/:id', (req, res) => {
  const { id } = req.params;
  const { name, contact } = req.body;
  const stmt = db.prepare('UPDATE vendors SET name = ?, contact = ? WHERE id = ?');
  const result = stmt.run(name, contact, id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Vendor not found' });
  }

  const updatedVendor = { id: parseInt(id), name, contact };
  res.json(updatedVendor);
});

// Delete a vendor
app.delete('/vendors/:id', (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare('DELETE FROM vendors WHERE id = ?');
  const result = stmt.run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Vendor not found' });
  }

  res.status(204).send();
});

// Create a new contract
app.post('/contracts', (req, res) => {
  const { title, description } = req.body;
  const stmt = db.prepare('INSERT INTO contracts (title, description) VALUES (?, ?)');
  const result = stmt.run(title, description);
  const contract = { id: result.lastInsertRowid, title, description, status: 'Pending' };
  res.status(201).json(contract);
});

// Get all contracts
app.get('/contracts', (req, res) => {
  const contracts = db.prepare('SELECT * FROM contracts').all();
  res.json(contracts);
});

// Update contract status
app.put('/contracts/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const stmt = db.prepare('UPDATE contracts SET status = ? WHERE id = ?');
  const result = stmt.run(status, id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Contract not found' });
  }

  const updatedContract = { id: parseInt(id), status };
  res.json(updatedContract);
});

// Delete a contract
app.delete('/contracts/:id', (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare('DELETE FROM contracts WHERE id = ?');
  const result = stmt.run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Contract not found' });
  }

  res.status(204).send();
});

// Create a new supplier
app.post('/suppliers', (req, res) => {
  const { name, contact, email } = req.body;

  // Validate input
  if (!name || !contact || !email) {
    return res.status(400).json({ error: 'Name, contact, and email are required' });
  }

  // Insert the new supplier into the database
  const stmt = db.prepare('INSERT INTO suppliers (name, contact, email) VALUES (?, ?, ?)');
  const result = stmt.run(name, contact, email);
  const supplier = { id: result.lastInsertRowid, name, contact, email };
  res.status(201).json(supplier);
});

// Get all suppliers
app.get('/suppliers', (req, res) => {
  const suppliers = db.prepare('SELECT * FROM suppliers').all();
  res.json(suppliers);
});

// Update a supplier
app.put('/suppliers/:id', (req, res) => {
  const { id } = req.params;
  const { name, contact, email } = req.body;

  // Validate input
  if (!name || !contact || !email) {
    return res.status(400).json({ error: 'Name, contact, and email are required' });
  }

  // Update the supplier in the database
  const stmt = db.prepare('UPDATE suppliers SET name = ?, contact = ?, email = ? WHERE id = ?');
  const result = stmt.run(name, contact, email, id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Supplier not found' });
  }

  const updatedSupplier = { id: parseInt(id), name, contact, email };
  res.json(updatedSupplier);
});

// Delete a supplier
app.delete('/suppliers/:id', (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare('DELETE FROM suppliers WHERE id = ?');
  const result = stmt.run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Supplier not found' });
  }

  res.status(204).send();
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});