const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { OpenAI } = require('openai');
const db = require('../db');


// Define uploadsDir based on environment
const uploadsDir = process.env.NODE_ENV === 'production'
  ? '/tmp/uploads' // Render provides /tmp for file storage
  : path.join(__dirname, '../uploads');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use the environment-aware path
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const uploadDir = path.join(__dirname, '../uploads');
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });

const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /mp3|wav|m4a|ogg|mp4/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'));
    }
  }
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Get all meetings
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT m.*, c.name as client_name 
      FROM meetings m 
      JOIN clients c ON m.client_id = c.id 
      ORDER BY m.meeting_date DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ message: 'Server error fetching meetings' });
  }
});

// Get meetings by client ID
router.get('/client/:clientId', async (req, res) => {
  const { clientId } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM meetings WHERE client_id = $1 ORDER BY meeting_date DESC',
      [clientId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(`Error fetching meetings for client ${clientId}:`, error);
    res.status(500).json({ message: 'Server error fetching client meetings' });
  }
});

// Get meeting by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const meetingResult = await db.query(`
      SELECT m.*, c.name as client_name 
      FROM meetings m 
      JOIN clients c ON m.client_id = c.id 
      WHERE m.id = $1
    `, [id]);
    
    if (meetingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    const transcriptResult = await db.query(
      'SELECT * FROM transcripts WHERE meeting_id = $1',
      [id]
    );
    
    const meeting = meetingResult.rows[0];
    meeting.transcript = transcriptResult.rows[0] || null;
    
    res.json(meeting);
  } catch (error) {
    console.error(`Error fetching meeting ${id}:`, error);
    res.status(500).json({ message: 'Server error fetching meeting' });
  }
});

// Create meeting
router.post('/', upload.single('audio_file'), async (req, res) => {
  const { client_id, title, meeting_date, participants } = req.body;
  const created_by = req.session.user.id;
  
  try {
    // Start transaction
    await db.query('BEGIN');
    
    // Create meeting record
    const meetingResult = await db.query(
      `INSERT INTO meetings 
      (client_id, title, meeting_date, participants, created_by, status, audio_file_path) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *`,
      [
        client_id, 
        title, 
        meeting_date, 
        participants, 
        created_by, 
        req.file ? 'processing' : 'pending',
        req.file ? req.file.path : null
      ]
    );
    
    const meeting = meetingResult.rows[0];
    
    // If audio file was uploaded, process it
    if (req.file) {
      // Start transcription process asynchronously
      processAudioFile(meeting.id, req.file.path);
    }
    
    // Commit transaction
    await db.query('COMMIT');
    
    res.status(201).json(meeting);
  } catch (error) {
    // Rollback transaction
    await db.query('ROLLBACK');
    
    console.error('Error creating meeting:', error);
    res.status(500).json({ message: 'Server error creating meeting' });
  }
});

// Update meeting
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { client_id, title, meeting_date, participants, status } = req.body;
  
  try {
    const result = await db.query(
      `UPDATE meetings 
      SET client_id = $1, title = $2, meeting_date = $3, participants = $4, status = $5 
      WHERE id = $6 
      RETURNING *`,
      [client_id, title, meeting_date, participants, status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating meeting ${id}:`, error);
    res.status(500).json({ message: 'Server error updating meeting' });
  }
});

// Upload audio file for existing meeting
router.post('/:id/upload', upload.single('audio_file'), async (req, res) => {
  const { id } = req.params;
  
  if (!req.file) {
    return res.status(400).json({ message: 'No audio file uploaded' });
  }
  
  try {
    // Update meeting with file path and set status to processing
    const result = await db.query(
      'UPDATE meetings SET audio_file_path = $1, status = $2 WHERE id = $3 RETURNING *',
      [req.file.path, 'processing', id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    const meeting = result.rows[0];
    
    // Start transcription process asynchronously
    processAudioFile(meeting.id, req.file.path);
    
    res.json(meeting);
  } catch (error) {
    console.error(`Error uploading audio for meeting ${id}:`, error);
    res.status(500).json({ message: 'Server error uploading audio file' });
  }
});

// Delete meeting
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Get meeting to check for audio file
    const meetingResult = await db.query('SELECT * FROM meetings WHERE id = $1', [id]);
    
    if (meetingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    const meeting = meetingResult.rows[0];
    
    // Delete audio file if exists
    if (meeting.audio_file_path && fs.existsSync(meeting.audio_file_path)) {
      fs.unlinkSync(meeting.audio_file_path);
    }
    
    // Delete meeting record
    await db.query('DELETE FROM meetings WHERE id = $1', [id]);
    
    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error(`Error deleting meeting ${id}:`, error);
    res.status(500).json({ message: 'Server error deleting meeting' });
  }
});

// Process audio file and generate transcript
async function processAudioFile(meetingId, filePath) {
  try {
    // Update meeting status to processing
    await db.query(
      'UPDATE meetings SET status = $1 WHERE id = $2',
      ['processing', meetingId]
    );
    
    // Read the audio file
    const audioFile = fs.createReadStream(filePath);
    
    // Transcribe using OpenAI
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });
    
    const transcriptText = transcription.text;
    
    // Generate analysis with OpenAI
    const analysis = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a financial analyst. Extract hard facts (numbers, dates, commitments, deadlines) and soft facts (opinions, impressions, sentiments) from the following transcript of a financial meeting. Return your response as a JSON object with two properties: 'hard_facts' (array of strings) and 'soft_facts' (array of strings)."
        },
        {
          role: "user",
          content: transcriptText
        }
      ],
    });
    
    // Parse the analysis response
    let hardFacts = [];
    let softFacts = [];
    
    try {
      const analysisContent = analysis.choices[0].message.content;
      const analysisJson = JSON.parse(analysisContent);
      hardFacts = analysisJson.hard_facts || [];
      softFacts = analysisJson.soft_facts || [];
    } catch (err) {
      console.error('Error parsing OpenAI analysis:', err);
      // Fallback to empty arrays if parsing fails
    }
    
    // Save transcript and analysis
    await db.query(
      `INSERT INTO transcripts (meeting_id, full_text, hard_facts, soft_facts) 
      VALUES ($1, $2, $3, $4)`,
      [meetingId, transcriptText, JSON.stringify(hardFacts), JSON.stringify(softFacts)]
    );
    
    // Update meeting status to completed
    await db.query(
      'UPDATE meetings SET status = $1 WHERE id = $2',
      ['completed', meetingId]
    );
  } catch (error) {
    console.error(`Error processing audio file for meeting ${meetingId}:`, error);
    
    // Update meeting status to failed
    await db.query(
      'UPDATE meetings SET status = $1 WHERE id = $2',
      ['failed', meetingId]
    );
  }
}

module.exports = router;