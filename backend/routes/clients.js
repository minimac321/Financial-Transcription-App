const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all clients
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM clients ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Server error fetching clients' });
  }
});

// Get client by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM clients WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error fetching client ${id}:`, error);
    res.status(500).json({ message: 'Server error fetching client' });
  }
});

// Create client
router.post('/', async (req, res) => {
  const { name, industry, contact_person, email, phone } = req.body;
  const created_by = req.session.user.id;
  
  try {
    const result = await db.query(
      'INSERT INTO clients (name, industry, contact_person, email, phone, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, industry, contact_person, email, phone, created_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ message: 'Server error creating client' });
  }
});

// Update client
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, industry, contact_person, email, phone } = req.body;
  
  try {
    const result = await db.query(
      'UPDATE clients SET name = $1, industry = $2, contact_person = $3, email = $4, phone = $5 WHERE id = $6 RETURNING *',
      [name, industry, contact_person, email, phone, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating client ${id}:`, error);
    res.status(500).json({ message: 'Server error updating client' });
  }
});

// Delete client
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM clients WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error(`Error deleting client ${id}:`, error);
    res.status(500).json({ message: 'Server error deleting client' });
  }
});

module.exports = router;