// In backend/routes/settings.js

const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all settings routes
router.use(authMiddleware);

// Change password
router.post('/change-password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;
  
  try {
    // Get current user with password
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error changing password' });
  }
});

// Save API settings
router.post('/api-settings', async (req, res) => {
  const userId = req.user.id;
  const { transcriptionService, transcriptionApiKey, llmService, llmApiKey } = req.body;
  
  try {
    // Check if settings already exist
    const settingsResult = await db.query(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [userId]
    );
    
    // If settings exist, update them
    if (settingsResult.rows.length > 0) {
      await db.query(
        `UPDATE user_settings SET 
        transcription_service = $1, 
        transcription_api_key = $2,
        llm_service = $3,
        llm_api_key = $4
        WHERE user_id = $5`,
        [transcriptionService, transcriptionApiKey, llmService, llmApiKey, userId]
      );
    } else {
      // If settings don't exist, create them
      await db.query(
        `INSERT INTO user_settings 
        (user_id, transcription_service, transcription_api_key, llm_service, llm_api_key) 
        VALUES ($1, $2, $3, $4, $5)`,
        [userId, transcriptionService, transcriptionApiKey, llmService, llmApiKey]
      );
    }
    
    res.status(200).json({ message: 'API settings saved successfully' });
  } catch (error) {
    console.error('Error saving API settings:', error);
    res.status(500).json({ message: 'Server error saving API settings' });
  }
});

// Get API settings
router.get('/api-settings', async (req, res) => {
  const userId = req.user.id;
  
  try {
    const settingsResult = await db.query(
      'SELECT transcription_service, llm_service FROM user_settings WHERE user_id = $1',
      [userId]
    );
    
    if (settingsResult.rows.length === 0) {
      return res.status(200).json({
        transcriptionService: 'openai',
        llmService: 'openai'
      });
    }
    
    const settings = settingsResult.rows[0];
    
    res.status(200).json({
      transcriptionService: settings.transcription_service,
      llmService: settings.llm_service
    });
  } catch (error) {
    console.error('Error fetching API settings:', error);
    res.status(500).json({ message: 'Server error fetching API settings' });
  }
});

module.exports = router;