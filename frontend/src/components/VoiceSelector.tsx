import type { Voice } from "../api/ttsApi";

interface Props {
  voices: Voice[];
  selected: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export default function VoiceSelector({ voices, selected, onChange, disabled }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="voice-select" className="text-sm font-medium text-gray-700">
        Voice
      </label>

      <select
        id="voice-select"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || voices.length === 0}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm outline-none transition
          hover:border-indigo-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400
          disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
      >
        <option value="" disabled>
          {disabled ? "Select a language first…" : "Select a voice…"}
        </option>
        {voices.map((v) => (
          <option key={v.value} value={v.value}>
            {v.label}
          </option>
        ))}
      </select>
    </div>
  );
}
