import axios from "axios";

// In development:  reads from .env.development  → http://localhost:5000/api
// In production:   reads from .env.production   → https://your-app.onrender.com/api
// Can also be set as VITE_API_BASE_URL in Vercel dashboard environment variables
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";

// Derive the backend root (without /api) for serving audio files
const BACKEND_ROOT = BASE_URL.replace(/\/api$/, "");

export interface Voice {
  label: string;
  value: string;
}

export interface Language {
  name: string;
  code: string;
  voices: Voice[];
}

export interface TTSRequest {
  text: string;
  language: string;
  voice: string;
  speed: "slow" | "normal" | "fast";
}

export interface TTSResponse {
  success: boolean;
  audio_url?: string;
  error?: string;
}

/** Fetch available languages and voices from the backend. */
export async function fetchVoices(): Promise<Language[]> {
  const res = await axios.get<Language[]>(`${BASE_URL}/voices`);
  return res.data;
}

/** Send text + voice config to the backend and get an audio URL back. */
export async function generateSpeech(payload: TTSRequest): Promise<TTSResponse> {
  const res = await axios.post<TTSResponse>(`${BASE_URL}/tts`, payload);
  return res.data;
}

/** Build the full URL for an audio file path returned by the backend. */
export function resolveAudioUrl(path: string): string {
  return `${BACKEND_ROOT}${path}`;
}
