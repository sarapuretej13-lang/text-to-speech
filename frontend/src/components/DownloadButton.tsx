interface Props {
  audioUrl: string;
}

export default function DownloadButton({ audioUrl }: Props) {
  if (!audioUrl) return null;

  return (
    <a
      href={audioUrl}
      download="speech.mp3"
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-600 px-6 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm transition
        hover:bg-indigo-50 active:scale-95"
    >
      {/* Download icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
        />
      </svg>
      Download MP3
    </a>
  );
}
