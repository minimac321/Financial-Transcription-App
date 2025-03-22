const express = require('express');
const router = express.Router();
const db = require('../db');
const { OpenAI } = require('openai');
const authMiddleware = require('../middleware/auth'); // Import auth middleware

// Apply authMiddleware to protect all client routes
router.use(authMiddleware);


// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

// Generate email summary from transcript
router.post('/generate-email', async (req, res) => {
  console.log('Received request to generate email summary');
  
  try {
    const {
      transcript,
      hardFacts,
      softFacts,
      meetingTitle,
      meetingDate,
      clientName,
      clientCompany,
      userCompany,
      userName,
      transcriptId  // Add this parameter
    } = req.body;

    // Check if email already exists in database
    if (transcriptId) {
      const existingResult = await db.query(
        'SELECT email_content FROM transcripts WHERE id = $1',
        [transcriptId]
      );
      
      if (existingResult.rows.length > 0 && existingResult.rows[0].email_content) {
        console.log('Returning existing email from database');
        return res.json({ email: existingResult.rows[0].email_content });
      }
    }
    
    // Log received data
    console.log('Request data:', {
      meetingTitle,
      clientName,
      hardFactsLength: hardFacts?.length,
      softFactsLength: softFacts?.length
    });
    
    if (!transcript) {
      console.log('Error: Transcript is required');
      return res.status(400).json({ message: 'Transcript is required' });
    }
    
    // Format date
    let formattedDate;
    try {
      formattedDate = new Date(meetingDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.log('Error formatting date:', error);
      formattedDate = 'the recent meeting';
    }
    
    // Prepare hard and soft facts text
    const hardFactsText = hardFacts && hardFacts.length > 0 
      ? `Key facts discussed:\n${hardFacts.map(fact => `- ${fact}`).join('\n')}` 
      : '';
    
    const softFactsText = softFacts && softFacts.length > 0
      ? `Impressions and opinions shared:\n${softFacts.map(fact => `- ${fact}`).join('\n')}` 
      : '';
    
    console.log('Preparing prompt for OpenAI');
    // Create the prompt
    const prompt = `
      You are a financial advisor at ${userCompany || 'Advanced Insight'}. Write a professional follow-up email to ${clientName || 'the client'} from ${clientCompany || clientName || 'the client'} after your meeting titled "${meetingTitle || 'Financial Discussion'}" on ${formattedDate}.
      
      The email should:
      1. Begin with "Hi ${(clientName || 'Client').split(' ')[0]},"
      2. Thank them for their time
      3. Briefly summarize the key points discussed in the meeting
      4. Mention any specific action items or next steps
      5. Express interest in continuing the professional relationship
      6. End with a professional closing
      7. Include a signature with your name (${userName || 'Ryan McCarlie'}) and company (${userCompany || 'Advanced Insight'})
      
      Meeting transcript summary: ${transcript.substring(0, Math.min(500, transcript.length))}
      
      ${hardFactsText}
      
      ${softFactsText}
      
      Make the email concise, professional, and personalized based on the meeting content.
    `;
    
    console.log('Sending request to OpenAI');
    // Make sure OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.log('Error: OpenAI API key is not set');
      return res.status(500).json({ message: 'OpenAI API key is not configured' });
    }
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a professional financial advisor writing a follow-up email." },
        { role: "user", content: prompt }
      ],
      max_tokens: 1000,
    });
    
    console.log('Received response from OpenAI');
    const email = response.choices[0].message.content.trim();

    // After generating the email, save it to the database
    if (transcriptId) {
      await db.query(
        'UPDATE transcripts SET email_content = $1 WHERE id = $2',
        [email, transcriptId]
      );
      console.log('Email saved to database');
    }
    
    res.json({ email });
  } catch (error) {
    console.error('Error generating email:', error);
    res.status(500).json({ 
      message: 'Error generating email summary',
      error: error.message 
    });
  }
});

// Generate summary from transcript
router.post('/generate-summary', async (req, res) => {
  console.log('Received request to generate summary');
  
  try {
    const {
      transcript,
      meetingTitle,
      meetingId,
      transcriptId
    } = req.body;

    // Check if summary already exists in database
    if (transcriptId) {
      const existingResult = await db.query(
        'SELECT summary FROM transcripts WHERE id = $1',
        [transcriptId]
      );
      
      if (existingResult.rows.length > 0 && existingResult.rows[0].summary) {
        console.log('Returning existing summary from database');
        return res.json({ summary: existingResult.rows[0].summary });
      }
    }

    // If no existing summary, generate a new one
    console.log('Generating new summary');
        
    // Log received data
    console.log('Request data:', {
      meetingTitle,
      transcriptLength: transcript?.length
    });
    
    if (!transcript) {
      console.log('Error: Transcript is required');
      return res.status(400).json({ message: 'Transcript is required' });
    }
    
    console.log('Preparing prompt for OpenAI');
    
    // Create the prompt
    const prompt = `
      As a financial analyst, create a concise summary of the following meeting transcript titled "${meetingTitle || 'Financial Discussion'}".
      
      Focus on key financial points, decisions made, action items, and important insights. Keep the summary clear and professional.
      
      Meeting transcript: ${transcript.substring(0, Math.min(3000, transcript.length))}
      
      If the transcript is cut off, please acknowledge that your summary is based on a partial transcript.
      
      Format your summary into paragraphs with clear sections for:
      1. Overview of the discussion
      2. Key financial points and decisions
      3. Action items and next steps (if any)
    `;
    
    console.log('Sending request to OpenAI');
    
    // Make sure OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.log('Error: OpenAI API key is not set');
      return res.status(500).json({ message: 'OpenAI API key is not configured' });
    }
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a professional financial analyst creating meeting summaries." },
        { role: "user", content: prompt }
      ],
      max_tokens: 1000,
    });
    
    console.log('Received response from OpenAI');
    const summary = response.choices[0].message.content.trim();

    // Save summary to database
    if (transcriptId) {
      await db.query(
        'UPDATE transcripts SET summary = $1 WHERE id = $2',
        [summary, transcriptId]
      );
      console.log('Summary saved to database');
    }
    
    // Send the summary content back to the client
    res.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ 
      message: 'Error generating summary',
      error: error.message 
    });
  }
});

module.exports = router;