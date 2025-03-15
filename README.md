# Financial Transcription App

A full-stack application that allows financial professionals to upload meeting recordings, transcribe them using OpenAI, and extract key financial information.

## Features

- User authentication
- Client management
- Meeting scheduling and management
- Audio file uploading and processing
- Automatic transcription using OpenAI
- Analysis of financial meetings (hard facts and soft facts)
- Responsive UI for desktop and mobile

## Tech Stack

- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Frontend**: React
- **AI Integration**: OpenAI API (Whisper for transcription, GPT for analysis)
- **File Handling**: Multer

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- OpenAI API key

### Database Setup

1. Create a PostgreSQL database:

```bash
psql -U postgres
```

2. Run the SQL setup script:

```bash
psql -U postgres -f backend/db/init.sql
```

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with the following variables:

```
PORT=5000
DATABASE_URL=postgres://username:password@localhost:5432/finance_transcription
OPENAI_API_KEY=your_openai_api_key
SESSION_SECRET=your_session_secret
```

4. Start the backend:

```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the frontend:

```bash
npm start
```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Login with the default credentials:
   - Username: admin
   - Password: password
3. Create clients, schedule meetings, and upload audio files for transcription

## Folder Structure

```
finance-transcription-app/
│
├── backend/             # Backend code
│   ├── db/             # Database scripts and connection
│   ├── routes/         # API routes
│   ├── uploads/        # Uploaded audio files
│   └── server.js       # Express server
│
└── frontend/           # React frontend
    ├── public/         # Static files
    └── src/            # React components and logic
        ├── components/ # Reusable components
        └── pages/      # Page components
```

## Authentication

For simplicity, this application uses a basic authentication system with credentials stored in the PostgreSQL database. In a production environment, you would want to:

1. Hash passwords
2. Implement proper token-based authentication
3. Add role-based access control

## License

MIT