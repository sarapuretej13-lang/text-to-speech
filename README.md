# 🔊 Text-to-Speech Application

A full-stack web application that converts written text into natural-sounding speech.

**Stack:** React + TypeScript + Tailwind CSS (frontend) · Python Flask + gTTS (backend)

---

## Features

- Enter or paste text (up to 5,000 characters)
- Upload a `.txt` file (drag & drop or browse)
- Live character and word count
- Select from 7 languages: English, Hindi, Gujarati, Marathi, Spanish, French, German
- Speaking speed: Slow 🐢 / Normal 🚶 / Fast 🐇
- Generate speech via the Flask backend
- Play audio directly in the browser
- Download the generated MP3
- Rate limiting (10 requests/minute per IP)
- Full error handling (empty text, over-limit, 429, 503, network failures)

---

## Project Structure

```
text-to-speech/
│
├── backend/
│   ├── app.py                  # Flask app factory
│   ├── routes/
│   │   └── tts_routes.py       # POST /api/tts, GET /api/voices, GET /api/health, POST /api/upload
│   ├── services/
│   │   └── tts_service.py      # gTTS integration + language/voice definitions
│   ├── utils/
│   │   ├── helpers.py          # Audio cleanup utility
│   │   └── rate_limiter.py     # In-memory rate limiter (10 req/min per IP)
│   └── generated_audio/        # Temporary MP3 output (git-ignored)
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── ttsApi.ts           # Axios API calls
│   │   ├── components/
│   │   │   ├── TextInput.tsx
│   │   │   ├── LanguageSelector.tsx
│   │   │   ├── VoiceSelector.tsx
│   │   │   ├── SpeedSelector.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── GenerateButton.tsx
│   │   │   ├── AudioPlayer.tsx
│   │   │   ├── DownloadButton.tsx
│   │   │   └── ErrorMessage.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── .env.development        # Local dev API URL
│   ├── .env.production         # Production API URL (update before deploy)
│   ├── vercel.json             # Vercel deployment config
│   ├── vite.config.ts
│   └── package.json
│
├── render.yaml                 # Render deployment config
├── requirements.txt
├── .env                        # Never commit this
├── .env.example                # Safe reference copy
├── .gitignore
└── README.md
```

---

## Local Development

### Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |

### 1. Backend

```bash
# From the project root
python -m venv venv

# Activate virtual environment
venv\Scripts\activate          # Windows
source venv/bin/activate       # macOS/Linux

pip install -r requirements.txt

python backend/app.py
```

Backend runs on **http://localhost:5000**

### 2. Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

---

## Deployment

### Overview

| Part | Platform | Free Tier |
|------|----------|-----------|
| Backend | [Render](https://render.com) | ✅ Yes |
| Frontend | [Vercel](https://vercel.com) | ✅ Yes |

---

### Step 1 — Push to GitHub

```bash
# From the project root
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/text-to-speech.git
git push -u origin main
```

> Make sure `.env` and `generated_audio/` are in `.gitignore` (they already are).

---

### Step 2 — Deploy Backend on Render

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. Render will auto-detect `render.yaml` — click **Apply**
4. Set these environment variables in the Render dashboard:

| Key | Value |
|-----|-------|
| `FLASK_ENV` | `production` |
| `FRONTEND_URL` | *(leave blank for now — fill in after Step 3)* |

5. Click **Deploy** — wait for it to finish
6. Copy your backend URL — it looks like:
   ```
   https://tts-backend.onrender.com
   ```

---

### Step 3 — Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Set **Root Directory** to `frontend`
4. Add this environment variable in Vercel dashboard:

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://tts-backend.onrender.com/api` |

*(Use your actual Render URL from Step 2)*

5. Click **Deploy** — wait for it to finish
6. Copy your frontend URL — it looks like:
   ```
   https://text-to-speech.vercel.app
   ```

---

### Step 4 — Connect Backend to Frontend (CORS)

Go back to your **Render dashboard** → your backend service → **Environment**:

| Key | Value |
|-----|-------|
| `FRONTEND_URL` | `https://text-to-speech.vercel.app` |

*(Use your actual Vercel URL from Step 3)*

Click **Save** — Render will redeploy automatically.

---

### Step 5 — Done!

Open your Vercel URL in the browser. Your app is live.

---

## API Reference

### `GET /api/health`
```json
{ "status": "ok" }
```

### `GET /api/voices`
Returns all supported languages and voices.

### `POST /api/tts`
**Request:**
```json
{
  "text": "Hello world",
  "language": "en",
  "voice": "en-standard",
  "speed": "normal"
}
```
**Success (201):**
```json
{ "success": true, "audio_url": "/api/audio/abc123.mp3" }
```
**Error responses:** 400, 429, 500, 503

### `POST /api/upload`
Accepts a `.txt` file (multipart/form-data), returns extracted text.

**Success (200):**
```json
{ "success": true, "text": "File contents here..." }
```

### `GET /api/audio/<filename>`
Serves a generated MP3 file.

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Speech created successfully |
| 400 | Invalid request |
| 404 | Audio file not found |
| 429 | Too many requests (rate limited) |
| 500 | Internal server error |
| 503 | TTS service unavailable |

---

## Environment Variables

### Backend (.env)
```env
FLASK_ENV=development
FLASK_DEBUG=1
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env.development)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Frontend (.env.production)
```env
VITE_API_BASE_URL=https://your-tts-backend.onrender.com/api
```

> Never commit `.env` to GitHub. It is already in `.gitignore`.

---

## Supported Languages

| Language | Code |
|----------|------|
| English (US) | `en` |
| Hindi | `hi` |
| Gujarati | `gu` |
| Marathi | `mr` |
| Spanish | `es` |
| French | `fr` |
| German | `de` |

---

## Security

- API keys stored in `.env`, never in frontend code
- All input validated on the backend before calling gTTS
- Rate limiting: 10 requests per minute per IP
- CORS restricted to the configured frontend URL
- Generated audio files are temporary (git-ignored)
- `.env` is in `.gitignore`
