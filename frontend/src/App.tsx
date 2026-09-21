import { useEffect, useState } from "react";
import axios from "axios";
import { fetchVoices, generateSpeech, resolveAudioUrl } from "./api/ttsApi";
import type { Language, Voice } from "./api/ttsApi";

import TextInput from "./components/TextInput";
import LanguageSelector from "./components/LanguageSelector";
import VoiceSelector from "./components/VoiceSelector";
import SpeedSelector from "./components/SpeedSelector";
import type { Speed } from "./components/SpeedSelector";
import FileUpload from "./components/FileUpload";
import GenerateButton from "./components/GenerateButton";
import AudioPlayer from "./components/AudioPlayer";
import DownloadButton from "./components/DownloadButton";
import ErrorMessage from "./components/ErrorMessage";

const MAX_CHARS = 5000;

export default function App() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [speed, setSpeed] = useState<Speed>("normal");
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  // Fetch languages/voices on mount
  useEffect(() => {
    fetchVoices()
      .then(setLanguages)
      .catch(() => setError("Could not load voices. Make sure the backend is running."));
  }, []);

  // Reset voice when language changes
  useEffect(() => {
    setSelectedVoice("");
    setAudioUrl("");
    setError("");
  }, [selectedLanguage]);

  const availableVoices: Voice[] =
    languages.find((l) => l.code === selectedLanguage)?.voices ?? [];

  const canGenerate =
    text.trim().length > 0 &&
    text.length <= MAX_CHARS &&
    selectedLanguage !== "" &&
    selectedVoice !== "" &&
    !loading;

  async function handleGenerate() {
    setError("");
    setWarning("");
    setAudioUrl("");

    if (!text.trim()) { setError("Please enter some text before generating speech."); return; }
    if (text.length > MAX_CHARS) { setError(`Text exceeds the maximum of ${MAX_CHARS} characters.`); return; }
    if (!selectedLanguage) { setError("Please select a language."); return; }
    if (!selectedVoice) { setError("Please select a voice."); return; }

    setLoading(true);
    try {
      const result = await generateSpeech({
        text,
        language: selectedLanguage,
        voice: selectedVoice,
        speed,
      });

      if (result.success && result.audio_url) {
        setAudioUrl(resolveAudioUrl(result.audio_url));
      } else {
        setError(result.error ?? "An unknown error occurred.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const msg = err.response?.data?.error;
        if (status === 429) {
          setError(msg ?? "Too many requests. Please wait a moment and try again.");
        } else if (status === 503) {
          setError(msg ?? "The Text-to-Speech service is currently unavailable. Please try again later.");
        } else if (status === 400) {
          setError(msg ?? "Invalid request. Please check your input.");
        } else if (status === 500) {
          setError(msg ?? "A server error occurred. Please try again.");
        } else if (!err.response) {
          setError("Cannot connect to the backend. Make sure the Flask server is running on port 5000.");
        } else {
          setError(msg ?? "An unexpected error occurred.");
        }
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setText("");
    setAudioUrl("");
    setError("");
    setWarning("");
    setSelectedLanguage("");
    setSelectedVoice("");
    setSpeed("normal");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 px-4 py-10">
      <div className="mx-auto w-full max-w-xl space-y-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-indigo-700">
            🔊 Text to Speech
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Convert written text into natural-sounding audio
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white px-6 py-8 shadow-md space-y-5">

          {/* File upload */}
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-gray-700">Upload a .txt file</p>
            <FileUpload
              onTextLoaded={(t) => { setText(t); setWarning(""); setError(""); }}
              onWarning={setWarning}
              onError={setError}
            />
          </div>

          {/* Warning (file trimmed) */}
          {warning && (
            <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
              ⚠️ {warning}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <div className="flex-1 border-t border-gray-200" />
            <span>or type below</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          {/* Text input */}
          <TextInput value={text} onChange={setText} />

          {/* Clear button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleClear}
              disabled={!text && !audioUrl && !error && !selectedLanguage}
              className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-200
                hover:border-red-300 hover:text-red-500 transition
                disabled:cursor-not-allowed disabled:opacity-40"
            >
              ✕ Clear all
            </button>
          </div>

          {/* Language + Voice selectors */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <LanguageSelector
              languages={languages}
              selected={selectedLanguage}
              onChange={setSelectedLanguage}
            />
            <VoiceSelector
              voices={availableVoices}
              selected={selectedVoice}
              onChange={setSelectedVoice}
              disabled={!selectedLanguage}
            />
          </div>

          {/* Speed selector */}
          <SpeedSelector value={speed} onChange={setSpeed} />

          {/* Error */}
          <ErrorMessage message={error} />

          {/* Generate */}
          <GenerateButton
            onClick={handleGenerate}
            loading={loading}
            disabled={!canGenerate}
          />

          {/* Audio player + download */}
          {audioUrl && (
            <div className="space-y-3 pt-2">
              <AudioPlayer audioUrl={audioUrl} />
              <DownloadButton audioUrl={audioUrl} />
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400">
          Powered by gTTS &amp; Flask
        </p>
      </div>
    </div>
  );
}
