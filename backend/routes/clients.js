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
  const { name, surname, company_name, industry, email, phone, age, risk_profile } = req.body;
  const created_by = req.session.user.id;
  console.log(`(POST) Created Client ${req.body}`);

  
  try {
    const result = await db.query(
      `INSERT INTO clients 
      (name, surname, company_name, industry, email, phone, age, risk_profile, created_by) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *`,
      [name, surname, company_name, industry, email, phone, age, risk_profile, created_by]
    );
    res.status(201).json(result.rows[0]);
    console.log(`(POST) Created Client ${name} ${surname}`);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ message: 'Server error creating client' });
  }
});

// Update client
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`(PUT) Created Client ${req.body}`);
  
  const { name, surname, company_name, industry, email, phone, age, risk_profile } = req.body;
  
  try {
    const result = await db.query(
      `UPDATE clients SET 
      name = $1, surname = $2, company_name = $3, industry = $4, email = $5, phone = $6, age = $7, risk_profile = $8 
      WHERE id = $9 RETURNING *`,
      [name, surname, company_name, industry, email, phone, age, risk_profile, id]
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
    console.log(`Deleting client ${id}:`, error);
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error(`Error deleting client ${id}:`, error);
    res.status(500).json({ message: 'Server error deleting client' });
  }
});

module.exports = router;