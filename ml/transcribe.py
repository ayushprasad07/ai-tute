import sys
import subprocess
import os
from faster_whisper import WhisperModel

video_url = sys.argv[1]

audio_path = "audio.mp3"

# 1️⃣ Download audio
subprocess.run([
    sys.executable,
    "-m",
    "yt_dlp",
    "-x",
    "--audio-format",
    "mp3",
    "-o",
    audio_path,
    video_url
])


# 2️⃣ Load Whisper model (first time downloads model)
model = WhisperModel("base", device="cpu")

segments, info = model.transcribe(audio_path)

text = ""

for segment in segments:
    text += segment.text + " "

# 3️⃣ Cleanup
os.remove(audio_path)

print(text.strip())
