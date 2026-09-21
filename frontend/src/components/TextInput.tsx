const MAX_CHARS = 5000;

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function TextInput({ value, onChange }: Props) {
  const wordCount = value.trim() === "" ? 0 : value.trim().split(/\s+/).length;
  const charCount = value.length;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="tts-input" className="text-sm font-medium text-gray-700">
        Enter your text
      </label>

      <textarea
        id="tts-input"
        rows={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type or paste your text here…"
        className={`w-full resize-y rounded-lg border px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition
          focus:ring-2 focus:ring-indigo-400
          ${isOverLimit
            ? "border-red-400 bg-red-50 focus:ring-red-400"
            : "border-gray-300 bg-white hover:border-indigo-300"
          }`}
      />

      {/* Stats row */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </span>
        <span className={isOverLimit ? "font-semibold text-red-500" : ""}>
          {charCount} / {MAX_CHARS} characters
        </span>
      </div>
    </div>
  );
}
