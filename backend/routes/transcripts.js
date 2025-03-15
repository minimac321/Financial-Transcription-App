const express = require('express');
const router = express.Router();
const db = require('../db');

// Get transcript by meeting ID
router.get('/meeting/:meetingId', async (req, res) => {
  const { meetingId } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM transcripts WHERE meeting_id = $1',
      [meetingId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Transcript not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error fetching transcript for meeting ${meetingId}:`, error);
    res.status(500).json({ message: 'Server error fetching transcript' });
  }
});

// Update transcript
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { full_text, hard_facts, soft_facts } = req.body;
  
  try {
    const result = await db.query(
      `UPDATE transcripts 
      SET full_text = $1, hard_facts = $2, soft_facts = $3
      WHERE id = $4 
      RETURNING *`,
      [full_text, JSON.stringify(hard_facts), JSON.stringify(soft_facts), id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Transcript not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating transcript ${id}:`, error);
    res.status(500).json({ message: 'Server error updating transcript' });
  }
});

module.exports = router;