CREATE DATABASE finance_transcription_db;

\c finance_transcription_db;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  surname VARCHAR(100),
  company_name VARCHAR(100),
  industry VARCHAR(100),
  contact_person VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  age INTEGER,
  risk_profile VARCHAR(10),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE meetings (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  meeting_date TIMESTAMP NOT NULL,
  participants TEXT,
  audio_file_path VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transcripts (
  id SERIAL PRIMARY KEY,
  meeting_id INTEGER REFERENCES meetings(id) ON DELETE CASCADE,
  full_text TEXT,
  hard_facts JSONB,
  soft_facts JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);