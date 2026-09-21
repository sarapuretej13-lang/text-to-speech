export type Speed = "slow" | "normal" | "fast";

interface Props {
  value: Speed;
  onChange: (speed: Speed) => void;
}

const options: { label: string; value: Speed; icon: string }[] = [
  { label: "Slow", value: "slow", icon: "🐢" },
  { label: "Normal", value: "normal", icon: "🚶" },
  { label: "Fast", value: "fast", icon: "🐇" },
];

export default function SpeedSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-gray-700">Speaking Speed</span>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex flex-1 items-center justify-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition
              ${
                value === opt.value
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:text-indigo-600"
              }`}
          >
            <span>{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
