import os
import time


def cleanup_old_audio(audio_dir: str, max_age_seconds: int = 3600) -> None:
    """
    Delete generated audio files older than max_age_seconds.
    Call this periodically to avoid filling up disk space.
    """
    now = time.time()
    for filename in os.listdir(audio_dir):
        filepath = os.path.join(audio_dir, filename)
        if os.path.isfile(filepath):
            file_age = now - os.path.getmtime(filepath)
            if file_age > max_age_seconds:
                os.remove(filepath)
