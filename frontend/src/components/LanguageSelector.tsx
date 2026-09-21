import type { Language } from "../api/ttsApi";

interface Props {
  languages: Language[];
  selected: string;
  onChange: (code: string) => void;
}

export default function LanguageSelector({ languages, selected, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="language-select" className="text-sm font-medium text-gray-700">
        Language
      </label>

      <select
        id="language-select"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm outline-none transition
          hover:border-indigo-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400"
      >
        <option value="" disabled>
          Select a language…
        </option>
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
