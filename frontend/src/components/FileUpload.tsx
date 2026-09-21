import { useRef, useState } from "react";
import axios from "axios";

const UPLOAD_URL = `${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api"}/upload`;

interface Props {
  onTextLoaded: (text: string) => void;
  onWarning: (msg: string) => void;
  onError: (msg: string) => void;
}

export default function FileUpload({ onTextLoaded, onWarning, onError }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");

  async function handleFile(file: File) {
    // Client-side type check
    if (!file.name.endsWith(".txt")) {
      onError("Only .txt files are supported.");
      return;
    }

    setFileName(file.name);
    setUploading(true);
    onError("");
    onWarning("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post<{
        success: boolean;
        text?: string;
        warning?: string;
        error?: string;
      }>(UPLOAD_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success && res.data.text) {
        onTextLoaded(res.data.text);
        if (res.data.warning) onWarning(res.data.warning);
      } else {
        onError(res.data.error ?? "Failed to read the file.");
        setFileName("");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        onError(err.response?.data?.error ?? "Upload failed. Is the backend running?");
      } else {
        onError("An unexpected error occurred during upload.");
      }
      setFileName("");
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-uploaded
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200
        bg-gray-50 px-4 py-5 text-center transition hover:border-indigo-300 hover:bg-indigo-50"
    >
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".txt"
        className="hidden"
        onChange={handleChange}
      />

      {/* Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 text-indigo-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z"
        />
      </svg>

      {uploading ? (
        <p className="text-sm text-indigo-500">Reading {fileName}…</p>
      ) : fileName ? (
        <p className="text-sm text-green-600">✓ {fileName} loaded</p>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            Drag & drop a <span className="font-medium">.txt</span> file here, or
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-md bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white
              hover:bg-indigo-700 transition"
          >
            Browse file
          </button>
          <p className="text-xs text-gray-400">Max 1MB · UTF-8 encoded</p>
        </>
      )}
    </div>
  );
}
