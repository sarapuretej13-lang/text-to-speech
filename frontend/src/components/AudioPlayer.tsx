interface Props {
  audioUrl: string;
}

export default function AudioPlayer({ audioUrl }: Props) {
  if (!audioUrl) return null;

  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
      <p className="mb-3 text-sm font-medium text-indigo-700">Generated Audio</p>
      <audio
        key={audioUrl}           /* re-mount when URL changes so it loads fresh */
        controls
        autoPlay
        className="w-full"
        aria-label="Generated speech audio player"
      >
        <source src={audioUrl} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
